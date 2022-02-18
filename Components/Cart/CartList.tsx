import { Unsubscribe } from '@coveo/headless';
import { Avatar, Button, Grid, Link } from '@mui/material';
import React, { Component } from 'react';
import { NextRouter, withRouter } from 'next/router';
import getConfig from 'next/config';

import store from '../../reducers/cartStore';
import Price, { formatPrice } from '../Price';
import { CartState } from './cart-state';
import AddRemoveProduct from './AddRemoveProduct';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { CartProduct } from '../../api/cart-api-client';
import { deleteProduct, emptyCart } from './cart-actions';
import CoveoUA, { getAnalyticsProductData, emitUV, getVisitorId } from '../../helpers/CoveoAnalytics';
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

    if (publicRuntimeConfig.features?.qubit) {
      emitUV('ecBasketItemAction', {
        product: {
          productId: item.detail.permanentid,
          sku: item.sku,
        },
        action: 'remove',
        quantity: 0,
      });
    }
  }

  updateState() {
    this.setState(store.getState());
  }

  async handleCheckout() {
    const products = store.getState().items.map((item) => {
      return getAnalyticsProductData(item.detail, item.sku, item.quantity);
    });

    const subtotal = products.reduce((acc, cur) => {
      acc += (cur.quantity || 1) * cur.price;
      return acc;
    }, 0);

    const revenue = (subtotal * 1.05).toFixed(2);
    const tax = (subtotal * 0.05).toFixed(2);

    const transactionId = getVisitorId() + '-' + Date.now();

    // DOC: https://docs.coveo.com/en/l39m0327/coveo-for-commerce/measure-a-purchase
    CoveoUA.addProductForPurchase(products);
    CoveoUA.setActionPurchase({
      id: transactionId,
      revenue,
      shipping: 0,
      tax,
    });

    await routerPush(this.props.router, { pathname: '/cart/confirmation', query: { orderId: transactionId } });
    store.dispatch(emptyCart());
  }

  itemTotal(cartItem: CartProduct) {
    const itemPrice = cartItem.detail.ec_promo_price || cartItem.detail.ec_price;
    return formatPrice(itemPrice * cartItem.quantity);
  }

  private renderItem(cartItem: CartProduct) {
    const image = (typeof cartItem.detail.ec_images === 'string' && cartItem.detail.ec_images) || cartItem.detail.ec_images[0];
    const colorLabel = cartItem.detail[publicRuntimeConfig.features?.colorField];
    const size = (cartItem.detail.cat_total_sizes && (cartItem.sku.split('_')[2] || cartItem.productId.split('_')[2])) || undefined;
    //const colorSwatch = cartItem.detail[publicRuntimeConfig.features?.colorSwatchField] || image;

    return (
      <Grid key={cartItem.sku} className='cart-item' container>
        <Grid item>
          <Avatar variant='square' className='cart-item__thumbnail' src={image} />
        </Grid>
        <Grid item sm container>
          <Grid item xs container direction='column' spacing={2}>
            <Grid container>
              <Grid className='cart-item__title' item xs={11}>
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
              </Grid>
              <Grid className='cart-item__title cart-item__remove-btn' item xs={1}>
                <CloseOutlinedIcon onClick={() => this.handleRemoveProduct(cartItem)} />
              </Grid>
            </Grid>
            <Price product={cartItem.detail} />
            <Grid container className='cart-item-details'>
              <Grid className='item-details-grid' item xs={12} sm={6}>
                <span className='item-detail-tl'>Sku:</span>
                <span className='item-detail-value'>{cartItem.sku || cartItem.productId}</span>
              </Grid>
              {size && (
                <Grid className='item-details-grid' item xs={12} sm={6}>
                  <span className='item-detail-tl'>Size:</span>
                  <span className='item-detail-value'>{size}</span>
                </Grid>
              )}
              {colorLabel && (
                <Grid className='item-details-grid' item xs={12} sm={6}>
                  <span className='item-detail-tl'>Color:</span>
                  <span className='item-detail-value'>{colorLabel}</span>
                </Grid>
              )}
              <Grid className='item-details-grid' item xs={12} sm={6}>
                <span className='item-detail-tl'>Total:</span>
                <span className='item-detail-value'>{this.itemTotal(cartItem)}</span>
              </Grid>
            </Grid>
            <Grid item className='cartitem-add-remove-grid'>
              <AddRemoveProduct product={cartItem.detail} sku={cartItem.sku} label='Quantity:' />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  render() {
    const items = this.state.items.map((item) => this.renderItem(item));
    return (
      <div id='cart-list' className='cart-list'>
        <Grid container spacing={8}>
          <Grid item xs={12} sm={8}>
            {this.state.items.length > 0 && (
              <>
                <h1 style={{ marginBottom: '50px' }} className='cart-list-title'>
                  Shopping Bag
                </h1>
                {items}
              </>
            )}
          </Grid>
          {this.state.items.length > 0 && (
            <Grid item xs={12} sm={3}>
              <h1 style={{ marginBottom: '50px' }} className='cart-list-title'>
                Summary
              </h1>
              {this.total()}
            </Grid>
          )}
        </Grid>
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
      <Grid container direction='column' className='cart-total__container'>
        <Grid item className='cart-total-grid'>
          <span className='cart-total'>Total </span>
          <span className='cart-price'>{formatPrice(total * 1.05)}</span>
        </Grid>
        <Grid item className='cart-total-grid'>
          <span className='cart-total-label'>Subtotal </span>
          <span className='cart-total-price'>{formatPrice(total)}</span>
        </Grid>
        <Grid item className='cart-total-grid'>
          <span className='cart-total-label'>Tax </span>
          <span className='cart-total-price'>{formatPrice(total * 0.05)}</span>
        </Grid>
        <Grid item className='cart-total-grid'>
          <span className='cart-total-label'>Delivery </span>
          <span className='cart-total-price'>Free</span>
        </Grid>
        <Grid item>
          <Button id='checkout' className='cart-checkout-btn' disabled={this.state.items.length == 0 ? true : false} onClick={() => this.handleCheckout()} variant='contained' color='primary'>
            <span className='cart-checkout-label'>Checkout</span>
          </Button>
        </Grid>
      </Grid>
    );
  }
}
export default withRouter(CartList);
