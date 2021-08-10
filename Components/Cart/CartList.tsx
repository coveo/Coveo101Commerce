import { Unsubscribe } from '@coveo/headless';
import { Avatar, Button, Grid, Link, Typography, withStyles } from '@material-ui/core';
import React, { Component } from 'react';
import { NextRouter, withRouter } from "next/router";

import store from '../../reducers/cartStore';
import Price, { formatPrice } from '../Price';
import { CartState } from './cart-state';
import AddRemoveProduct from './AddRemoveProduct';

import RemoveShoppingCartIcon from '@material-ui/icons/RemoveShoppingCart';
import { CartProduct } from '../../api/cart-api-client';
import { deleteProduct } from './cart-actions';
import CoveoUA, { getAnalyticsProductData } from "../../helpers/CoveoAnalytics";
import { routerPush } from '../../helpers/Context';

const styles = {
  root: {
  },
  item: {
    paddingBottom: '15px',
    borderBottom: '1px solid silver',
    margin: '10px 0',
    '& a': {
      cursor: 'pointer',
    },
  },
  thumnbnail: {
    width: '80px',
    height: '80px',
    marginRight: '30px',
    '& > img': {
      objectFit: 'contain',
    }
  },
  price: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ED731A',
  },
  total: {
    textAlign: 'right',
  },

};

class CartList extends Component<{ router?: NextRouter; }> {
  state: CartState;
  private unsubscribe: Unsubscribe = () => { };

  constructor(props: any) {
    super(props);
    this.state = {
      cartId: '',
      items: [],
      storeId: '',
    };
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => this.updateState());
    this.updateState();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleRemoveProduct(item: CartProduct) {
    store.dispatch(deleteProduct(item));

    const product = getAnalyticsProductData(item.detail, 0);
    CoveoUA.removeFromCart(product);
  }

  updateState() {
    this.setState(store.getState());
  }

  private renderItem(cartItem: CartProduct) {
    const { classes } = this.props as any;

    return <Grid key={cartItem.sku} className={classes.item} container>
      <Grid item>
        <Avatar variant="square" className={classes.thumnbnail} src={cartItem.detail.ec_images[0]} />
      </Grid>
      <Grid item sm container>
        <Grid item xs container direction="column" spacing={2}>
          <Link onClick={() => routerPush(this.props.router, { pathname: `/pdp/[sku]`, query: { sku: cartItem.detail?.ec_product_id, model: cartItem.detail?.ec_item_group_id } })}>
            {cartItem.detail.ec_name || cartItem.sku}
          </Link>
          <Typography gutterBottom variant="subtitle1">
            {cartItem.detail?.cat_color && <span>Color: {cartItem.detail.cat_color}</span>}
            {cartItem.detail?.cat_color_swatch && <div className="facet-color-swatch" style={{ margin: '0 10px', display: 'inline-block', backgroundImage: `url(${cartItem.detail.cat_color_swatch})`, verticalAlign: 'bottom' }} data-src={cartItem.detail?.cat_color_swatch}></div>}
          </Typography>
          <Typography gutterBottom variant="body2">{cartItem.detail.ec_item_group_id} {cartItem.sku}</Typography>
        </Grid>
      </Grid>
      <Grid item style={{ textAlign: 'right' }}>
        <Price product={cartItem.detail} />
        <AddRemoveProduct product={cartItem.detail} sku={cartItem.sku} label="Quantity:" />
        <Button className="cart-item-remove" startIcon={<RemoveShoppingCartIcon />} onClick={() => this.handleRemoveProduct(cartItem)}>Remove</Button>
      </Grid>
    </Grid>;

  }

  render() {
    const items = this.state.items.map(item => this.renderItem(item));
    return (
      <div id="cart-list">
        <h1>Your Cart items</h1>
        <Grid container>
          {items}
        </Grid>
        {this.total()}
      </div>
    );
  }

  total() {
    const { classes } = this.props as any;

    let total = 0;
    this.state.items.forEach(item => {
      let price = item.detail.ec_promo_price;
      if (price === undefined) {
        price = item.detail.ec_price;
      }
      total += (item.quantity * price) || 0;
    });
    return (
      <div className={classes.total}>
        TOTAL: <span className={classes.price}>{formatPrice(total)}</span>
      </div >
    );
  }
}
export default withStyles(styles as any)(withRouter(CartList));
