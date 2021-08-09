/* globals coveoua */
declare global {
  /* eslint-disable no-unused-vars */
  function coveoua<T>(action?: string, fieldName?: any, fieldValue?: any);
}

interface AnalyticsProductData {
  name: string;
  id: string;
  brand: string;
  price: number;
  category: string;
}


export const getAnalyticsProductData = (product, quantity = 0, withQuantity = true) => {

  let category = '';
  if (product?.ec_category?.length) {
    category = product.ec_category;
    category = category[category.length - 1];
  }

  const analyticsProductData: AnalyticsProductData = {
    name: product.ec_name,
    id: product.permanentid,
    brand: product.ec_brand,
    price: product.ec_price,
    category: category,
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
  setFromTester();
  coveoua('send', 'event');
};

const addProductForPurchase = (products: AnalyticsProductData[] | AnalyticsProductData) => {
  products = Array.isArray(products) ? products : [products];
  products.forEach(product => {
    coveoua('ec:addProduct', product);
  });
};

const detailView = (product) => {
  setFromTester();
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
  setFromTester();
  coveoua('set', 'page', window.location.pathname);
  coveoua('send', 'pageview', window.location.pathname);
};

const productClick = (product, searchUid, isRecommendation, callBack) => {
  const productData = {
    ...getAnalyticsProductData(product),
    position: product.index + 1
  };
  setFromTester();
  coveoua('ec:addProduct', productData);
  coveoua('ec:setAction', 'click', {
    list: `coveo:search:${searchUid}`
  });

  if (window.location.href.indexOf('fromTest') != -1) {
    coveoua('set', 'custom', { 'context_fromtester': true });
  }
  coveoua('send', 'event');

  setTimeout(callBack, 5);
};

const removeFromCart = (products: AnalyticsProductData[] | AnalyticsProductData) => {
  products = Array.isArray(products) ? products : [products];

  products.forEach(product => {
    coveoua('ec:addProduct', product);
  });
  coveoua('ec:setAction', 'remove');
  setFromTester();
  coveoua('send', 'event');
};

const setActionPurchase = (purchasePayload) => {
  coveoua('ec:setAction', 'purchase', purchasePayload);
  setFromTester();
  coveoua('send', 'event');
};

const setFromTester = () => {
  if (window.location.href.indexOf('fromTest') != -1) {
    coveoua('set', 'custom', { context_fromTester: true });
  }
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
  setFromTester,
};

export default CoveoAnalytics;
