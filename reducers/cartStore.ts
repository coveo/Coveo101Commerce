import { createStore, applyMiddleware } from 'redux';
import { cartMiddleware } from '../api/cart-api-client';
import { cartReducer } from '../Components/cart/cart-slice';

const cartStore = createStore(cartReducer, applyMiddleware(cartMiddleware));

export default cartStore;
