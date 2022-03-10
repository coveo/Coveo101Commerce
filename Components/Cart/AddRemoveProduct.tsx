import { Unsubscribe } from '@coveo/headless';
import React, { Component } from 'react';
import { Button, Grid } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';

import store from '../../reducers/cartStore';
import { addToCart } from './cart-actions';
import { CartProduct } from '../../api/cart-api-client';
import CoveoUA, { getAnalyticsProductData } from '../../helpers/CoveoAnalytics';

export interface IAddRemoveProductProps {
  product?: any;
  sku: string;
  label?: string;
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
    const quantity: number = this.state.count + 1;
    this.updateAndSendAnalytics(quantity);
  }

  removeFromCart() {
    const quantity: number = Math.max(this.state.count - 1, 0);
    this.updateAndSendAnalytics(quantity);
  }

  private updateAndSendAnalytics(quantity: number) {
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
    const hasItems = this.state.count > 0 ? 'add-to-cart__not-empty' : 'add-to-cart__empty';
    return (
      <Grid item className={"add-to-cart__btn-container " + hasItems}>
        <Button
          className='add-to-cart__btn CoveoResultAddToCart'
          variant='outlined'
          color='primary'
          startIcon={<AddShoppingCartIcon className='add-to-cart__btn-icon' />}
          disabled={this.state.count > 0}
          onClick={() => this.addToCart()}>
          <span className='add-to-cart__btn-label'>Add to Bag</span>
        </Button>
        <div className='add-remove-product'>
          {this.props.label && <span className='add-remove-product__label'> {this.props.label} &nbsp; </span>}
          <div className='add-remove-count'>
            <RemoveOutlinedIcon className={'add-remove-count__btn CoveoResultAddToCart-Less'} style={{ marginRight: '10px' }} onClick={() => this.removeFromCart()} />
            {this.state.count}
            <AddOutlinedIcon className='add-remove-count__btn CoveoResultAddToCart-More' style={{ marginLeft: '10px' }} onClick={() => this.addToCart()} />
          </div>
        </div>
      </Grid>
    );
  }
}
export default AddRemoveProduct;
