import { CartProduct } from "../cart-api-client";

export interface CartResponse {
  items?: CartProduct[];
  message?: string;
}
