import React, { Component } from 'react';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';
import { Result, SearchEngine, Unsubscribe } from '@coveo/headless';
import { ProductRecommendationEngine } from '@coveo/headless/product-recommendation';

import Price from '../Price';
import Rating from './Rating';
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
  currentImage: string;
}

export class ProductCard extends Component<ProductCardProps, IProductCardState> {
  state: IProductCardState;
  private unsubscribe: Unsubscribe = () => { };
  private image: string;
  constructor(props) {
    super(props);
    let product: IProduct = this.props.product;
    let images: Array<string> = typeof product.ec_images === 'string' ? [product.ec_images] : product.ec_images;
    this.image = (images && images[0]) || '/missing.svg';
    // normalize Recommendations.
    if ((product as any).additionalFields) {
      product = {
        ...(product as any).additionalFields,
        ...product,
      };
    }
    this.state = {
      product,
      currentImage: this.image,
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

    const searchUid = this.props.engine.state['search']?.response?.searchUid || this.props.engine.state['productRecommendations']?.searchUid;
    if (searchUid) {
      const recommendationStrategy = (isRecommendation && this.props.engine.state as any)?.productRecommendations?.id || '';
      CoveoUA.productClick(product, searchUid, recommendationStrategy, () => routerPush(this.props.router, routerOptions));
    } else {
      routerPush(this.props.router, routerOptions);
    }
  }

  clickRelatedProduct = (product: IProduct) => {
    product = normalizeProduct(product);
    this.handleProductClick(product);
  };

  changeImage = (imageonOnHover: string) => {
    this.setState({ currentImage: imageonOnHover ? imageonOnHover : this.image });
  };

  render() {
    const product: IProduct = this.state.product;
    const categories: string[] = (product.ec_category || []);
    const lastCategory: string = (categories.length && categories.slice(-1)[0]) || '';

    return (
      <Card className='card-product' data-product-id={product.permanentid} data-category={lastCategory} data-brand={product.ec_brand} data-title={product.ec_name}>
        <CardMedia
          className={'card__media'}
          image={this.state.currentImage}
          style={{
            backgroundImage: `url(${this.state.currentImage})`,
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
          <ProductGrouping product={product} onClick={(e) => this.clickRelatedProduct(e)} changeImage={(e) => this.changeImage(e)} />
        </CardContent>
      </Card>
    );
  }
}
export default withRouter(ProductCard);
