import { Unsubscribe } from '@coveo/headless';
import React, { Component } from 'react';
import { withRouter, NextRouter } from 'next/router';

import { Badge } from "@material-ui/core";
import ShoppingCartRoundedIcon from '@material-ui/icons/ShoppingCartRounded';

import { setCartId } from './cart-actions';
import store from '../../reducers/cartStore';
import { routerPush } from '../../helpers/Context';

interface ICartIndicatorProps {
  router?: NextRouter,
}

export interface ICartIndicatorState {
  cartId: string;
  total: number;
}

class CartIndicator extends Component<ICartIndicatorProps> {
  state: ICartIndicatorState;
  private unsubscribe: Unsubscribe = () => { };
  constructor(props: any) {
    super(props);

    this.state = {
      cartId: '',
      total: 0,
    };
  }

  componentDidMount() {
    if (typeof window !== 'undefined' && !this.state.cartId) {
      const cartId = this.getCartId();
      store.dispatch(setCartId({ cartId }));
    }

    this.unsubscribe = store.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <Badge badgeContent={this.state.total} color="secondary" onClick={() => routerPush(this.props.router, { pathname: '/cart' })}>
        <ShoppingCartRoundedIcon color={'primary'} />
      </Badge>
    );
  }

  updateState() {
    const state = store.getState();
    let total = 0;
    state.items.forEach(item => total += item.quantity);

    this.setState(() => {
      return { total };
    });
  }

  private uuidv4() {
    //[1e7]+-1e3+-4e3+-8e3+-1e11
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  private getCartId() {
    if (this.state.cartId) {
      return this.state.cartId;
    }

    const cookies = document.cookie.split(';').map(c => c.trim());

    let cartId = cookies.find(name => name.startsWith('cartId='));
    if (!cartId) {
      cartId = cookies.find(name => name.startsWith('coveo_visitorId='));
    }
    if (cartId) {
      cartId = cartId.split('=')[1];
    }
    else {
      cartId = this.uuidv4();
    }

    // update cookie
    document.cookie = `cartId=${cartId};path=/;max-age=${60 * 60 * 24 * 30}`;

    this.setState(() => { return { cartId }; });
    return cartId;
  }

}
export default (withRouter(CartIndicator));
