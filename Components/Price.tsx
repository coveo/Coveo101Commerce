import React from "react";
import store from '../reducers/cartStore';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function formatPrice(price: number, promo: string = '') {
  if (price === undefined) {
    return null;
  }
  const formattedPrice = formatter.format(price);
  const [dollars, cents] = formattedPrice.split('.');

  return <span className="price-money">{promo} {dollars}.<sup>{cents}</sup></span>;
}

export default function Price(props) {
  const product = (props as any).product;

  let saleprice = product.ec_promo_price;
  let regularprice = product.ec_price;
  let storePrice = product.ec_store_prices;
  let displayPrice = regularprice;
  let origPrice;
  let withPromo;
  let displaystorePrice;
  let storePriceAvailable = true;
  if (storePrice !== null) {
    displaystorePrice = formatPrice(storePrice);
    storePriceAvailable = true;
  }

  //Check if a store is selected, if so, do not display the storeprice
  const { storeId } = store.getState();
  if (storeId == '-1' || storeId == '') {
    displaystorePrice = undefined;
    storePriceAvailable = false;
  }

  if (saleprice === undefined) {
    displayPrice = formatPrice(regularprice);
  }
  else if (saleprice !== undefined && saleprice < regularprice) {
    origPrice = formatPrice(regularprice);
    displayPrice = formatPrice(saleprice);
    withPromo = formatPrice(regularprice - saleprice, "save ");
  }
  else if (saleprice !== undefined && saleprice > regularprice) {
    displayPrice = formatPrice(regularprice);
  }
  else {
    displayPrice = formatPrice(saleprice);
  }


  return <div className="widget-price">
    <span className="display-orig-price">
      {origPrice}
    </span>
    <span className="display-price">
      {displayPrice}
    </span>
    <span className="display-promo">
      {withPromo}
    </span>
    <span className="display-price store">
      {displaystorePrice && storePriceAvailable && <>In Store: {displaystorePrice}</>}
      {!displaystorePrice && storePriceAvailable && <span className="store-na">Not available in selected store</span>}
    </span>
  </div>;

}

