import { Unsubscribe } from '@coveo/headless';
import React, { Component } from 'react';
import { Button, withStyles } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import AddCircle from '@material-ui/icons/AddCircle';
import RemoveCircle from '@material-ui/icons/RemoveCircle';

import store from '../../reducers/cartStore';
import { addToCart, updateProduct } from './cart-actions';
import { CartProduct } from '../../api/cart-api-client';
import CoveoUA, { getAnalyticsProductData } from "../../helpers/CoveoAnalytics";

export interface IAddRemoveProductProps {
  product?: any,
  sku: string,
  label: string,
}
export interface IAddRemoveProductState {
  count: number,
}

const styles = (theme: Theme) =>
({
  root: {
    marginTop: '5px',
    marginBottom: '5px',
    paddingTop: '5px',
    paddingBottom: '5px',
    cursor: 'default',
  },
  addButton: {
    marginTop: '5px',
    marginBottom: '5px',
    paddingTop: '5px',
    paddingBottom: '5px',
  },
  addRemoveIcon: {
    margin: "0 5px",
    verticalAlign: "bottom",
    cursor: 'pointer',
    "&:hover": {
      color: theme.palette.primary.main
    }
  },
  addRemoveGroup: {
    display: "inline-block",
    whiteSpaces: "nowrap",
    fontSize: '1.1rem',
  },
});

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

    const product = getAnalyticsProductData(this.props.product, this.state.count + 1);
    CoveoUA.addToCart(product);
  }

  removeFromCart() {
    const quantity = Math.max(this.state.count - 1, 0);
    this.updateCart(quantity);

    const product = getAnalyticsProductData(this.props.product, this.state.count);
    CoveoUA.removeFromCart(product);
  }

  private updateCart(quantity: number) {
    let action = addToCart;
    if (!this.props.product) {
      action = updateProduct;
    }
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
    const item = state.items.find(cartItem => (cartItem.sku === sku));

    if (item) {
      count += item.quantity;
    }

    this.setState(() => {
      return { count };
    });
  }

  render() {
    const { classes } = this.props as any;

    if (this.state.count < 1) {
      return <Button className={classes.addButton + ' CoveoResultAddToCart'} variant="outlined" color="primary" startIcon={<AddShoppingCartIcon />} onClick={() => this.addToCart()}>Add to Cart</Button>;
    }
    return (
      <div className={classes.root}>
        {this.props.label} &nbsp;
        <div className={classes.addRemoveGroup}>
          <RemoveCircle className={classes.addRemoveIcon + ' CoveoResultAddToCart-More'} onClick={() => this.removeFromCart()} />
          {this.state.count}
          <AddCircle className={classes.addRemoveIcon + ' CoveoResultAddToCart-Less'} onClick={() => this.addToCart()} />
        </div>
      </div>
    );
  }
}
export default withStyles(styles)(AddRemoveProduct);
