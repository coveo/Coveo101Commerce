import { createReducer } from '@reduxjs/toolkit';
import { setCartId, setStoreId, updateCart } from './cart-actions';
import { getCartInitialState } from './cart-state';
import { CartResponse } from '../../api/cart/cart-response';

export const cartReducer = createReducer(
  getCartInitialState(),
  (builder) => {
    builder
      .addCase(setCartId, (state, action) => {
        state.cartId = action.payload.cartId;
      })
      .addCase(setStoreId, (state, action) => {
        state.storeId = action.payload.storeId;
      })
      .addCase(updateCart, (state, action) => {
        if (action.payload) { // we get empty responses on Delete
          state.items = (action.payload as CartResponse).items || [];
        }
        else {
          state.items = [];
        }
      });
  }
);
