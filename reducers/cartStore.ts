import { createStore, applyMiddleware } from 'redux';
import { cartMiddleware } from '../api/cart-middleware';
import { cartReducer } from '../Components/Cart/cart-slice';

const cartStore = createStore(cartReducer, applyMiddleware(cartMiddleware));

export default cartStore;
