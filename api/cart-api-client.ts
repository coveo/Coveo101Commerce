import { Middleware } from 'redux';
import { updateCart } from '../Components/Cart/cart-actions';
import { CartResponse } from "./cart/cart-response";

export interface CartProduct {
  sku: string;
  productId?: string;
  quantity: number;
  detail?: any;
}

export const cartMiddleware: Middleware = (store) => (next) => async (action) => {
  next(action);

  const { cartId } = store.getState();
  if (!cartId) {
    return;
  }

  let res = null;
  if (action.type == 'cart/setId') {
    res = cartId; // will trigger a refresh below
  }
  else if (action.type == 'cart/empty') {
    res = await CartAPIClient.delete(cartId);
  }
  else if (action.type == 'cart/add') {
    res = await CartAPIClient.addToCart(cartId, action.payload) as CartResponse;
  }
  else if (action.type == 'cart/updateProduct') {
    res = await CartAPIClient.updateProduct(cartId, action.payload) as CartResponse;
  }
  else if (action.type == 'cart/deleteProduct') {
    res = await CartAPIClient.deleteProduct(cartId, action.payload);
  }

  if (res !== null) {
    // request a fresh cart state.
    res = await CartAPIClient.list(cartId) as CartResponse;
    store.dispatch(updateCart(res));
  }
};

const fetch_request = async (method: string, url: string, body?: any) => {
  const props = {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: null,
  };
  if (body) {
    props.body = JSON.stringify(body);
  }
  const cartEndpoint = process.env.CART_ENDPOINT || 'https://qkqmaylqa4.execute-api.us-east-1.amazonaws.com/Prod';
  return await fetch(`${cartEndpoint}${url}`, props);
};

export class CartAPIClient {
  static async list(cartId: string): Promise<CartResponse> {
    const res = await fetch_request('GET', `/cart/${cartId}`);
    return (await res.json()) as CartResponse;
  }

  static async delete(cartId: string) {
    await fetch_request('DELETE', `/cart/${cartId}`);
  }

  static async addToCart(cartId: string, item: CartProduct): Promise<CartResponse> {
    const res = await fetch_request('POST', `/cart/${cartId}/product/${item.sku}`, item);
    return (await res.json()) as CartResponse;
  }

  static async updateProduct(cartId: string, item: CartProduct): Promise<CartResponse> {
    const res = await fetch_request('PUT', `/cart/${cartId}/product/${item.sku}`, item);
    return (await res.json()) as CartResponse;
  }

  static async deleteProduct(cartId: string, item: CartProduct) {
    return await fetch_request('DELETE', `/cart/${cartId}/product/${item.sku}`);
  }
}
