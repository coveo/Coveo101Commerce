import getConfig from 'next/config';
import _BaseRecommendations from './_BaseRecommendations';
import { buildFrequentlyBoughtTogetherList } from '@coveo/headless/product-recommendation';

export default class FrequentlyBoughtTogether extends _BaseRecommendations {

  constructor(props) {
    const configRecommendationsSearchHubs = getConfig().publicRuntimeConfig.recommendations || {};
    const searchHub = configRecommendationsSearchHubs.FrequentlyBoughtTogether || 'REC - Also Bought';
    super(props, searchHub, buildFrequentlyBoughtTogetherList);
  }

}
