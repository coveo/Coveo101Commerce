import getConfig from 'next/config';
import _BaseRecommendations from './_BaseRecommendations';
import { buildPopularBoughtRecommendationsList } from '@coveo/headless/product-recommendation';

export default class PopularBought extends _BaseRecommendations {

  constructor(props) {
    const configRecommendationsSearchHubs = getConfig().publicRuntimeConfig.recommendations || {};
    const searchHub = configRecommendationsSearchHubs.PopularBought || 'REC - Popular Bought';
    super(props, searchHub, buildPopularBoughtRecommendationsList);
  }

}
