/* globals coveoua */
declare global {
  /* eslint-disable no-unused-vars */
  function coveoua<T>(action?: string, fieldName?: any, fieldValue?: any);
}

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

const getOriginsAndCustomData = (dataToMerge?: any) => {
  const page = window.location.pathname;
  let originLevel2 = 'default';
  if (page.startsWith('/plp/') || page.startsWith('/pdp/')) {
    originLevel2 = page.substring(5);
  }

  const custom = {
    ...(dataToMerge || {}),
  };

  return {
    custom,
    searchHub: sessionStorage.getItem('pageType'),
    tab: originLevel2,
  };
};

const addToCart = (products: AnalyticsProductData[] | AnalyticsProductData) => {
  products = Array.isArray(products) ? products : [products];

  products.forEach(product => {
    coveoua('ec:addProduct', product);
  });
  coveoua('ec:setAction', 'add');
  coveoua('send', 'event', getOriginsAndCustomData());
};

const addProductForPurchase = (products: AnalyticsProductData[] | AnalyticsProductData) => {
  products = Array.isArray(products) ? products : [products];
  products.forEach(product => {
    coveoua('ec:addProduct', product);
  });
};


const detailView = (product) => {
  // Send the "pageview" event (measurement) 
  // https://docs.coveo.com/en/l2pd0522/coveo-for-commerce/measure-events-on-a-product-detail-page
  coveoua('ec:addProduct', product);
  coveoua('ec:setAction', 'detail');
  coveoua('send', 'event', getOriginsAndCustomData());
};

const impressions = (product, searchUid) => {
  coveoua('ec:addImpression', {
    ...product,
    list: `coveo:search:${searchUid}`
  });
};

const logPageView = () => {
  coveoua('set', 'page', window.location.pathname);
  coveoua('send', 'pageview', getOriginsAndCustomData());
};

const productClick = (product, searchUid: string, recommendationStrategy: string = '', callBack) => {
  const productData = {
    ...getAnalyticsProductData(product),
    position: product.index + 1
  };
  coveoua('ec:addProduct', productData);
  coveoua('ec:setAction', 'click', {
    list: `coveo:search:${searchUid}`
  });

  let customData: any = {};
  if (recommendationStrategy) {
    customData.recommendation = recommendationStrategy;
  }

  coveoua('send', 'event', getOriginsAndCustomData(customData));

  setTimeout(callBack, 5);
};

const removeFromCart = (products: AnalyticsProductData[] | AnalyticsProductData) => {
  products = Array.isArray(products) ? products : [products];

  products.forEach(product => {
    coveoua('ec:addProduct', product);
  });
  coveoua('ec:setAction', 'remove');
  coveoua('send', 'event', getOriginsAndCustomData());
};

const setActionPurchase = (purchasePayload) => {
  coveoua('ec:setAction', 'purchase', purchasePayload);
  coveoua('send', 'event', getOriginsAndCustomData());
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

  let visitorId = window['coveo_visitorId'];
  if (!visitorId) {
    visitorId = window['coveoanalytics']?.getCurrentClient()?.visitorId;
  }
  if (!visitorId) {
    visitorId = localStorage.getItem('visitorId');
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
  getAnalyticsProductData,
  getOriginsAndCustomData,
  impressions,
  logPageView,
  productClick,
  removeFromCart,
  setActionPurchase,
};

export default CoveoAnalytics;
