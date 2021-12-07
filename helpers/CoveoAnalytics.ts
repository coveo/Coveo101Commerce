/* globals coveoua */
declare global {
  /* eslint-disable no-unused-vars */
  function coveoua<T>(action?: string, fieldName?: any, fieldValue?: any);
}

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

import cartStore from '../reducers/cartStore';

interface AnalyticsProductData {
  name: string;
  id: string;
  brand: string;
  group: string;
  quantity?: number;
  price: number;
  category: string;
  variant: string;
}


export const getAnalyticsProductData = (product, sku = '', quantity = 0, withQuantity = true) => {

  let category = '';
  if (product?.ec_category?.length) {
    category = product.ec_category;
    category = category[category.length - 1];
  }

  // DOC: https://docs.coveo.com/en/l29e0540/coveo-for-commerce/tracking-commerce-events-reference#product-fields-reference
  const analyticsProductData: AnalyticsProductData = {
    name: product.ec_name,
    id: product.permanentid,
    brand: product.ec_brand,
    group: product.ec_item_group_id,
    price: product.ec_promo_price,
    category: category,
    variant: sku,
  };


  if (withQuantity) {
    analyticsProductData['quantity'] = quantity;
  }

  return analyticsProductData;
};


const addToCart = (products: AnalyticsProductData[] | AnalyticsProductData) => {
  products = Array.isArray(products) ? products : [products];

  products.forEach(product => {
    coveoua('ec:addProduct', product);
  });
  coveoua('ec:setAction', 'add');
  coveoua('send', 'event');
};

const addProductForPurchase = (products: AnalyticsProductData[] | AnalyticsProductData) => {
  products = Array.isArray(products) ? products : [products];
  products.forEach(product => {
    coveoua('ec:addProduct', product);
  });
};

const detailView = (product) => {
  // in a Single Page App (SPA), we can't rely on document.referrer when navigating on the site. 
  let referrer = sessionStorage.getItem('path.current');
  // there may be a delay for the route in sessionStorage (path.current) to be updated, so we compare it with href, 
  if (referrer && referrer === window.location.href && sessionStorage.getItem('path.previous')) {
    // path.current was the same as href, use path.previous
    referrer = sessionStorage.getItem('path.previous');
  }
  else if (!referrer) {
    // no referrer, fall back to the usual document.referrer
    referrer = document.referrer;
  }

  // For more info on attributes for "view" event:  https://docs.coveo.com/en/2651/build-a-search-ui/log-view-events
  coveoua('send', 'view', {
    contentType: 'Product',
    originLevel1: 'PDP',
    originLevel2: product.id,
    originLevel3: referrer,
    title: product.name,
    referrer,
  });

  // Send the "pageview" event (measurement) 
  // https://docs.coveo.com/en/l2pd0522/coveo-for-commerce/measure-events-on-a-product-detail-page
  coveoua('ec:addProduct', product);
  coveoua('ec:setAction', 'detail');
};

const impressions = (product, searchUid) => {
  coveoua('ec:addImpression', {
    ...product,
    list: `coveo:search:${searchUid}`
  });
};

const logPageView = () => {
  coveoua('set', 'page', window.location.pathname);
  coveoua('send', 'pageview', window.location.pathname);
};

const productClick = (product, searchUid, isRecommendation, callBack) => {
  const productData = {
    ...getAnalyticsProductData(product),
    position: product.index + 1
  };
  coveoua('ec:addProduct', productData);
  coveoua('ec:setAction', 'click', {
    list: `coveo:search:${searchUid}`
  });
  coveoua('send', 'event');

  setTimeout(callBack, 5);
};

const removeFromCart = (products: AnalyticsProductData[] | AnalyticsProductData) => {
  products = Array.isArray(products) ? products : [products];

  products.forEach(product => {
    coveoua('ec:addProduct', product);
  });
  coveoua('ec:setAction', 'remove');
  coveoua('send', 'event');
};

const setActionPurchase = (purchasePayload) => {
  coveoua('ec:setAction', 'purchase', purchasePayload);
  coveoua('send', 'event');
};


//
// Get the visitor id from various sources (localStorage, cookies) 
//
// We are generating a new visitorId until KIT-1208 is fixed to avoid
// having analytics with differents visitor ids in the same session
//
export const getVisitorId = () => {
  if (typeof window !== "object") {
    // analytics on server-side are disabled
    return '';
  }

  let visitorId = localStorage.getItem('visitorId');

  if (!visitorId) {
    visitorId = window['coveo_visitorId'];
  }

  if (!visitorId) {
    // generate a new visitorId
    const hasCryptoRandomValues = (): boolean => {
      return (typeof crypto !== 'undefined') && (typeof crypto.getRandomValues !== 'undefined');
    };
    const getRandomValues = (rnds: Uint8Array) => {
      if (hasCryptoRandomValues()) {
        return crypto.getRandomValues(rnds);
      }
      for (let i = 0, r = 0; i < rnds.length; i++) {
        if ((i & 0x03) === 0) {
          r = Math.random() * 0x100000000;
        }
        rnds[i] = (r >>> ((i & 0x03) << 3)) & 0xff;
      }
      return rnds;
    };

    const uuidv4 = (a?: number | string): string => {
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!a) {
        return (Number(a) ^ (getRandomValues(new Uint8Array(1))[0] % 16 >> (Number(a) / 4))).toString(16);
      }
      return (`${1e7}` + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuidv4);
    };

    visitorId = uuidv4();
  }

  if (visitorId) {
    // save it for later
    window['coveo_visitorId'] = visitorId;
  }

  return visitorId;
};

const CoveoAnalytics = {
  addProductForPurchase,
  addToCart,
  detailView,
  impressions,
  logPageView,
  productClick,
  removeFromCart,
  setActionPurchase,
};

export default CoveoAnalytics;
