import _BaseRecommendations from './_BaseRecommendations';
import { buildFrequentlyViewedDifferentCategoryList } from '@coveo/headless/product-recommendation';

export default class FrequentlyViewedDifferentCategory extends _BaseRecommendations {
  constructor(props) {
    super(props, buildFrequentlyViewedDifferentCategoryList);
  }
}
