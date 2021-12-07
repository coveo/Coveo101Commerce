import { Middleware } from 'redux';
import { updateCart } from '../Components/Cart/cart-actions';
import { CartAPIClient } from './cart-api-client';
import { CartLocalStorageClient } from './cart-localStorage-client';
import { CartResponse } from './cart/cart-response';

// Cart Client singleton
let _client = null;
const getCartClient = () => {
  if (!_client) {
    _client = process.env.CART_ENDPOINT ? new CartAPIClient() : new CartLocalStorageClient();
  }
  return _client;
};


export const cartMiddleware: Middleware = (store) => (next) => async (action) => {
  next(action);

  const { cartId } = store.getState();
  if (!cartId) {
    return;
  }

  const client = getCartClient();

  let res = null;
  if (action.type == 'cart/setId') {
    res = cartId; // will trigger a refresh below
    await client.setId(cartId);
  }
  else if (action.type == 'cart/empty') {
    res = await client.delete(cartId);
  }
  else if (action.type == 'cart/add') {
    // adds and also updates an existing product in the cart  
    res = await client.addToCart(cartId, action.payload) as CartResponse;
  }
  else if (action.type == 'cart/deleteProduct') {
    res = await client.deleteProduct(cartId, action.payload);
  }

  if (res !== null) {
    // request a fresh cart state.
    res = await client.list(cartId) as CartResponse;
    store.dispatch(updateCart(res));
  }

};
