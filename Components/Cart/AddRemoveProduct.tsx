import { Unsubscribe } from '@coveo/headless';
import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import AddCircle from '@material-ui/icons/AddCircle';
import RemoveCircle from '@material-ui/icons/RemoveCircle';

import store from '../../reducers/cartStore';
import { addToCart } from './cart-actions';
import { CartProduct } from '../../api/cart-api-client';
import CoveoUA, { getAnalyticsProductData } from '../../helpers/CoveoAnalytics';

export interface IAddRemoveProductProps {
  product?: any;
  sku: string;
  label: string;
}
export interface IAddRemoveProductState {
  count: number;
}

class AddRemoveProduct extends Component<IAddRemoveProductProps, IAddRemoveProductState> {
  private unsubscribe: Unsubscribe = () => { };
  private mounted: boolean;

  constructor(props: any) {
    super(props);
    this.state = {
      count: 0,
    };
  }

  componentDidMount() {
    this.mounted = true; // keeping track manually, some async calls may try to update this state after it's unmounted.
    this.unsubscribe = store.subscribe(() => this.updateState());
    this.updateState();
  }

  componentWillUnmount() {
    this.mounted = false;
    this.unsubscribe();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.sku !== this.props.sku) {
      this.updateState();
    }
  }

  addToCart() {
    this.updateCart(this.state.count + 1);

    const product = getAnalyticsProductData(this.props.product, this.props.sku, this.state.count + 1);
    CoveoUA.addToCart(product);
  }

  removeFromCart() {
    const quantity = Math.max(this.state.count - 1, 0);
    this.updateCart(quantity);

    const product = getAnalyticsProductData(this.props.product, this.props.sku, this.state.count);
    CoveoUA.removeFromCart(product);
  }

  private updateCart(quantity: number) {
    let action = addToCart;
    const actionPayload: CartProduct = {
      sku: this.props.sku,
      quantity,
    };
    if (this.props.product) {
      actionPayload.detail = this.props.product;
    }
    store.dispatch(action(actionPayload));
  }

  updateState() {
    if (!this.mounted) {
      return;
    }
    const state = store.getState();
    const sku = this.props.sku;

    let count = 0;
    const item = state.items.find((cartItem) => cartItem.sku === sku);

    if (item) {
      count += item.quantity;
    }

    this.setState(() => {
      return { count };
    });
  }

  render() {
    if (this.state.count < 1) {
      return (
        <Button className='add-to-cart__btn CoveoResultAddToCart' variant='outlined' color='primary' startIcon={<AddShoppingCartIcon />} onClick={() => this.addToCart()}>
          Add to Cart
        </Button>
      );
    }
    return (
      <div className='add-remove-product'>
        {this.props.label} &nbsp;
        <div className='add-remove-count'>
          <RemoveCircle className='add-remove-count__btn CoveoResultAddToCart-More' onClick={() => this.removeFromCart()} />
          {this.state.count}
          <AddCircle className='add-remove-count__btn CoveoResultAddToCart-Less' onClick={() => this.addToCart()} />
        </div>
      </div>
    );
  }
}
export default AddRemoveProduct;
