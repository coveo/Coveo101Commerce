import React from 'react';
import Head from 'next/head';
import { withRouter, NextRouter } from 'next/router';

import { Unsubscribe } from '@coveo/headless';

import { Button, Container } from '@mui/material';
import Grid from '@mui/material/Grid';

import CartList from '../Components/Cart/CartList';
import CartRecommendations from '../Components/Recommendations/CartRecommendations';
import store from '../reducers/cartStore';
import { CartState } from '../Components/Cart/cart-state';

import getConfig from 'next/config';
import PopularViewed from '../Components/Recommendations/PopularViewed';

const { publicRuntimeConfig } = getConfig();

interface ICartProps {
  router?: NextRouter;
}

class Cart extends React.Component<ICartProps> {
  state: CartState;
  private unsubscribe: Unsubscribe = () => { };

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

  async goToSearchPage() {
    this.props.router?.push('/search');
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

        <Grid id='generic-store-cart' container>
          <Grid item xs={12} className={classes?.facetColumn}>
            {skus.length > 0 ? <CartList></CartList> : this.cartEmpty()}
          </Grid>
        </Grid>
        {skus.length > 0 && (
          <Grid item className='recommendations-grid cart-recommendations-grid'>
            <CartRecommendations title='To Complement Your Cart' skus={skus} searchHub='Checkout' />
          </Grid>
        )}
      </Container>
    );
  }

  cartEmpty() {
    return (
      <div className='cart-empty__container'>
        <Grid item>
          <h1 style={{ marginBottom: '20px' }} className='cart-list-title'>
            Shopping Bag
          </h1>
          <hr />
          <div className='cart-empty__text'>
            <div>Whoops... Nothing in here.</div>
            <div>Explore around to add items in your shopping bag.</div>
          </div>
          <Button className='cart-confirmation__btn' onClick={() => this.goToSearchPage()}>
            Shop New Arrivals
          </Button>
          <hr />
        </Grid>
        <Grid item className='recommendations-grid cart-recommendations-grid'>
          <PopularViewed title='Customers also viewed' searchHub='Checkout' />
        </Grid>
      </div>
    );
  }
}

export default withRouter(Cart);
