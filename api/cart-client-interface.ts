/* eslint-disable no-unused-vars */

import { CartProduct } from './cart-api-client';
import { CartResponse } from './cart/cart-response';


export interface CartClient {
  setId(cartId: string): void;

  list(cartId: string): Promise<CartResponse>;
  delete(cartId: string): void;

  addToCart(cartId: string, item: CartProduct): Promise<CartResponse>;
  deleteProduct(cartId: string, item: CartProduct): void;
}
