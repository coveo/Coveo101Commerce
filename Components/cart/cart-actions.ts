import { createAction } from '@reduxjs/toolkit';
import { CartProduct } from '../../api/cart-api-client';
import { CartResponse } from '../../api/cart/cart-response';

export const registerCart = createAction('cart/register');

export const setCartId = createAction<{ cartId: string }>('cart/setId');
export const setStoreId = createAction<{ storeId: string }>('cart/setStoreId');

export const addToCart = createAction<CartProduct>('cart/add');
export const updateCart = createAction<CartResponse>('cart/update');
export const emptyCart = createAction('cart/empty');

export const updateProduct = createAction<CartProduct>('cart/updateProduct');
export const deleteProduct = createAction<CartProduct>('cart/deleteProduct');
