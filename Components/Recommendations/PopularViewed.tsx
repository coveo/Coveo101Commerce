import getConfig from 'next/config';
import _BaseRecommendations from './_BaseRecommendations';
import { buildPopularViewedRecommendationsList } from '@coveo/headless/product-recommendation';

export default class PopularViewed extends _BaseRecommendations {

  constructor(props) {
    const configRecommendationsSearchHubs = getConfig().publicRuntimeConfig.recommendations || {};
    const searchHub = configRecommendationsSearchHubs.PopularViewed || 'REC - Popular Viewed';
    super(props, searchHub, buildPopularViewedRecommendationsList);
  }

}
