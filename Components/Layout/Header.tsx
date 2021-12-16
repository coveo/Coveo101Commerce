import React from 'react';
import Image from 'next/image';

import SearchBox from '../Search/SearchBox';
import CartIndicator from '../Cart/CartIndicator';
import Grid from '@material-ui/core/Grid';
import { AppBar, Toolbar, IconButton, Container } from '@material-ui/core';

import { withRouter, NextRouter } from 'next/router';
import { routerPush } from '../../helpers/Context';
import getConfig from 'next/config';
import StoreSelector from '../Stores/StoreSelector';
import { headlessEngine } from '../../helpers/Engine';
import { loadSearchAnalyticsActions, loadSearchActions, Unsubscribe } from '@coveo/headless';
import { setStoreId } from '../Cart/cart-actions';
import store from '../../reducers/cartStore';

import logo from '../../public/logos/coveo_logo.png';
import MegaMenuDropdown from './MegaMenuDropdown';

const { publicRuntimeConfig } = getConfig();

export interface IHeaderState {
  isMenuActive: boolean;
  isStoreMenuActive: boolean;
  store: string;
}

interface IHeaderProps {
  router?: NextRouter;
}

class Header extends React.Component<IHeaderProps, IHeaderState> {
  private unsubscribe: Unsubscribe = () => { };
  private _last_url: string = '';
  constructor(props: any) {
    super(props);
    this.state = {
      store: '-1',
      isMenuActive: false,
      isStoreMenuActive: false,
    };
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => this.updateState());

    this.props.router.events.on('routeChangeComplete', (url) => {
      // using the first word on the path after / to identify the section of the site. 
      const urlRoot = url.split(/\/|\?|#/)[1];
      const pageType = {
        'browse': 'Listing',
        'cart': 'Checkout',
        'pdp': 'PDP',
        'plp': 'Listing',
        'search': 'default',
      }[urlRoot] || 'Home';
      sessionStorage.setItem('pageType', pageType); // for UA events middlewares

      // saving previous, to be used as referrer when sending UA view events
      sessionStorage.setItem('path.previous', sessionStorage.getItem('path.current'));
      sessionStorage.setItem('path.current', window.location.href);
    });
  }

  updateState() {
    const state = store.getState();

    this.setState(() => {
      if (state.storeId != '') {
        return { store: state.storeId };
      }
    });
  }

  private changeStoreId = (storeId) => {
    store.dispatch(setStoreId({ storeId }));
    this.setState({ store: storeId });

    const analyticActions = loadSearchAnalyticsActions(headlessEngine);
    const searchActions = loadSearchActions(headlessEngine);
    headlessEngine.dispatch(searchActions.executeSearch(analyticActions.logInterfaceLoad()));

    const routerOptions = {
      pathname: this.props.router.pathname,
      query: {
        ...this.props.router.query,
      },
    };
    if (storeId) {
      routerOptions.query['storeId'] = storeId;
    }

    //fix url
    routerPush(this.props.router, routerOptions);
  };

  handleStoreClick() {
    this.setState((prevState) => ({ isStoreMenuActive: !prevState.isStoreMenuActive }));
  }

  render() {
    let storeSelector = null;
    if (publicRuntimeConfig.stores) {
      storeSelector = <StoreSelector store={this.state.store} setStore={(e) => this.changeStoreId(e)} />;
    }

    return (
      <AppBar position='sticky' className={'header'}>
        <Container maxWidth='xl'>
          <Toolbar>
            <Grid container alignItems={'center'}>
              <Grid item className='logo-container' style={{ height: '50px', position: 'relative' }} onClick={() => routerPush(this.props.router, { pathname: '/' })}>
                <Image alt='' className='logo' src={publicRuntimeConfig?.logo || logo} layout='fill' objectFit='contain' objectPosition='left' />
                <span className='header-sub-tl'>{publicRuntimeConfig.title}</span>
              </Grid>
              <Grid container item xs alignItems={'center'} justifyContent={'flex-end'}>
                <Grid item xs={6} className='header-el'>
                  <SearchBox />
                </Grid>
                <MegaMenuDropdown />
                <IconButton id='cart-header' className='header-el header-icon header-el__last'>
                  <CartIndicator />
                </IconButton>
              </Grid>
            </Grid>

            {storeSelector}
          </Toolbar>
        </Container>
      </AppBar>
    );
  }
}

export default withRouter(Header);
