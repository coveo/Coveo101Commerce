import getConfig from 'next/config';

import { buildSearchEngine, loadAdvancedSearchQueryActions, loadDidYouMeanActions, loadFieldActions, SearchEngine, SearchEngineOptions } from '@coveo/headless';
import { buildProductRecommendationEngine, ProductRecommendationEngine } from '@coveo/headless/product-recommendation';
import { getEndpoint } from './Endpoints';

const EC_STANDARD_FIELDS = ['ec_brand', 'ec_category', 'ec_cogs', 'ec_description', 'ec_images', 'ec_in_stock', 'ec_item_group_id', 'ec_name', 'ec_parent_id', 'ec_price', 'ec_product_id', 'ec_promo_price', 'ec_rating', 'ec_shortdesc', 'ec_skus', 'ec_thumbnails', 'ec_variant_sku', 'permanentid', 'urihash'];
const { publicRuntimeConfig } = getConfig();


if (!(process?.env?.ORG_ID && process?.env?.API_KEY)) {
  throw new Error(' Org ID or API_KEY not defined. MISSING next.config,js ?');
}


const getFieldsFromConfig = (fields: string[] = []): string[] => {
  let configFields: string[] = [...EC_STANDARD_FIELDS, ...fields, ...publicRuntimeConfig.fields];
  configFields = Array.from(new Set(configFields)).sort();
  return configFields;
};

const registerFields = (engine: SearchEngine | ProductRecommendationEngine) => {
  const fields = getFieldsFromConfig();
  const fieldActions = loadFieldActions(engine);
  engine.dispatch(fieldActions.registerFieldsToInclude(fields));

  return engine;
};



const buildConfig = (pipeline: string, searchHub: string): SearchEngineOptions => ({
  configuration: {
    organizationId: process.env.ORG_ID,
    accessToken: process.env.API_KEY,
    platformUrl: getEndpoint(),
    analytics: {
      enabled: false, // set to FALSE, we are sending via Collect
    },
    search: {
      pipeline,
      searchHub,
    },
  },
});

const createSearchEngine = (pipeline: string, searchHub: string): SearchEngine => {
  return registerFields(
    buildSearchEngine(buildConfig(pipeline, searchHub))
  ) as SearchEngine;
};

// Main Search
export const headlessEngine = createSearchEngine(process.env.SEARCH_PIPELINE, 'MainSearch');
const didYouMeanActions = loadDidYouMeanActions(headlessEngine);
headlessEngine.dispatch(didYouMeanActions.enableDidYouMean());

// QS Search (for Search-As-You-Type)
export const headlessEngineQS = registerFields(
  buildSearchEngine(buildConfig(process.env.SEARCH_PIPELINE, 'MainSearch'))
) as SearchEngine;

// PDP
export const headlessEngineGetProductInfo = createSearchEngine(publicRuntimeConfig.pipelinePDP, publicRuntimeConfig.searchhubPDP);

// To populate the Mega Menu
export const headlessEngine_MegaMenu = createSearchEngine(process.env.SEARCH_PIPELINE, 'MegaMenu');

// Listing pages (aka Category pages)
export const headlessEngine_PLP = createSearchEngine(process.env.SEARCH_PIPELINE, publicRuntimeConfig.searchhubPLP);


// Recommendations Engine
export const headlessEngine_Recommendations = (searchHub: string): ProductRecommendationEngine => {
  const config = buildConfig(process.env.SEARCH_PIPELINE, searchHub) as any;

  // TODO: config for recommendations is slightly different - should test it with the same config too...
  delete config.configuration.search;
  config.configuration.searchHub = searchHub;

  return registerFields(buildProductRecommendationEngine(config)) as ProductRecommendationEngine;
};

// For the Banner
export const headlessEngine_Banner = createSearchEngine(process.env.SEARCH_PIPELINE, 'Banner');
// make sure we only have products with images in the banner
const searchActions_Banner = loadAdvancedSearchQueryActions(headlessEngine_Banner);
headlessEngine_Banner.dispatch(searchActions_Banner.updateAdvancedSearchQueries({ aq: '@ec_images' }));
