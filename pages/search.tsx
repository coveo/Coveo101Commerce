import getConfig from 'next/config';

import React from 'react';
import Head from 'next/head';
import ResultList from '../Components/Search/ResultList';
import { loadSearchActions, loadSearchAnalyticsActions, Unsubscribe } from '@coveo/headless';
import { headlessEngine } from '../helpers/Engine';
import { Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import ResultPerPage from '../Components/Search/ResultPerPage';
import SortBy from '../Components/Search/SortBy';
import Pager from '../Components/Search/Pager';
import QuerySummary from '../Components/Search/QuerySummary';
import Breadcrumb from '../Components/Facets/Breadcrumb';

import { withRouter, NextRouter } from 'next/router';
import RelevanceInspector from '../Components/RelevanceInspector/RelevanceInspector';
import NoResults from '../Components/Search/NoResults';
import FacetsColumn from '../Components/Facets/FacetsColumn';

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
  private prev_searchUid = '';

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
    const hasNoResults = searchResponse.searchUid && searchResponse.results.length === 0;
    this.setState({ hasNoResults });

    const current_searchUid = searchResponse.searchUid;
    if (this.prev_searchUid !== current_searchUid) {
      this.prev_searchUid = current_searchUid;
    }
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

  openFacetsMobile(openFacets: boolean = true) {
    this.setState({ openFacets });
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

          <FacetsColumn engine={headlessEngine} isOpen={this.state.openFacets} onClose={() => this.openFacetsMobile(false)} />

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
              <div className='pager'>
                <Pager engine={headlessEngine} />
              </div>
              <div className='result-per-page'>
                <ResultPerPage engine={headlessEngine} />
              </div>
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
