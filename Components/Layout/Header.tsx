import React from "react";
import Image from 'next/image';

import SearchBox from "../Search/SearchBox";
import CartIndicator from "../Cart/CartIndicator";
import Grid from '@material-ui/core/Grid';
import { AppBar, Toolbar, IconButton, Container } from "@material-ui/core";

import { withRouter, NextRouter } from 'next/router';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { routerPush } from '../../helpers/Context';
import getConfig from 'next/config';
import StoreSelector from '../Stores/StoreSelector';
import { headlessEngine } from "../../helpers/Engine";
import { loadSearchAnalyticsActions, loadSearchActions, Unsubscribe } from "@coveo/headless";
import { setStoreId } from '../Cart/cart-actions';
import store from '../../reducers/cartStore';

import logo from '../../public/logos/coveo_logo.png';
import MegaMenuDropdown from "./MegaMenuDropdown";

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
  constructor(props: any) {

    super(props);
    this.state = {
      store: '-1',
      isMenuActive: false,
      isStoreMenuActive: false
    };

  }

  private closeMegaMenu = () => {
    this.setState({ isMenuActive: false });
  };

  handleMegaMenuClick() {
    this.setState(prevState => ({ isMenuActive: !prevState.isMenuActive }));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => this.updateState());
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
      }
    };
    if (storeId) {
      routerOptions.query['storeId'] = storeId;
    }

    //fix url
    routerPush(this.props.router, routerOptions);

  };

  handleStoreClick() {
    this.setState(prevState => ({ isStoreMenuActive: !prevState.isStoreMenuActive }));
  }

  render() {

    let storeSelector = null;
    if (publicRuntimeConfig.stores) {
      storeSelector = <StoreSelector store={this.state.store} setStore={(e) => this.changeStoreId(e)} />;
    }

    return (
      <AppBar position="sticky" className={'header'}>
        <Container maxWidth="xl">
          <Toolbar>
            <Grid container alignItems={'center'}>
              <Grid item className="logo-container" onClick={() => routerPush(this.props.router, { pathname: '/' })} >
                <Image
                  alt=""
                  className="logo"
                  src={publicRuntimeConfig?.logo || logo}
                  height={50} width={50}
                />
                <span className="header-sub-tl">{publicRuntimeConfig.title}</span>
              </Grid>
              <Grid container item xs alignItems={'center'} justifyContent={'flex-end'}>
                <Grid item xs={6} className="header-el">
                  <SearchBox />
                </Grid>
                <IconButton
                  disableRipple={true}
                  onClick={() => this.handleMegaMenuClick()}
                  className="header-el header-icon header-icon__no-hover">
                  <span className="header-icon__txt" color={'primary'}>Shop</span>
                  <ExpandMoreIcon color={'primary'} />
                </IconButton>
                <IconButton id='cart-header' className="header-el header-icon header-el__last">
                  <CartIndicator />
                </IconButton>
              </Grid>
            </Grid>
            <MegaMenuDropdown closeMegaMenu={this.closeMegaMenu} isMenuActive={this.state.isMenuActive} />

            {storeSelector}
          </Toolbar>
        </Container>
      </AppBar >
    );
  }
}

export default withRouter(Header);
