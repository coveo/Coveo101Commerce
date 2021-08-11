import React, { Component } from "react";
import { Card, CardMedia, CardContent, Typography } from "@material-ui/core";
import { Unsubscribe } from "@coveo/headless";
import Price from "../Price";
import Rating from "./Rating";
import AddRemoveProduct from "../Cart/AddRemoveProduct";
import { IProduct, normalizeProduct } from "./Product.spec";
import { NextRouter, withRouter } from "next/router";
import CoveoUA from "../../helpers/CoveoAnalytics";
import { routerPush } from '../../helpers/Context';
import ProductGrouping from "./ProductGrouping";
import RelevanceInspectorResult from "../RelevanceInspector/RelevanceInspectorResult";
import store from '../../reducers/cartStore';

export interface ProductCardProps {
  index?: number;
  router?: NextRouter;
  searchUid: String;
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
    let product: IProduct = (this.props.product);
    this.state = { product };
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
      }
    };
    const { storeId } = store.getState();
    if (storeId) {
      routerOptions.query['storeId'] = storeId;
    }

    CoveoUA.productClick(
      product, this.props.searchUid, isRecommendation, () => routerPush(this.props.router, routerOptions));
  }

  changeColor = (product: IProduct) => {
    //console.log('Change')
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

    let image: string = product.ec_image;
    if (!image && product.ec_images?.length) {
      image = product.ec_images[0];
    }
    if (!image) {
      image = '/missing.svg';
    }

    return (
      <Card className="card-product">
        <CardMedia className={"card__media"} image={image} onClick={() => this.handleProductClick(product)} />
        <CardContent className="card__body">
          <Typography className="CoveoResultLink" onClick={() => this.handleProductClick(product)}>
            {product.ec_name}
          </Typography>
          <div className="card__rating">
            <Rating value={product.ec_rating} /><RelevanceInspectorResult result={product} index={product.index} />

          </div>
          <div className="card__price">
            <Price product={product as any} />
          </div>
          <Typography className={"card__brand"}>
            Brand: {product.ec_brand}
          </Typography>
          {product.ec_fit_size &&
            <Typography className={"card__model"}>
              Fit: {product.ec_fit_size}
            </Typography>
          }
          {product.permanentid != product.ec_item_group_id &&
            <Typography className={"card__model"}>
              Model: {product.ec_item_group_id}
            </Typography>
          }
          <ProductGrouping relatedProducts={relatedProducts} onClick={(e) => this.changeColor(e)} />
          <AddRemoveProduct sku={product.permanentid} product={product} label="In cart:" />
        </CardContent>
      </Card >
    );

  }
}
export default withRouter(ProductCard);

