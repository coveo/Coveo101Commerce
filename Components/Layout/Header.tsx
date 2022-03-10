import React from 'react';

import SearchBox from '../Search/SearchBox';
import CartIndicator from '../Cart/CartIndicator';
import Grid from '@mui/material/Grid';
import { AppBar, Toolbar, IconButton, Container } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

import getConfig from 'next/config';
import { withRouter, NextRouter } from 'next/router';

import { routerPush } from '../../helpers/Context';
import CoveoUA from '../../helpers/CoveoAnalytics';
import { headlessEngine } from '../../helpers/Engine';

import StoreSelector from '../Stores/StoreSelector';
import { loadSearchAnalyticsActions, loadSearchActions, Unsubscribe, loadBreadcrumbActions, loadQueryActions } from '@coveo/headless';
import { setStoreId } from '../Cart/cart-actions';
import store from '../../reducers/cartStore';

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

export class Header extends React.Component<IHeaderProps, IHeaderState> {
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
      this.setPathsForAnalytics(url);
      CoveoUA.logPageView();
    });

    // send the first one when it's the first render.
    this.setPathsForAnalytics(this.props.router.asPath);
    CoveoUA.logPageView();
  }

  private setPathsForAnalytics(url) {
    // using the first word on the path after / to identify the section of the site. 
    const urlRoot = url.split(/\/|\?|#/)[1];
    const pageType = {
      'browse': 'Listing',
      'cart': 'Checkout',
      'pdp': 'PDP',
      'plp': 'Listing',
      'search': 'MainSearch',
    }[urlRoot] || 'Home';

    sessionStorage.setItem('pageType', pageType); // for UA events middlewares

    // saving previous, to be used as referrer when sending UA view events
    sessionStorage.setItem('path.previous', sessionStorage.getItem('path.current'));
    sessionStorage.setItem('path.current', window.location.href);
  }

  updateState() {
    const state = store.getState();

    this.setState(() => {
      if (state.storeId != '') {
        return { store: state.storeId };
      }
    });
  }

  protected changeStoreId = (storeId) => {
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

  resetToHome() {
    const breadcrumbActions = loadBreadcrumbActions(headlessEngine);
    headlessEngine.dispatch(breadcrumbActions.deselectAllBreadcrumbs());
    const queryActions = loadQueryActions(headlessEngine);
    headlessEngine.dispatch(queryActions.updateQuery({ q: '' }));

    routerPush(this.props.router, { pathname: '/' });
  }

  render() {
    let storeSelector = null;
    if (publicRuntimeConfig.stores) {
      storeSelector = <StoreSelector store={this.state.store} setStore={(e) => this.changeStoreId(e)} />;
    }

    return (
      <AppBar position='sticky' className={'header'} elevation={0}>
        <Container maxWidth='xl'>
          <Toolbar style={{ display: 'block' }}>
            <Grid container alignItems={'center'} className='header1-grid'>
              <Grid item className='logo-container' style={{ marginTop: '10px' }} onClick={() => this.resetToHome()}>
                <span className='header-sub-tl'>{publicRuntimeConfig.title}</span>
              </Grid>
              <Grid container item xs alignItems={'center'} justifyContent={'flex-end'} style={{ marginTop: '10px' }}>
                <IconButton id='header-btn--sign-in' className='header-icon'>
                  <span className='header-left-icon__container'>
                    <AccountCircleOutlinedIcon className='header-left__icon' viewBox='0 -2 24 24' />
                    <span className='header-left-icon__text'>Sign In</span>
                  </span>
                </IconButton>
                <IconButton id='cart-header' className=' header-icon'>
                  <CartIndicator />
                </IconButton>
              </Grid>
            </Grid>
            <Grid container alignItems={'center'}>
              <Grid item xs={6} sm={1} md={6}>
                <MegaMenuDropdown />
              </Grid>
              <Grid item xs={6} sm={1} md={6} style={{ justifyContent: 'flex-end' }}>
                <SearchBox />
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
