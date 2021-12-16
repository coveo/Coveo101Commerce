import _BaseRecommendations from './_BaseRecommendations';
import { buildFrequentlyBoughtTogetherList } from '@coveo/headless/product-recommendation';

export default class FrequentlyBoughtTogether extends _BaseRecommendations {

  constructor(props) {
    super(props, buildFrequentlyBoughtTogetherList);
  }

}
