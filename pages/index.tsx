import React from 'react';
import store from '../reducers/cartStore';
import { Unsubscribe } from '@coveo/headless';
import Head from 'next/head';
import { Container } from '@mui/material';
import { IProduct } from '../Components/ProductCard/Product.spec';
import HeroBanner from '../Components/Layout/HeroBanner';
import FrequentlyViewedSameCategory from '../Components/Recommendations/FrequentlyViewedSameCategory';
import PopularBought from '../Components/Recommendations/PopularBought';
import PopularViewed from '../Components/Recommendations/PopularViewed';

import getConfig from 'next/config';
import HeroBannerFashion from '../Components/Layout/HeroBanner.Fashion';
const { publicRuntimeConfig } = getConfig();

interface IHomepageState {
  cartItems: string[];
  clickedProducts: string[];
  viewedProducts: string[];
}

class HomePage extends React.Component<{}, IHomepageState> {
  private unsubscribe: Unsubscribe = () => { };

  constructor(props) {
    super(props);

    this.state = {
      cartItems: [],
      clickedProducts: [],
      viewedProducts: [],
    };
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => this.updateState_cart());
    if (window && window.localStorage) {
      const products: IProduct[] = JSON.parse(localStorage.getItem('clickedProducts')) || [];

      let clickedProducts = products ? products.map((product) => product.permanentid) : [];
      if (!this._areSameArrays(clickedProducts, this.state.clickedProducts)) {
        // we want to update this state only when new products are added
        this.setState({ clickedProducts }, () => this.updateViewedProducts());
      }
    }
  }

  updateState_cart() {
    let cartItems = store.getState().items.map((cartItem) => cartItem.sku);
    this.setState({ cartItems });
    this.updateViewedProducts();
  }

  updateViewedProducts() {
    // merge clickedProducts and cart.

    let skus: string[] = [...this.state.clickedProducts, ...this.state.cartItems];

    if (skus) {
      skus = Array.from(new Set(skus)); // keep only unique values
      skus = skus.map((sku) => (typeof sku === 'object' ? sku[0] : sku)); // sometimes, skus are added as array
      skus = skus.filter((sku) => sku).filter((sku) => typeof sku === 'string'); // filter out empty values to be safe, and keep only strings.
      if (skus.length < 1) {
        skus = [];
      }
    }

    if (!this._areSameArrays(skus, this.state?.viewedProducts)) {
      this.setState({ viewedProducts: skus });
    }
  }

  render() {
    return (
      <>
        <Head>
          <title>{publicRuntimeConfig.title}</title>
          <meta property='og:title' content='Home' key='title' />
        </Head>

        <div id='generic-store-home'>
          <Container maxWidth='xl' disableGutters>
            {publicRuntimeConfig.scenario === 'fashion' ? <HeroBannerFashion></HeroBannerFashion> : <HeroBanner></HeroBanner>}
            {publicRuntimeConfig.scenario === 'fashion' ? (
              <FrequentlyViewedSameCategory title='Top viewed in Hats' skus={['037145101_185']} searchHub='Home' />
            ) : (
              <>
                <PopularViewed title='Customers also viewed' searchHub='Home' />
                <PopularBought title='Customers also bought' searchHub='Home' />
              </>
            )}
          </Container>
        </div>
      </>
    );
  }

  private _areSameArrays(arr1: string[], arr2: string[]): boolean {
    // using slice() in case array is 'frozen', need to copy it before sorting
    const str1 = (arr1 || []).slice().sort().join();
    const str2 = (arr2 || []).slice().sort().join();
    return str1 === str2;
  }
}

export default HomePage;
