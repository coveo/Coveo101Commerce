import React from 'react';
import Head from 'next/head';
import { withRouter, NextRouter } from 'next/router';

import { Unsubscribe } from '@coveo/headless';

import { Container, Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import CartList from '../Components/Cart/CartList';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import CartEmptyButton from '../Components/Cart/CartEmptyButton';

import CartRecommendations from '../Components/Recommendations/CartRecommendations';
import store from '../reducers/cartStore';
import { CartState } from '../Components/Cart/cart-state';
import CoveoUA, { getAnalyticsProductData, getVisitorId } from '../helpers/CoveoAnalytics';

import { emptyCart } from '../Components/Cart/cart-actions';

import { routerPush } from '../helpers/Context';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

const styles = () => ({});

interface ICartProps {
  router?: NextRouter;
}

class Cart extends React.Component<ICartProps> {
  state: CartState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props) {
    super(props);
    this.state = {
      cartId: '',
      items: [],
      storeId: '',
    };
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  updateState() {
    this.setState(store.getState());
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => this.updateState());
    this.updateState();
  }

  handleCheckout() {
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

    store.dispatch(emptyCart());
    routerPush(this.props.router, { pathname: '/cart/confirmation', query: { orderId: transactionId } });
  }

  render() {
    const { classes } = this.props as any;
    const skus = this.state.items.map((item) => item.sku);

    return (
      <Container maxWidth='xl'>
        <Head>
          <title>Cart | {publicRuntimeConfig.title}</title>
          <meta property='og:title' content='Search' key='title' />
        </Head>

        <Grid id='generic-store-cart' container spacing={10}>
          <Grid item xs={9} className={classes.facetColumn}>
            <CartList></CartList>
          </Grid>
          <Grid item xs={3}>
            <br />
            <br />
            <Button id='checkout' disabled={this.state.items.length == 0 ? true : false} onClick={() => this.handleCheckout()} variant='contained' color='primary' startIcon={<AddShoppingCartIcon />}>
              Checkout
            </Button>
            <br />
            <br />
            {this.state.items.length > 0 && <CartEmptyButton />}
          </Grid>
        </Grid>
        <br />
        <br />
        {skus.length > 0 && <CartRecommendations title='Products you may want to see based on your cart' skus={skus} />}
      </Container>
    );
  }
}

export default withStyles(styles)(withRouter(Cart));
