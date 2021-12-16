import _BaseRecommendations from './_BaseRecommendations';
import { buildFrequentlyViewedTogetherList } from '@coveo/headless/product-recommendation';

export default class FrequentlyViewedTogether extends _BaseRecommendations {

  constructor(props) {
    super(props, buildFrequentlyViewedTogetherList);
  }

}
