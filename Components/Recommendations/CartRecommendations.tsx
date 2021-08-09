import getConfig from 'next/config';
import _BaseRecommendations from './_BaseRecommendations';
import { buildCartRecommendationsList } from '@coveo/headless/product-recommendation';

export default class CartRecommendations extends _BaseRecommendations {

  constructor(props) {
    const configRecommendationsSearchHubs = getConfig().publicRuntimeConfig.recommendations || {};
    const searchHub = configRecommendationsSearchHubs.CartRecommendations || 'REC - Cart Recommendations';
    super(props, searchHub, buildCartRecommendationsList);
  }

}
