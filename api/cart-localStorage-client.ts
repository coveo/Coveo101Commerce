import { CartProduct } from './cart-api-client';
import { CartClient } from './cart-client-interface';
import { CartResponse } from "./cart/cart-response";

export class CartLocalStorageClient implements CartClient {

    async setId(cartId: string) {
        if (!localStorage.getItem(cartId)) {
            localStorage.setItem(cartId, '[]');
        }
    }

    async list(cartId: string) {
        const cartItems = JSON.parse(localStorage.getItem(cartId));
        return { cartId, "items": cartItems } as CartResponse;
    }

    async delete(cartId: string) {
        localStorage.setItem(cartId, "[]");
    }

    async addToCart(cartId: string, item: CartProduct) {
        const cartItems = JSON.parse(localStorage.getItem(cartId));
        const itemIndex = cartItems.findIndex(i => i.sku === item.sku);
        if (itemIndex > -1) {
            if (item.quantity == 0) {
                cartItems.splice(itemIndex, 1);
            } else {
                cartItems[itemIndex].quantity = item.quantity;
            }
        } else {
            cartItems.push(item);
        }

        localStorage.setItem(cartId, JSON.stringify(cartItems));

        return { cartId, "message": "item added to cart", "sku": item.sku } as CartResponse;
    }

    async deleteProduct(cartId: string, item: CartProduct) {
        const cartItems = JSON.parse(localStorage.getItem(cartId));
        const newCartList = cartItems.filter(i => i.sku != item.sku);
        localStorage.setItem(cartId, JSON.stringify(newCartList));

    }

}
