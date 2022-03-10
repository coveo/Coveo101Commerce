import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

import getConfig from 'next/config';
import Head from 'next/head';

import { Container } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { loadAdvancedSearchQueryActions, loadSearchActions, loadSearchAnalyticsActions } from '@coveo/headless';
import CategoryBreadcrumb from '../../Components/Categories/CategoryBreadcrumb';
import { IProduct, normalizeProduct } from '../../Components/ProductCard/Product.spec';
import { setStoreContext } from '../../helpers/Context';
import CoveoUA from '../../helpers/CoveoAnalytics';
import { headlessEngineGetProductInfo } from '../../helpers/Engine';
import theme from '../../helpers/theme';
import ProductDetailPage from '../../Components/ProductDetail/ProductDetailPage';
import { GetServerSideProps } from 'next';

const { publicRuntimeConfig } = getConfig();

export interface IProductError {
  noResult: boolean;
  sku: string;
}

const sendDetailEvent = (product) => {
  let category = '';

  const ec_category = product.ec_category || product['cat_categories'];
  if (ec_category?.length) {
    let category_last = ec_category[ec_category.length - 1];
    category = category_last.split('|').join('/');
  }

  CoveoUA.detailView({
    brand: product.ec_brand,
    category,
    id: product.permanentid,
    group: product.ec_item_group_id,
    name: product.ec_name,
    price: product.ec_price,
  });
};

function ProductPage(_product: IProduct & IProductError) {
  const router = useRouter();
  const product: IProduct = normalizeProduct(_product);

  useEffect(() => {
    const handleRouteChange = () => { sendDetailEvent(product); };
    router.events.on('routeChangeComplete', handleRouteChange);
    // unsubscribe when the component is unmounted:
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };

  }, [product, router.events]);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (_product.noResult) {
    return (
      <div>
        Couldn&apos;t find product with sku <b>{_product.sku}</b>.
      </div>
    );
  }

  const routerComponents = (router as any).components || {};
  const isInitialRender = routerComponents['/pdp/[sku]']?.initial || null;
  if (isInitialRender) {
    // when loading directly (using URL or Browser Refresh), the "routeChangeComplete" won't be triggered;
    sendDetailEvent(product);
  }

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>
          {product.ec_name} | {publicRuntimeConfig.title}
        </title>
        <meta property='og:title' content={product.ec_name} key='title' />
        <meta property='og:url' content={`/pdp/${product.permanentid}`} />
        <meta property='og:image' content={typeof product.ec_images === 'string' ? product.ec_images : product.ec_images[0]} />
      </Head>

      <div id='generic-store-pdp'>
        <div className='breadcrumb__container'>
          <Container>
            <CategoryBreadcrumb product={product} />
          </Container>
        </div>

        <ProductDetailPage product={product} />
      </div>
    </ThemeProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  if (!params.sku || params.sku === 'undefined') {
    console.warn('Sku is undefined!');
    return {
      props: { noResult: true, sku: params.sku },
    };
  }

  const aq = `@permanentid==${params.sku} $qre(expression:@permanentid=="${params.sku}", modifier:100) OR @ec_item_group_id=="${query.model}"`;

  if (query.storeId == '-1' || query.storeId == '') {
    //Do nothing
  } else {
    setStoreContext(headlessEngineGetProductInfo, '' + query.storeId);
  }

  const advancedSearchQueryActions = loadAdvancedSearchQueryActions(headlessEngineGetProductInfo);
  const analyticsActions = loadSearchAnalyticsActions(headlessEngineGetProductInfo);
  const searchActions = loadSearchActions(headlessEngineGetProductInfo);

  await headlessEngineGetProductInfo.dispatch(advancedSearchQueryActions.updateAdvancedSearchQueries({ aq }));
  const res = await headlessEngineGetProductInfo.dispatch(searchActions.executeSearch(analyticsActions.logInterfaceLoad()));

  let firstResult = { noResult: true, sku: params.sku };

  const results = (res?.payload as any)?.response?.results;
  if (results) {
    if (results?.length) {
      firstResult = results[0];
    } else {
      console.warn('[sku].tsx - Response is empty for PDP with sku:', params.sku, res);
    }
  } else {
    console.warn('[sku].tsx - Request failed for PDP with sku:', params.sku, res);
  }

  return {
    props: firstResult,
  };
};

export default ProductPage;
