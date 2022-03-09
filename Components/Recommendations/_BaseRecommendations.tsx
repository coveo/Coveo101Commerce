/* globals coveoua */

import React from 'react';
import { headlessEngine_Recommendations } from '../../helpers/Engine';
import CoveoUA from '../../helpers/CoveoAnalytics';
import { buildContext, Unsubscribe } from '@coveo/headless';
import { FrequentlyBoughtTogetherList, FrequentlyViewedTogetherList, ProductRecommendationEngine } from '@coveo/headless/product-recommendation';

import RecommendationCard from '../Recommendations/RecommendationCard';
import { Container, Typography } from '@mui/material';
import { IProduct } from '../ProductCard/Product.spec';

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import ArrowBackIos from '@mui/icons-material/ArrowBackIosOutlined';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';

interface IRecommendationProps {
  product?: IProduct;
  searchHub: string;
  skus?: string[];
  title: string;
  maxNumberOfRecommendations?: number;
}

interface IRecommendationState {
  recommendations: IProduct[];
  searchUid: string;
  skus?: string[];
}

function Arrow(props) {
  let className = props.onClick === null ? 'hideArrows' : props.type === 'next' ? 'nextArrow' : 'prevArrow';
  className += ' arrow';
  const char = props.type === 'next' ? <ArrowForwardIosIcon fontSize={'medium'} viewBox='3 2 20 20' /> : <ArrowBackIos fontSize={'medium'} viewBox='3 2 20 20' />;
  return (
    <span className={className} onClick={props.onClick}>
      {char}
    </span>
  );
}

export default class BaseRecommendations extends React.Component<IRecommendationProps> {
  private RecommendationsList: FrequentlyBoughtTogetherList | FrequentlyViewedTogetherList;
  private unsubscribe: Unsubscribe;
  state: IRecommendationState;
  private engine: ProductRecommendationEngine;
  private builder: any;
  private context_gender: string;

  constructor(props, builder) {
    super(props);
    this.builder = builder;
    this.state = {
      recommendations: [],
      searchUid: '',
      skus: [],
    };
    this.context_gender = '';
  }

  componentDidMount() {
    const rec_options: { options; } = {
      options: {
        maxNumberOfRecommendations: this.props.maxNumberOfRecommendations || 10,
        additionalFields: ['source', 'urihash', 'ec_item_group_id'],
      },
    };

    if (this.props.skus?.length) {
      rec_options.options.skus = this.props.skus;
      rec_options.options.sku = this.props.skus[0]; // some controllers use 'sku' instead of 'skus'
    }

    this.engine = headlessEngine_Recommendations(this.props.searchHub) as ProductRecommendationEngine;

    this.RecommendationsList = this.builder(this.engine, rec_options);

    this.unsubscribe = this.RecommendationsList.subscribe(() => this.updateState());

    this.setState({ skus: this.props.skus }, () => {
      this.updateRecommendations();
    });
  }

  componentDidUpdate(prevProps) {
    const skus = (this.props.skus || []).join();
    const prevSkus = (prevProps.skus || []).join();

    const context = buildContext(this.engine);
    if (this.props.product) {
      [
        'cat_categories',
        'ec_brand',
        'ec_category',
        'ec_item_group_id',
        'ec_product_id',
        'permanentid',
      ].forEach(i => context.add(i, this.props.product[i]));

      // add categories as category1, category2, category3.
      const ec_category = this.props.product.ec_category;
      (ec_category || []).forEach((cat, idx) => {
        context.add(`category${idx + 1}`, cat);
      });
    }

    try {
      const customContext = JSON.parse(sessionStorage.getItem('debug_custom_context'));
      Object.entries(customContext).forEach(([key, value]) => {
        context.add(key, value as string);
      });
    }
    catch (e) { /*no-op*/ }

    if (skus !== prevSkus) {
      this.setState({ skus: this.props.skus }, () => {
        this.updateRecommendations();
      });
      return true;
    }

    return false;
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  updateRecommendations() {
    if (this.RecommendationsList) {
      const skus: string[] = this.state.skus;

      // this is for TypeScript validation
      const viewedList = this.RecommendationsList as FrequentlyViewedTogetherList;
      const boughtList = this.RecommendationsList as FrequentlyBoughtTogetherList;
      // some controller are using 'setSkus' and some other 'setSku', we are abstracting that with this class.
      // but here, we need to use the proper action for the controller.
      if (viewedList.setSkus) {
        (this.RecommendationsList as FrequentlyViewedTogetherList).setSkus(skus);
      } else if (boughtList.setSku) {
        (this.RecommendationsList as FrequentlyBoughtTogetherList).setSku(skus[0]);
      }
      this.RecommendationsList.refresh();
    }
  }

  searchUid() {
    return this.engine.state.productRecommendations.searchUid;
  }

  searchImpressions() {
    const searchUid = this.searchUid();
    if (this.RecommendationsList.state.recommendations?.length) {
      this.RecommendationsList.state.recommendations.forEach((product, index) => {
        const product_parsed = CoveoUA.getAnalyticsProductData(product, '', 0, false);
        CoveoUA.impressions({ ...product_parsed, position: index + 1 }, searchUid);
      });

      coveoua('ec:setAction', 'impression');
      coveoua('send', 'event', {
        ...CoveoUA.getOriginsAndCustomData({
          eventType: 'impressions',
          recommendation: this.engine.state.productRecommendations.id,
        }),
        searchHub: this.props.searchHub,
        tab: this.engine.state.productRecommendations.id,
      });
    }
  }

  private updateState() {
    if (!this.RecommendationsList?.state?.recommendations) {
      return false;
    }

    const searchUid = this.searchUid();
    if (searchUid !== this.state.searchUid) {
      let recommendations = this.RecommendationsList.state.recommendations;
      recommendations = recommendations.map((r, index) => {
        // merge additionalFields into product.
        return { ...r, ...r.additionalFields, index };
      });
      this.setState({ recommendations, searchUid });

      this.searchImpressions();
    }

    return true;
  }

  public render() {
    const settings = {
      dots: true,
      infinite: false,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 4,
      nextArrow: <Arrow type='next' />,
      prevArrow: <Arrow type='prev' />,
      responsive: [
        {
          breakpoint: 750,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            initialSlide: 2,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    };
    if ((this.state?.recommendations?.length || 0) < 1) {
      return null;
    }

    return (
      <Container className='recommendations-slider'>
        <Typography className='recommendations-title' align='left' variant='h4'>
          {this.props.title}
        </Typography>
        <Slider {...settings}>
          {this.state.recommendations.map((product, index) => {
            return <RecommendationCard key={product.permanentid} engine={this.engine} product={product} index={index} />;
          })}
        </Slider>
      </Container>
    );
  }
}
