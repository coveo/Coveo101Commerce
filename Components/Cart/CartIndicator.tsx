import { Unsubscribe } from '@coveo/headless';
import React, { Component } from 'react';
import { withRouter, NextRouter } from 'next/router';

import { Badge, createSvgIcon } from '@mui/material';

import { setCartId } from './cart-actions';
import store from '../../reducers/cartStore';
import { routerPush } from '../../helpers/Context';

const ShoppingBagIcon = createSvgIcon(
  <path d='M 18.2609 9.13158 V 7.69269 C 18.2609 3.87161 15.3846 0.745605 11.8696 0.745605 C 8.35421 0.745605 5.4783 3.87196 5.4783 7.69269 V 9.13158 H 0 V 32.4545 C 0 33.0004 0.410806 33.4469 0.912983 33.4469 H 22.8265 C 23.3287 33.4469 23.7395 33.0004 23.7395 32.4545 V 9.13158 H 18.2609 Z M 7.3041 7.74213 C 7.3041 5.01276 9.35842 2.77981 11.8694 2.77981 C 14.3804 2.77981 16.4347 5.01276 16.4347 7.74213 V 9.18103 H 7.3041 V 7.74213 Z M 21.9131 31.4621 H 1.82572 V 11.1165 H 5.47806 V 17.6171 H 7.30402 V 11.1165 H 16.4347 V 17.6171 H 18.2606 V 11.1165 H 21.913 L 21.9131 31.4621 Z' />,
  'ShoppingBagIcon'
);

interface ICartIndicatorProps {
  router?: NextRouter;
}

export interface ICartIndicatorState {
  cartId: string;
  total: number;
}

export class CartIndicator extends Component<ICartIndicatorProps> {
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
      <span className='header-left-icon__container' onClick={() => routerPush(this.props.router, { pathname: '/cart' })}>
        <Badge badgeContent={this.state.total} color='secondary' className='cart-badge'>
          <ShoppingBagIcon viewBox='0 -1 24 34' className='header-left__icon' />
        </Badge>
        <span className='header-left-icon__text'>Shopping Bag ({this.state.total})</span>
      </span>
    );
  }

  updateState() {
    const cartState = store.getState();
    const total = cartState.items.reduce((prev, cur) => (prev + cur.quantity), 0);

    if (this.state.total !== total) {
      this.setState({ total });
    }
  }

  private uuidv4() {
    //[1e7]+-1e3+-4e3+-8e3+-1e11
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
  }

  private getCartId() {
    if (this.state.cartId) {
      return this.state.cartId;
    }

    const cookies = document.cookie.split(';').map((c) => c.trim());

    let cartId = cookies.find((name) => name.startsWith('cartId='));
    if (!cartId) {
      cartId = cookies.find((name) => name.startsWith('coveo_visitorId='));
    }
    if (cartId) {
      cartId = cartId.split('=')[1];
    } else {
      cartId = this.uuidv4();
    }

    // update cookie
    document.cookie = `cartId=${cartId};path=/;max-age=${60 * 60 * 24 * 30}`;

    this.setState(() => {
      return { cartId };
    });
    return cartId;
  }
}
export default withRouter(CartIndicator);
