import getConfig from 'next/config';
import _BaseRecommendations from './_BaseRecommendations';
import { buildUserInterestRecommendationsList } from '@coveo/headless/product-recommendation';

export default class UserRecommender extends _BaseRecommendations {

  constructor(props) {
    const configRecommendationsSearchHubs = getConfig().publicRuntimeConfig.recommendations || {};
    const searchHub = configRecommendationsSearchHubs.UserRecommender || 'REC - User Recommender';
    super(props, searchHub, buildUserInterestRecommendationsList);
  }

}
