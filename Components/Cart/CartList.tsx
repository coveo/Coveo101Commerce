import { Unsubscribe } from '@coveo/headless';
import { Avatar, Button, Grid, Link, Typography } from '@material-ui/core';
import React, { Component } from 'react';
import { NextRouter, withRouter } from 'next/router';
import getConfig from 'next/config';

import store from '../../reducers/cartStore';
import Price, { formatPrice } from '../Price';
import { CartState } from './cart-state';
import AddRemoveProduct from './AddRemoveProduct';

import RemoveShoppingCartIcon from '@material-ui/icons/RemoveShoppingCart';
import { CartProduct } from '../../api/cart-api-client';
import { deleteProduct } from './cart-actions';
import CoveoUA, { getAnalyticsProductData } from '../../helpers/CoveoAnalytics';
import { routerPush } from '../../helpers/Context';

const { publicRuntimeConfig } = getConfig();

class CartList extends Component<{ router?: NextRouter; }> {
  state: CartState;
  private unsubscribe: Unsubscribe = () => { };

  constructor(props: any) {
    super(props);
    this.state = {
      cartId: '',
      items: [],
      storeId: '',
    };
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => this.updateState());
    this.updateState();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleRemoveProduct(item: CartProduct) {
    store.dispatch(deleteProduct(item));

    const product = getAnalyticsProductData(item.detail, item.sku, 0);
    CoveoUA.removeFromCart(product);
  }

  updateState() {
    this.setState(store.getState());
  }

  private renderItem(cartItem: CartProduct) {
    const image = (typeof cartItem.detail.ec_images === 'string' && cartItem.detail.ec_images) || cartItem.detail.ec_images[0];
    const colorLabel = cartItem.detail[publicRuntimeConfig.features?.colorField];
    const colorSwatch = cartItem.detail[publicRuntimeConfig.features?.colorSwatchField] || image;

    return (
      <Grid key={cartItem.sku} className='cart-item' container>
        <Grid item>
          <Avatar variant='square' className='cart-item__thumbnail' src={image} />
        </Grid>
        <Grid item sm container>
          <Grid item xs container direction='column' spacing={2}>
            <Link
              onClick={() =>
                routerPush(this.props.router, {
                  pathname: `/pdp/[sku]`,
                  query: {
                    sku: cartItem.detail?.ec_product_id,
                    model: cartItem.detail?.ec_item_group_id,
                  },
                })
              }>
              {cartItem.detail.ec_name || cartItem.sku}
            </Link>
            <Typography gutterBottom variant='subtitle1'>
              {colorLabel && <span>Color: {colorLabel}</span>}
              {colorLabel && colorSwatch && (
                <div
                  className='cart-item__swatch facet-color-swatch'
                  style={{
                    backgroundImage: `url(${colorSwatch})`,
                  }}
                  data-src={colorSwatch}></div>
              )}
            </Typography>
            <Typography gutterBottom variant='body2'>
              {cartItem.detail.ec_item_group_id} {cartItem.sku}
            </Typography>
          </Grid>
        </Grid>
        <Grid item style={{ textAlign: 'right' }} id='cartlist-price-qty-grid'>
          <Price product={cartItem.detail} />
          <AddRemoveProduct product={cartItem.detail} sku={cartItem.sku} label='Quantity:' />
          <Button className='cart-item-remove' startIcon={<RemoveShoppingCartIcon />} onClick={() => this.handleRemoveProduct(cartItem)}>
            Remove
          </Button>
        </Grid>
      </Grid>
    );
  }

  render() {
    const items = this.state.items.map((item) => this.renderItem(item));
    return (
      <div id='cart-list' className='cart-list'>
        <h1>Your Cart items</h1>
        <Grid container>{items}</Grid>
        {this.total()}
      </div>
    );
  }

  total() {
    let total = 0;
    this.state.items.forEach((item) => {
      let price = item.detail.ec_promo_price;
      if (price === undefined) {
        price = item.detail.ec_price;
      }
      total += item.quantity * price || 0;
    });
    return (
      <div className='cart-total__container'>
        <div className='cart-total__row'>
          <div className='cart-total-label'>Subtotal: </div>
          <div className='cart-total-price'>{formatPrice(total)}</div>
        </div>
        <div className='cart-total__row'>
          <div className='cart-total-label'>Shipping: </div>
          <div className='cart-total-price'>Free</div>
        </div>
        <div className='cart-total__row'>
          <div className='cart-total-label'>Tax: </div>
          <div className='cart-total-price'>{formatPrice(total * 0.05)}</div>
        </div>
        <div className='cart-total__row'>
          <div className='cart-total-label'>TOTAL: </div>
          <div className='cart-total-price'>{formatPrice(total * 1.05)}</div>
        </div>
      </div>
    );
  }
}
export default withRouter(CartList);
