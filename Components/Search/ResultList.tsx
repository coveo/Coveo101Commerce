/* globals coveoua */

import React from "react";
import {
  buildResultList,
  buildResultTemplatesManager,
  ResultTemplatesManager,
  Result,
  ResultListState,
  ResultList as HeadlessResultList,
  SearchEngine,
  Unsubscribe,
} from "@coveo/headless";

import { Grid } from "@material-ui/core";
import ProductCard from "../ProductCard/ProductCard";
import CoveoUA, { getAnalyticsProductData } from '../../helpers/CoveoAnalytics';
import { normalizeProduct } from "../ProductCard/Product.spec";
export interface resultListProps {
  engine: SearchEngine,
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
        <Grid key={result.uniqueId} className={'CoveoResult'} item xs={6} md={4} lg={3}>
          <ProductCard product={normalizeProduct(result)} searchUid={this.props.engine.state.search.response.searchUid} />
        </Grid>
      )
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
      const product_parsed = getAnalyticsProductData(product.raw, 0, false);
      CoveoUA.impressions({ ...product_parsed, position: index + 1 }, searchUid);
    });
    // coveoua('ec:setAction', 'impression');
    CoveoUA.setFromTester();
    coveoua('send', 'event');
  }

  updateState() {
    this.setState(this.headlessResultList.state);
    this.onNewSearchEvent();
  }

  hasResults() {
    return this.state.results.length !== 0;
  }

  private get resultListTemplate() {

    return <Grid id={this.props.id} className={'CoveoResultList'} container spacing={4} data-search-uid={this.searchUid()}>{this.state.results.map((_result: Result, index: number) => {
      // Need to clone the Result to add the index, as it's readonly.
      const result = {
        ..._result,
        raw: {
          ..._result.raw,
          index,
        }
      };
      const template: any = this.headlessResultTemplateManager.selectTemplate(
        result
      );
      return template(result);
    })}</Grid>;
  }

  onNewSearchEvent() {
    const current_searchUid = this.props.engine.state.search.response.searchUid;
    const response: any = this.props.engine.state.search.response;
    let custom = {};
    if (window.location.href.indexOf('fromTest') != -1) {
      custom['context_fromtester'] = true;
    }
    const searchPayload = {
      searchQueryUid: response.searchUid,
      queryText: response.basicExpression,
      actionCause: 'searchBoxSubmit',
      customData: custom,
      responseTime: response.duration,
      advancedQuery: response.advancedExpression,
      numberOfResults: response.totalCount,
      results: response.results.map(r => ({ documentUri: r.uri, documentUriHash: r.raw.urihash })),
      queryPipeline: response.pipeline,
    };

    if (searchPayload.queryText) {
      coveoua('send', 'search', searchPayload);
    }

    if (this.hasResults() && this.prev_searchUid !== current_searchUid) {
      this.searchImpressions();
      this.prev_searchUid = current_searchUid;
    }
  }

  render() {
    return (this.resultListTemplate);
  }
}
