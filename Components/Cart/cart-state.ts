import { CartProduct } from "../../api/cart-api-client";

export interface CartState {
  cartId: string;
  storeId: string;
  items: CartProduct[];
}

export function getCartInitialState(): CartState {
  return {
    cartId: '',
    storeId: '',
    items: [],
  };
}
