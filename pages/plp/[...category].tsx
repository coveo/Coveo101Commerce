import getConfig from 'next/config';
import React from 'react';
import { headlessEngine_PLP } from '../../helpers/Engine';
import Head from 'next/head';
import { loadAdvancedSearchQueryActions, loadSearchActions, loadSearchAnalyticsActions, Unsubscribe } from '@coveo/headless';
import Grid from '@mui/material/Grid';
import ResultPerPage from '../../Components/Search/ResultPerPage';
import Pager from '../../Components/Search/Pager';
import ResultList from '../../Components/Search/ResultList';
import { withRouter, NextRouter } from 'next/router';
import CategoryBreadcrumb from '../../Components/Categories/CategoryBreadcrumb';
import { Button } from '@mui/material';
import Breadcrumb from '../../Components/Facets/Breadcrumb';
import SortBy from '../../Components/Search/SortBy';
import { IProduct } from '../../Components/ProductCard/Product.spec';
import { setTabContext } from '../../helpers/Context';

import FacetsColumn from '../../Components/Facets/FacetsColumn';
import NoResults from '../../Components/Categories/NoResults';

const { publicRuntimeConfig } = getConfig();

interface IProductListingPage {
  router?: NextRouter;
}

interface IProductListingState {
  currentProductForCategory?: IProduct;
  currentPath: string[];
  openFacets: boolean;
  searchUid: string;
}

class ProductListingPage extends React.Component<IProductListingPage> {
  state: IProductListingState;
  private last_searchuid_for_ecView; string = '';
  private unsubscribe: Unsubscribe = () => { };

  constructor(props) {
    super(props);
    this.state = {
      currentProductForCategory: null,
      currentPath: [],
      openFacets: false,
      searchUid: '',
    };
  }

  componentDidMount() {
    this.last_searchuid_for_ecView = headlessEngine_PLP?.state?.search?.response?.searchUid;
    this.unsubscribe = headlessEngine_PLP.subscribe(() => this.updateState());
    this.dispatchNewAdvanceQuery();
  }

  componentDidUpdate() {
    this.dispatchNewAdvanceQuery();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  dispatchNewAdvanceQuery() {
    const category = this.props.router.query.category || [];
    const currentPath: string[] = typeof category === 'string' ? [category] : category;

    const currentPathAsString = currentPath.join('/');
    if (currentPathAsString && this.state.currentPath !== currentPath) {
      // query only when currentPath is new.
      this.setState({ currentPath });

      const fieldCategory = 'cat_slug';

      setTabContext(headlessEngine_PLP, currentPathAsString);

      const advancedSearchQueriesActions = loadAdvancedSearchQueryActions(headlessEngine_PLP);
      const analyticsActions = loadSearchAnalyticsActions(headlessEngine_PLP);
      const searchActions = loadSearchActions(headlessEngine_PLP);

      headlessEngine_PLP.dispatch(advancedSearchQueriesActions.updateAdvancedSearchQueries({ aq: `@${fieldCategory}=="${currentPathAsString}"` }));
      headlessEngine_PLP.dispatch(searchActions.executeSearch(analyticsActions.logInterfaceLoad()));
    }
  }

  updateState() {
    const search: any = headlessEngine_PLP.state.search || {};

    let newState: any = {};

    if (search.response.searchUid !== this.state.searchUid) {
      newState.searchUid = search.response.searchUid;
    }

    let firstResult = (search.results && search.results.length && search.results[0]) || {};
    if (firstResult !== this.state.currentProductForCategory) {
      newState.currentProductForCategory = firstResult;
    }

    if (this.state.currentPath !== this.props.router.query.category) {
      newState.currentPath = this.props.router.query.category;
    }

    // update state only if new values are set in the new state
    if (Object.keys(newState).length) {
      this.setState(newState, () => {
        if (newState.searchUid && (newState.searchUid !== this.last_searchuid_for_ecView)) {
          this.last_searchuid_for_ecView = newState.searchUid;
        }
      });
    }

  }

  openFacetsMobile(openFacets: boolean = true) {
    this.setState({ openFacets });
  }

  render() {
    if (!this.state.currentPath) {
      return null;
    }

    const firstResult: any = this.state.currentProductForCategory || {};
    const key = `${this.state.currentPath.join()}-${firstResult.uri}`;

    const searchResponse = headlessEngine_PLP.state.search.response;
    const hasNoResults = searchResponse.searchUid && searchResponse.results.length === 0;

    return (
      <>
        <Head>
          <title>Listing Page | {publicRuntimeConfig.title}</title>
          <meta property='og:title' content='Browse Catalog Listing Page' key='title' />
        </Head>

        {hasNoResults && <NoResults displayValue={this.state.currentPath.join('/')} />}

        <Grid container spacing={8} className='searchInterface' id='generic-store-plp' style={hasNoResults ? { display: 'none' } : {}}>

          <FacetsColumn engine={headlessEngine_PLP} isOpen={this.state.openFacets} onClose={() => this.openFacetsMobile(false)} />

          <Grid item className={'search__result-section'}>
            <Grid item xs={12}>
              <Button onClick={() => this.openFacetsMobile()} className='btn--filters'>
                Filters
              </Button>
            </Grid>
            <Grid item container className='search-nav'>
              <CategoryBreadcrumb key={key} current={this.state.currentPath} product={this.state.currentProductForCategory} />
              <SortBy engine={headlessEngine_PLP} />
            </Grid>
            <Grid item xs={12}>
              <Breadcrumb engine={headlessEngine_PLP} />
            </Grid>
            <ResultList id='result-list--category-page' engine={headlessEngine_PLP} />
            <Grid item container justifyContent='space-between' spacing={2} className='search__footer-ui'>
              <Pager engine={headlessEngine_PLP} />
              <ResultPerPage engine={headlessEngine_PLP} />
            </Grid>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withRouter(ProductListingPage);
