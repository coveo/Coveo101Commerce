import React from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';

import store from '../../reducers/cartStore';
import { emptyCart } from "./cart-actions";
import CoveoUA, { getAnalyticsProductData } from "../../helpers/CoveoAnalytics";

export default function CartEmptyButton() {
  const [open, setOpen] = React.useState(false);

  const handleEmptyCart = () => {
    setOpen(false);

    const allProducts = store.getState().items.map(item => {
      const product = getAnalyticsProductData(item.detail, item.sku, 0);
      return {
        ...product
      };
    });

    CoveoUA.removeFromCart(allProducts);

    store.dispatch(emptyCart());
  };

  return (
    <div>
      <Button id="cart-remove-items" variant="contained" color="secondary" startIcon={<RemoveShoppingCartIcon />} onClick={() => { setOpen(true); }}>Clear cart</Button>
      <Dialog
        open={open}
        onClose={() => { setOpen(false); }}
        aria-labelledby="cart-empty-dialog-title"
        aria-describedby="cart-empty-dialog-description"
      >
        <DialogTitle id="cart-empty-dialog-title">{"Clear your cart?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="cart-empty-dialog-description">
            Remove all items from your cart.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); }} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEmptyCart} color="primary" autoFocus>
            Yes, Remove.
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
