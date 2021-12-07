import getConfig from 'next/config';

import React from 'react';
import Head from 'next/head';
import ResultList from '../Components/Search/ResultList';
import ReactFacet from '../Components/Facets/Facet';
import FacetColor from '../Components/Fashion/FacetColor';
import FacetSize from '../Components/Fashion/FacetSize';
import CategoryFacet from '../Components/Categories/CategoryFacet';
import { loadSearchActions, loadSearchAnalyticsActions, Unsubscribe } from '@coveo/headless';
import { headlessEngine } from '../helpers/Engine';
import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import ResultPerPage from '../Components/Search/ResultPerPage';
import SortBy from '../Components/Search/SortBy';
import Pager from '../Components/Search/Pager';
import QuerySummary from '../Components/Search/QuerySummary';
import Breadcrumb from '../Components/Facets/Breadcrumb';
import FacetManager from '../Components/Facets/FacetManager';

import { withRouter, NextRouter } from 'next/router';
import RelevanceInspector from '../Components/RelevanceInspector/RelevanceInspector';
import NoResults from '../Components/Search/NoResults';

const { publicRuntimeConfig } = getConfig();

interface SearchState {
  openFacets: boolean;
  hasNoResults: boolean;
}

interface SearchPageProps {
  router?: NextRouter;
}

class SearchPage extends React.Component<SearchPageProps, SearchState> {
  private unsubscribe: Unsubscribe = () => { };
  constructor(props) {
    super(props);

    this.state = {
      openFacets: false,
      hasNoResults: false,
    };
  }

  componentDidMount() {
    if (this.props.router.isReady) {
      this.initSearch();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.router.isReady && this.props.router.isReady) {
      this.initSearch();
    }
  }

  onStateUpdate = () => {
    const searchResponse = headlessEngine.state.search.response;
    // need to check for searchUid to avoid showing NoResults before the first search is sent.
    const hasNoResults = searchResponse.searchUid && (searchResponse.results.length === 0);
    this.setState({ hasNoResults });
  };

  componentWillUnmount() {
    this.unsubscribe();
  }

  initSearch() {
    const analyticActions = loadSearchAnalyticsActions(headlessEngine);
    const searchActions = loadSearchActions(headlessEngine);
    headlessEngine.dispatch(searchActions.executeSearch(analyticActions.logInterfaceLoad()));
    this.unsubscribe = headlessEngine.subscribe(this.onStateUpdate);
  }

  openFacetsMobile() {
    this.setState({ openFacets: true });
  }

  closeFacetsMobile() {
    this.setState({ openFacets: false });
  }

  render() {
    return (
      <>
        <Head>
          <title>Search | {publicRuntimeConfig.title}</title>
          <meta property='og:title' content='Search' key='title' />
        </Head>
        {publicRuntimeConfig.customCSS && <link rel='stylesheet' href={publicRuntimeConfig.customCSS}></link>}
        {this.state.hasNoResults && <NoResults />}
        <Grid container spacing={10} className='searchInterface' id='generic-store-main-search' style={this.state.hasNoResults ? { display: 'none' } : {}}>
          <div className={this.state.openFacets ? 'search-facets__container show-facets' : 'search-facets__container'}>
            <div className='mobile-backdrop' onClick={() => this.closeFacetsMobile()}></div>
            <Grid item className='search__facet-column'>
              <Button onClick={() => this.closeFacetsMobile()} className='btn--close-facets'>
                Close
              </Button>
              <CategoryFacet id='category-facet--ec_category' engine={headlessEngine} facetId='ec_category' label='Category' field='ec_category' />

              {publicRuntimeConfig.features?.colorField && (
                <FacetColor id='color' engine={headlessEngine} facetId={publicRuntimeConfig.features.colorField} label='Color' field={publicRuntimeConfig.features.colorField} />
              )}
              {publicRuntimeConfig.features?.sizeField && (
                <FacetSize id='size' engine={headlessEngine} facetId={publicRuntimeConfig.features.sizeField} label='Size' field={publicRuntimeConfig.features.sizeField} />
              )}

              <FacetManager engine={headlessEngine} additionalFacets={publicRuntimeConfig.facetFields}>
                <ReactFacet id='facet--ec_brand' engine={headlessEngine} facetId='ec_brand' label='Manufacturer' field='ec_brand' />
              </FacetManager>
            </Grid>
          </div>
          <Grid item className={'search__result-section'}>
            <Grid item xs={12}>
              <Button onClick={() => this.openFacetsMobile()} className='btn--filters'>
                Filters
              </Button>
            </Grid>
            <Grid item container className='search-nav'>
              <QuerySummary engine={headlessEngine} />
              <SortBy engine={headlessEngine} />
            </Grid>
            <Grid item xs={12}>
              <Breadcrumb engine={headlessEngine} />
            </Grid>
            <ResultList id='result-list--search-page' engine={headlessEngine} />
            <Grid item container justifyContent='space-between' spacing={2} className='search__footer-ui'>
              <Pager engine={headlessEngine} />
              <ResultPerPage engine={headlessEngine} />
            </Grid>
            <Grid item xs={6}>
              <RelevanceInspector />
            </Grid>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withRouter(SearchPage);
