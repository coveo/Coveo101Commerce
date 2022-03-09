import getConfig from 'next/config';

import { buildContext, buildSearchEngine, ContextValue, loadAdvancedSearchQueryActions, loadDidYouMeanActions, loadFieldActions, loadSearchActions, loadSearchAnalyticsActions, SearchEngine, SearchEngineOptions } from '@coveo/headless';
import { buildProductRecommendationEngine, ProductRecommendationEngine } from '@coveo/headless/product-recommendation';
import { getEndpoint } from './Endpoints';

const EC_STANDARD_FIELDS = ['ec_brand', 'ec_category', 'ec_cogs', 'ec_description', 'ec_images', 'ec_in_stock', 'ec_item_group_id', 'ec_name', 'ec_parent_id', 'ec_price', 'ec_product_id', 'ec_promo_price', 'ec_rating', 'ec_shortdesc', 'ec_skus', 'ec_thumbnails', 'ec_variant_sku', 'permanentid', 'urihash'];
const { publicRuntimeConfig } = getConfig();


if (!(process?.env?.ORG_ID && process?.env?.API_KEY)) {
  throw new Error(' Org ID or API_KEY not defined. MISSING next.config,js ?');
}

if (typeof window === "object") {
  // preload the visitorId from coveoua - 
  // we want to initialize before the different Search Engines create their own simultaneously.
  window['coveoanalytics']?.getCurrentClient()?.getCurrentVisitorId();
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

const analyticsClientMiddleware = (eventName, eventData) => {
  if (eventData?.customData?.recommendation) {
    // set the recommendation strategy as origin level 2 (tab)
    eventData.originLevel2 = eventData?.customData?.recommendation;
  }

  if (!eventData.originLevel3 || eventData.originLevel3 === 'default') {
    eventData.originLevel3 = sessionStorage.getItem('path.current');
  }

  return eventData;
};

const buildConfig = (pipeline: string, searchHub: string, enableAnalytics: boolean = true): SearchEngineOptions => ({
  configuration: {
    organizationId: process.env.ORG_ID,
    accessToken: process.env.API_KEY,
    platformUrl: getEndpoint(),
    analytics: {
      enabled: enableAnalytics && (typeof window === "object"), // enable for browsers only, disabled for "server-side rendering" requests because there are no visitorId then. (cookie)
      analyticsClientMiddleware,
    },
    preprocessRequest: (request, clientOrigin) => {
      if (clientOrigin === 'analyticsFetch') {
        const body = JSON.parse(request.body as string);
        if (['interfaceLoad', 'recommendationInterfaceLoad'].includes(body.actionCause)) {
          console.info(`%c[LAB-269] Abort "${body.actionCause}".\nPlease ignore the following "analytics/interface/load/rejected" error:`, 'background: #222; color: #03a9f4; font-style: italic');
          const abortController = new AbortController();
          request.signal = abortController.signal;
          abortController.abort();
        }
      }
      return request;
    },
    search: {
      pipeline,
      searchHub,
    },
  },
});

const createSearchEngine = (pipeline: string, searchHub: string, enableAnalytics: boolean = true): SearchEngine => {
  return registerFields(
    buildSearchEngine(buildConfig(pipeline, searchHub, enableAnalytics))
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
export const headlessEngine_Recommendations = (searchHub: string): ProductRecommendationEngine => {
  const config = buildConfig(process.env.SEARCH_PIPELINE, searchHub) as any;

  // config for recommendations is slightly different...
  delete config.configuration.search;
  config.configuration.searchHub = searchHub;

  return registerFields(buildProductRecommendationEngine(config)) as ProductRecommendationEngine;
};

// For the Banner
export const headlessEngine_Banner = createSearchEngine(process.env.SEARCH_PIPELINE, 'Banner', false);
// make sure we only have products with images in the banner
const searchActions_Banner = loadAdvancedSearchQueryActions(headlessEngine_Banner);
headlessEngine_Banner.dispatch(searchActions_Banner.updateAdvancedSearchQueries({ aq: '@ec_images' }));

export const applyContextToEngines = (context: Record<string, ContextValue>) => {
  const engines = [headlessEngine, headlessEngineQS, headlessEngine_PLP];
  engines.forEach(engine => {
    const ctx = buildContext(engine);
    const existingKeys = Object.keys(engine.state.context.contextValues);
    for (let i = 0; i < existingKeys.length; i++) {
      const key = existingKeys[i];
      if (context[key] === undefined) {
        ctx.remove(key);
      }
    }
    let entries = Object.entries(context);
    for (let i = 0; i < entries.length; i++) {
      const item = entries[i];

      if (item[0] === 'gender') {
        sessionStorage.setItem('user_gender', item[1] as string);
        if (sessionStorage.getItem('user_gender_disabled') === 'true') {
          ctx.remove('gender');
        } else {
          ctx.add(item[0], item[1]);
        }
      }
      else {
        ctx.add(item[0], item[1]);
      }
    }
  });
};

export const redoSearch = (searchEngine?: SearchEngine) => {
  let engine = searchEngine;
  if (!engine && window.location.pathname.startsWith('/plp/')) {
    engine = headlessEngine_PLP;
  }
  if (!engine) {
    engine = headlessEngine; // default
  }

  const searchActions = loadSearchActions(engine);
  const analyticsActions = loadSearchAnalyticsActions(engine);
  engine.dispatch(searchActions.executeSearch(analyticsActions.logInterfaceLoad()));
};
