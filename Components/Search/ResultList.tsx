/* globals coveoua */

import React from 'react';
import { buildResultList, buildResultTemplatesManager, ResultTemplatesManager, Result, ResultListState, ResultList as HeadlessResultList, SearchEngine, Unsubscribe } from '@coveo/headless';

import { Grid } from '@material-ui/core';
import ProductCard from '../ProductCard/ProductCard';
import CoveoUA, { getAnalyticsProductData } from '../../helpers/CoveoAnalytics';
import { normalizeProduct } from '../ProductCard/Product.spec';
export interface resultListProps {
  engine: SearchEngine;
  id: string;
}

export default class ResultList extends React.PureComponent<resultListProps> {
  private headlessResultList: HeadlessResultList;
  private headlessResultTemplateManager: ResultTemplatesManager;
  private unsubscribe: Unsubscribe = () => { };
  state: ResultListState;

  private prev_searchUid = '';

  constructor(props: any) {
    super(props);

    this.headlessResultList = buildResultList(this.props.engine);

    this.state = this.headlessResultList.state;

    this.headlessResultTemplateManager = buildResultTemplatesManager(this.props.engine);

    props.backgroundImage;

    this.headlessResultTemplateManager.registerTemplates({
      conditions: [],
      fields: ['category', 'clickUri', 'sku', 'title'],
      content: (result: Result) => (
        <Grid key={result.uniqueId} className={'CoveoResult'} item xs={12} md={4} lg={4} xl={3}>
          <ProductCard product={normalizeProduct(result)} engine={this.props.engine} result={result} />
        </Grid>
      ),
    });
  }

  componentDidMount() {
    this.unsubscribe = this.headlessResultList.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  searchUid() {
    return this.props.engine.state.search.response.searchUid;
  }

  searchImpressions() {
    const searchUid = this.searchUid();
    this.props.engine.state.search.results.forEach((product, index) => {
      const product_parsed = getAnalyticsProductData(product.raw, '', 0, false);
      CoveoUA.impressions({ ...product_parsed, position: index + 1 }, searchUid);
    });
    coveoua('send', 'event');
  }

  updateState() {
    this.setState(this.headlessResultList.state);

    const current_searchUid = this.props.engine.state.search.response.searchUid;
    if (this.hasResults() && this.prev_searchUid !== current_searchUid) {
      this.searchImpressions();
      this.prev_searchUid = current_searchUid;
    }
  }

  hasResults() {
    return this.state.results.length !== 0;
  }

  private get resultListTemplate() {
    return (
      <Grid id={this.props.id} className={'CoveoResultList result-grid'} container spacing={4} data-search-uid={this.searchUid()}>
        {this.state.results.map((_result: Result, index: number) => {
          // Need to clone the Result to add the index, as it's readonly.
          const result = {
            ..._result,
            raw: {
              ..._result.raw,
              index,
            },
          };
          const template: any = this.headlessResultTemplateManager.selectTemplate(result);
          return template(result);
        })}
      </Grid>
    );
  }

  render() {
    return this.resultListTemplate;
  }
}
