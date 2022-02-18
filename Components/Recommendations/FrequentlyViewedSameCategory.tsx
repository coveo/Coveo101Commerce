import _BaseRecommendations from './_BaseRecommendations';
import { buildFrequentlyViewedSameCategoryList } from '@coveo/headless/product-recommendation';

export default class FrequentlyViewedSameCategory extends _BaseRecommendations {
  constructor(props) {
    super(props, buildFrequentlyViewedSameCategoryList);
  }
}
