import { CartClient } from './cart-client-interface';
import { CartResponse } from "./cart/cart-response";

export interface CartProduct {
  sku: string;
  productId?: string;
  quantity: number;
  detail?: any;
}

const fetch_request = async (method: string, url: string, body?: any) => {
  const props = {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: null,
  };
  if (body) {
    props.body = JSON.stringify(body);
  }
  
  const cartEndpoint = process.env.CART_ENDPOINT;
  return await fetch(`${cartEndpoint}${url}`, props);
};

export class CartAPIClient implements CartClient {

  async setId(cartId: string) {
    if (!localStorage.getItem(cartId)) {
      localStorage.setItem(cartId, '[]');
    }
  }

  async list(cartId: string): Promise<CartResponse> {
    const res = await fetch_request('GET', `/cart/${cartId}`);
    return (await res.json()) as CartResponse;
  }

  async delete(cartId: string) {
    await fetch_request('DELETE', `/cart/${cartId}`);
  }

  async addToCart(cartId: string, item: CartProduct): Promise<CartResponse> {
    const res = await fetch_request('POST', `/cart/${cartId}/product/${item.sku}`, item);
    return (await res.json()) as CartResponse;
  }

  async deleteProduct(cartId: string, item: CartProduct) {
    return await fetch_request('DELETE', `/cart/${cartId}/product/${item.sku}`);
  }
}
