import getConfig from 'next/config';

import { buildContext, buildSearchEngine, loadAdvancedSearchQueryActions, loadDidYouMeanActions, loadFieldActions, SearchEngine, SearchEngineOptions } from '@coveo/headless';
import { buildProductRecommendationEngine, ProductRecommendationEngine } from '@coveo/headless/product-recommendation';
import { getEndpoint } from './Endpoints';
import { getVisitorId } from './CoveoAnalytics';

const EC_STANDARD_FIELDS = ['ec_brand', 'ec_category', 'ec_cogs', 'ec_description', 'ec_images', 'ec_in_stock', 'ec_item_group_id', 'ec_name', 'ec_parent_id', 'ec_price', 'ec_product_id', 'ec_promo_price', 'ec_rating', 'ec_shortdesc', 'ec_skus', 'ec_thumbnails', 'ec_variant_sku', 'permanentid', 'urihash'];
const { publicRuntimeConfig } = getConfig();


if (!(process?.env?.ORG_ID && process?.env?.API_KEY)) {
  throw new Error(' Org ID or API_KEY not defined. MISSING next.config,js ?');
}


const getBotParamFromUrl = () => {
  if (typeof window === "object" && (/\b(bot|isBot|fromTest|fromTester)=(true|false|0|1)\b/i).test(window.location.href)) {
    const isBotValue = (RegExp.$2).toLowerCase();
    return (isBotValue === 'true' || isBotValue === '1');
  }
  return null;
};

const getFieldsFromConfig = (fields: string[] = []): string[] => {
  let configFields: string[] = [...EC_STANDARD_FIELDS, ...fields, ...publicRuntimeConfig.fields];
  configFields = Array.from(new Set(configFields)).sort();
  return configFields;
};

const registerFields = (engine: SearchEngine | ProductRecommendationEngine) => {
  const fields = getFieldsFromConfig();
  const fieldActions = loadFieldActions(engine);
  engine.dispatch(fieldActions.registerFieldsToInclude(fields));

  const isBotInSessionStorage = typeof sessionStorage === "object" && (sessionStorage.getItem('isBot') === 'true');
  const isBotInUrl = getBotParamFromUrl();
  if (engine && (isBotInSessionStorage || isBotInUrl)) {
    buildContext(engine).add("isBot", "true");
    buildContext(engine).add("fromTester", "true");
  }
  return engine;
};

const analyticsClientMiddleware = (eventName, eventData) => {
  if (!eventData.originLevel2 || eventData.originLevel2 === 'default') {
    eventData.originLevel2 = sessionStorage.getItem('pageType') || 'default';
  }

  if (!eventData.originLevel3 || eventData.originLevel3 === 'default') {
    eventData.originLevel3 = sessionStorage.getItem('path.current');
  }

  if (sessionStorage.getItem('isBot') === 'true') {
    if (!eventData.customData) { eventData.customData = {}; }
    eventData.customData['context_isBot'] = true;
    eventData.customData['context_fromTester'] = true;
  }
  if (!eventData.clientId) {
    eventData.clientId = getVisitorId();
  }
  return eventData;
};

const buildConfig = (pipeline, searchHub, analyticsEnabled: boolean = true): SearchEngineOptions => ({
  configuration: {
    organizationId: process.env.ORG_ID,
    accessToken: process.env.API_KEY,
    platformUrl: getEndpoint(),
    analytics: {
      enabled: analyticsEnabled && (typeof window === "object"), // enable for browsers only, disabled for "server-side"
      analyticsClientMiddleware,
    },
    search: {
      pipeline,
      searchHub,
    },
  },
});

const createSearchEngine = (pipeline: string, searchHub: string, analyticsEnabled: boolean = true): SearchEngine => {
  return registerFields(
    buildSearchEngine(buildConfig(pipeline, searchHub, analyticsEnabled))
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
export const headlessEngineGetProductInfo = createSearchEngine(publicRuntimeConfig.pipelinePDP, publicRuntimeConfig.searchhubPDP, false);

// To populate the Mega Menu
export const headlessEngine_MegaMenu = createSearchEngine(process.env.SEARCH_PIPELINE, 'MegaMenu', false);

// Listing pages (aka Category pages)
export const headlessEngine_PLP = createSearchEngine(process.env.SEARCH_PIPELINE, publicRuntimeConfig.searchhubPLP);


// Recommendations Engine
export const headlessEngine_Recommendations = (searchHub): ProductRecommendationEngine => {
  const config = buildConfig(process.env.SEARCH_PIPELINE, searchHub) as any;

  // TODO: config for recommendations is slightly different - should test it with the same config too...
  delete config.configuration.search; // 
  config.configuration.searchHub = searchHub;

  config.configuration.analytics.analyticsClientMiddleware = (eventName, eventData) => {
    if (!eventData.searchQueryUid) {
      eventData.searchQueryUid = sessionStorage.getItem('_r_searchQueryUid');
    }

    return analyticsClientMiddleware(eventName, eventData);
  };

  return registerFields(buildProductRecommendationEngine(config)) as ProductRecommendationEngine;
};

// For the Banner
export const headlessEngine_Banner = createSearchEngine(process.env.SEARCH_PIPELINE, 'Banner', false);
// make sure we only have products with images in the banner
const searchActions_Banner = loadAdvancedSearchQueryActions(headlessEngine_Banner);
headlessEngine_Banner.dispatch(searchActions_Banner.updateAdvancedSearchQueries({ aq: '@ec_images' }));
