import _BaseRecommendations from './_BaseRecommendations';
import { buildPopularBoughtRecommendationsList } from '@coveo/headless/product-recommendation';

export default class PopularBought extends _BaseRecommendations {

  constructor(props) {
    super(props, buildPopularBoughtRecommendationsList);
  }

}
