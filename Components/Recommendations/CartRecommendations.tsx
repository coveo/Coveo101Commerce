import _BaseRecommendations from './_BaseRecommendations';
import { buildCartRecommendationsList } from '@coveo/headless/product-recommendation';

export default class CartRecommendations extends _BaseRecommendations {

  constructor(props) {
    super(props, buildCartRecommendationsList);
  }

}
