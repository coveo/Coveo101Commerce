import getConfig from 'next/config';
import _BaseRecommendations from './_BaseRecommendations';
import { buildFrequentlyViewedTogetherList } from '@coveo/headless/product-recommendation';

export default class FrequentlyViewedTogether extends _BaseRecommendations {

  constructor(props) {
    const configRecommendationsSearchHubs = getConfig().publicRuntimeConfig.recommendations || {};
    const searchHub = configRecommendationsSearchHubs.FrequentlyViewedTogether || 'REC - Also Viewed';
    super(props, searchHub, buildFrequentlyViewedTogetherList);
  }

}
