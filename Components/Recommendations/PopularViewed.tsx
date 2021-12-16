import _BaseRecommendations from './_BaseRecommendations';
import { buildPopularViewedRecommendationsList } from '@coveo/headless/product-recommendation';

export default class PopularViewed extends _BaseRecommendations {

  constructor(props) {
    super(props, buildPopularViewedRecommendationsList);
  }

}
