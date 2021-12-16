import _BaseRecommendations from './_BaseRecommendations';
import { buildUserInterestRecommendationsList } from '@coveo/headless/product-recommendation';

export default class UserRecommender extends _BaseRecommendations {

  constructor(props) {
    super(props, buildUserInterestRecommendationsList);
  }

}
