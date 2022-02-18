import React from 'react';
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

  return (
    <>
      {promo} {dollars}.{cents}
    </>
  );
}

export default function Price(props) {
  const product = (props as any).product;

  let saleprice = product.ec_promo_price;
  let regularprice = product.ec_price;
  let storePrice = product.ec_store_prices;
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

  let originalPriceFormatted = formatPrice(regularprice);
  let salePriceFormatted = null;

  if (saleprice && saleprice !== regularprice) {
    if (saleprice < regularprice) {
      originalPriceFormatted = formatPrice(regularprice);
      salePriceFormatted = formatPrice(saleprice);
    }
    else {
      originalPriceFormatted = formatPrice(saleprice);
      salePriceFormatted = formatPrice(regularprice);
    }
  }

  return (
    <div className='widget-price widget-price-color'>
      {originalPriceFormatted && <span className={salePriceFormatted ? 'price-regular--discounted' : 'price-regular'}>{originalPriceFormatted}</span>}
      {salePriceFormatted && <span className={'price-promo'}>{salePriceFormatted}</span>}
      <span className='price-promo store'>
        {displaystorePrice && storePriceAvailable && <>In Store: {displaystorePrice}</>}
        {!displaystorePrice && storePriceAvailable && <span className='store-na'>Not available in selected store</span>}
      </span>
    </div>
  );
}
