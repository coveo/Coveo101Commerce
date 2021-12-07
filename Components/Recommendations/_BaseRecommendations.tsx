import React from 'react';
import { headlessEngine_Recommendations } from '../../helpers/Engine';
import { Unsubscribe } from '@coveo/headless';
import { FrequentlyBoughtTogetherList, FrequentlyViewedTogetherList, ProductRecommendationEngine } from '@coveo/headless/product-recommendation';

import RecommendationCard from '../Recommendations/RecommendationCard';
import { Grid, Container, Typography } from '@material-ui/core';
import { IProduct } from '../ProductCard/Product.spec';

interface IRecommendationProps {
  skus?: string[],
  title: string,
  maxNumberOfRecommendations?: number,
}

interface IRecommendationState {
  skus?: string[],
  recommendations: IProduct[],
}

export default class BaseRecommendations extends React.Component<IRecommendationProps> {
  private RecommendationsList: FrequentlyBoughtTogetherList | FrequentlyViewedTogetherList;
  private unsubscribe: Unsubscribe;
  state: IRecommendationState;
  private engine: ProductRecommendationEngine;
  private searchHub: string;
  private builder: any;

  constructor(props, searchHub: string, builder) {
    super(props);
    this.searchHub = searchHub;
    this.builder = builder;
    this.state = {
      skus: [],
      recommendations: [],
    };
  }

  componentDidMount() {
    const rec_options: { options; } = {
      options: {
        maxNumberOfRecommendations: this.props.maxNumberOfRecommendations || 3,
        additionalFields: ['source', 'urihash', 'ec_item_group_id'],
      }
    };

    if (this.props.skus?.length) {
      rec_options.options.skus = this.props.skus;
      rec_options.options.sku = this.props.skus[0]; // some controllers use 'sku' instead of 'skus'
    }

    this.engine = headlessEngine_Recommendations(this.searchHub) as ProductRecommendationEngine;

    this.RecommendationsList = this.builder(this.engine, rec_options);

    this.unsubscribe = this.RecommendationsList.subscribe(() => this.updateState());

    this.setState({ skus: this.props.skus }, () => {
      this.updateRecommendations();
    });
  }

  componentDidUpdate(prevProps) {
    const skus = (this.props.skus || []).join();
    const prevSkus = (prevProps.skus || []).join();
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
      const viewedList = (this.RecommendationsList as FrequentlyViewedTogetherList);
      const boughtList = (this.RecommendationsList as FrequentlyBoughtTogetherList);
      // some controller are using 'setSkus' and some other 'setSku', we are abstracting that with this class.
      // but here, we need to use the proper action for the controller. 
      if (viewedList.setSkus) {
        (this.RecommendationsList as FrequentlyViewedTogetherList).setSkus(skus);
      }
      else if (boughtList.setSku) {
        (this.RecommendationsList as FrequentlyBoughtTogetherList).setSku(skus[0]);
      }
      this.RecommendationsList.refresh();
    }
  }

  private updateState() {
    if (!(this.RecommendationsList?.state?.recommendations)) {
      return false;
    }

    let recommendations = this.RecommendationsList.state.recommendations;
    recommendations = recommendations.map((r, index) => {
      // merge additionalFields into product. 
      return { ...r, ...r.additionalFields, index };
    });
    this.setState({ recommendations });

    return true;
  }

  public render() {
    if ((this.state?.recommendations?.length || 0) < 1) {
      return (null);
    }

    return (
      <Container>
        <Grid item className="recommendations-component">
          <Typography variant="h4">{this.props.title}</Typography>
          <Grid container spacing={2}>
            {
              this.state.recommendations.map((product, index) => {
                return (
                  <Grid key={product.permanentid} item xs={4}>
                    <RecommendationCard engine={this.engine} product={product} index={index} />
                  </Grid>
                );
              })
            }
          </Grid>
        </Grid>
      </Container>
    );
  }

}
