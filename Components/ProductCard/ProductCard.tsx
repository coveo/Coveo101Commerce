import React, { Component } from 'react';
import { Card, CardMedia, CardContent, Typography } from '@material-ui/core';
import { loadClickAnalyticsActions, Result, SearchEngine, Unsubscribe } from '@coveo/headless';
import { loadClickAnalyticsActions as logRecommendationClickActions } from '@coveo/headless/recommendation';
import { ProductRecommendationEngine } from '@coveo/headless/product-recommendation';

import Price from '../Price';
import Rating from './Rating';
import AddRemoveProduct from '../Cart/AddRemoveProduct';
import { IProduct, normalizeProduct } from './Product.spec';
import { NextRouter, withRouter } from 'next/router';
import CoveoUA from '../../helpers/CoveoAnalytics';
import { routerPush } from '../../helpers/Context';
import ProductGrouping from './ProductGrouping';
import RelevanceInspectorResult from '../RelevanceInspector/RelevanceInspectorResult';
import store from '../../reducers/cartStore';

export interface ProductCardProps {
  index?: number;
  router?: NextRouter;
  engine: SearchEngine | ProductRecommendationEngine;
  result: Result;
  product: IProduct;
}

export interface IProductCardState {
  product: IProduct;
}

export class ProductCard extends Component<ProductCardProps, IProductCardState> {
  state: IProductCardState;
  private unsubscribe: Unsubscribe = () => { };
  constructor(props) {
    super(props);
    let product: IProduct = this.props.product;

    // normalize Recommendations.
    if ((product as any).additionalFields) {
      product = {
        ...(product as any).additionalFields,
        ...product,
      };
    }
    this.state = {
      product,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.product !== this.props.product) {
      let product = this.props.product;
      this.setState({ product: product });
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleProductClick(product: IProduct, isRecommendation: boolean = false) {
    let currentProductsClicked: IProduct[] = JSON.parse(localStorage.getItem('clickedProducts')) || [];
    if (currentProductsClicked.length > 5) {
      currentProductsClicked.shift();
    }

    currentProductsClicked.push(product);

    const routerOptions = {
      pathname: `/pdp/[sku]`,
      query: {
        sku: product.permanentid,
        model: product.ec_item_group_id,
      },
    };
    const { storeId } = store.getState();
    if (storeId) {
      routerOptions.query['storeId'] = storeId;
    }

    this.logClick(isRecommendation);

    const searchUid = this.props.engine.state['search']?.response?.searchUid || this.props.engine.state['productRecommendations']?.searchUid;
    if (searchUid) {
      CoveoUA.productClick(product, searchUid, isRecommendation, () => routerPush(this.props.router, routerOptions));
    } else {
      routerPush(this.props.router, routerOptions);
    }
  }

  private logClick(isRecommendation: boolean = false) {
    let result = this.props.result;
    if (!result) {
      // ProductRecommendation in Headless do not have an action to log clicks/open
      // We are using Recommendation's logRecommendationOpen() -

      // But, because ProductRecommendations don't have all the fields required for Analytics,
      // we are augmenting them manually here.
      const product = {
        ...this.props.product,
        title: this.props.product.ec_name,
        uniqueId: this.props.product.permanentid,
        uri: this.props.product.clickUri,
        urihash: this.props.product['urihash'],
      };
      result = {
        ...product,
        raw: { ...product }, // analytics will look for some properties under raw.
      };
    }

    if (this.props.engine && this.props) {
      if (isRecommendation) {
        const engineState = this.props.engine.state as any;
        let searchUid = engineState.search?.response?.searchUid;
        if (!searchUid && engineState.productRecommendations?.searchUid) {
          searchUid = engineState.productRecommendations.searchUid;
        }

        // Because of inconsistency in Headless with ProductRecommendations, Recommendations, and Search engines/responses,
        // we store the searchUid in the session to be reused in the Analytics middleware for the Recommendation Engine.
        sessionStorage.setItem('_r_searchQueryUid', searchUid);
        sessionStorage.setItem('_r_originLevel2', engineState.productRecommendations.id);

        const { logRecommendationOpen } = logRecommendationClickActions(this.props.engine as any);
        this.props.engine.dispatch(logRecommendationOpen(result) as any);
      } else {
        // result from Search
        const { logDocumentOpen } = loadClickAnalyticsActions(this.props.engine as any);
        this.props.engine.dispatch(logDocumentOpen(result) as any);
      }
    }
  }

  changeToRelatedProduct = (product: IProduct) => {
    product = normalizeProduct(product);
    this.setState({ product: product });
  };

  render() {
    const product: IProduct = this.state.product;
    const relatedProducts = [];
    // Products in the same group are "folded" under "childResults" in the Search response.
    if (product.childResults != undefined) {
      product.childResults.map((child) => {
        relatedProducts.push(child);
      });
    }

    let images: Array<string> = typeof product.ec_images === 'string' ? [product.ec_images] : product.ec_images;
    let image: string;
    let imgOnHover: string;

    if (images?.length) {
      image = images[0] || '/missing.svg';
      imgOnHover = images[1] || images[0] || '/missing.svg';
    }

    return (
      <Card className='card-product'>
        <CardMedia
          className={'card__media'}
          image={image}
          style={{
            backgroundImage: `url(${image}), url(${imgOnHover})`,
          }}
          onClick={() => this.handleProductClick(product)}
        />
        <CardContent className='card__body'>
          <Typography className={'card__brand'}>Brand: {product.ec_brand}</Typography>
          <Typography className='CoveoResultLink' onClick={() => this.handleProductClick(product)}>
            {product.ec_name}
          </Typography>
          <div className='card__rating'>
            <Rating value={product.ec_rating} />
          </div>
          <div className='card__price'>
            <Price product={product as any} />
            <RelevanceInspectorResult result={product} index={product.index} />
          </div>
          {product.ec_fit_size && <Typography className={'card__model'}>Fit: {product.ec_fit_size}</Typography>}
          {product.permanentid != product.ec_item_group_id && <Typography className={'card__model'}>Model: {product.ec_item_group_id}</Typography>}
          <ProductGrouping relatedProducts={relatedProducts} onClick={(e) => this.changeToRelatedProduct(e)} />
          <div className={'card__add-to-cart'}>
            <AddRemoveProduct sku={product.permanentid} product={product} label='In cart:' />
          </div>
        </CardContent>
      </Card>
    );
  }
}
export default withRouter(ProductCard);
