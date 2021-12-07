import getConfig from 'next/config';
import React from 'react';
import { headlessEngine_PLP } from '../../helpers/Engine';
import Head from 'next/head';
import { loadAdvancedSearchQueryActions, loadSearchActions, loadSearchAnalyticsActions, Unsubscribe } from '@coveo/headless';
import Grid from '@material-ui/core/Grid';
import ResultPerPage from '../../Components/Search/ResultPerPage';
import Pager from '../../Components/Search/Pager';
import ResultList from '../../Components/Search/ResultList';
import { withRouter, NextRouter } from 'next/router';
import CategoryBreadcrumb from '../../Components/Categories/CategoryBreadcrumb';
import { Button } from '@material-ui/core';
import Breadcrumb from '../../Components/Facets/Breadcrumb';
import SortBy from '../../Components/Search/SortBy';
import ReactFacet from '../../Components/Facets/Facet';
import FacetManager from '../../Components/Facets/FacetManager';
import CategoryFacet from '../../Components/Categories/CategoryFacet';
import { IProduct } from '../../Components/ProductCard/Product.spec';
import { setTabContext } from '../../helpers/Context';
import FacetColor from '../../Components/Fashion/FacetColor';
import FacetSize from '../../Components/Fashion/FacetSize';

const { publicRuntimeConfig } = getConfig();

interface IProductListingPage {
  router?: NextRouter;
}

interface IProductListingState {
  currentProductForCategory?: IProduct;
  currentPath: string[];
  openFacets: boolean;
}

class ProductListingPage extends React.Component<IProductListingPage> {
  state: IProductListingState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props) {
    super(props);
    this.state = {
      currentProductForCategory: null,
      currentPath: [],
      openFacets: false,
    };
  }

  componentDidMount() {
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

    if (currentPath.join('/') && this.state.currentPath !== currentPath) {
      // query only when currentPath is new.
      this.setState({ currentPath });

      const fieldCategory = 'cat_slug';

      setTabContext(headlessEngine_PLP, currentPath.join('/'));

      const advancedSearchQueriesActions = loadAdvancedSearchQueryActions(headlessEngine_PLP);
      const analyticsActions = loadSearchAnalyticsActions(headlessEngine_PLP);
      const searchActions = loadSearchActions(headlessEngine_PLP);
      headlessEngine_PLP.dispatch(advancedSearchQueriesActions.updateAdvancedSearchQueries({ aq: `@${fieldCategory}=="${currentPath.join('/')}"` }));
      headlessEngine_PLP.dispatch(searchActions.executeSearch(analyticsActions.logInterfaceLoad()));
    }
  }

  updateState() {
    const search: any = headlessEngine_PLP.state.search || {};

    let firstResult = (search.results && search.results.length && search.results[0]) || {};
    if (firstResult !== this.state.currentProductForCategory) {
      this.setState({ currentProductForCategory: firstResult });
    }

    if (this.state.currentPath !== this.props.router.query.category) {
      this.setState({
        currentPath: this.props.router.query.category,
      });
    }
  }

  openFacetsMobile() {
    this.setState({ openFacets: true });
  }

  closeFacetsMobile() {
    this.setState({ openFacets: false });
  }

  render() {
    if (!this.state.currentPath) {
      return null;
    }

    const firstResult: any = this.state.currentProductForCategory || {};
    const key = `${this.state.currentPath.join()}-${firstResult.uri}`;

    return (
      <>
        <Head>
          <title>Listing Page | {publicRuntimeConfig.title}</title>
          <meta property='og:title' content='Browse Catalog Listing Page' key='title' />
        </Head>

        <Grid container spacing={8} className='searchInterface' id='generic-store-plp'>
          <div className={this.state.openFacets ? 'search-facets__container show-facets' : 'search-facets__container'}>
            <div className='mobile-backdrop' onClick={() => this.closeFacetsMobile()}></div>
            <Grid item className='search__facet-column'>
              <Button onClick={() => this.closeFacetsMobile()} className='btn--close-facets'>
                Close
              </Button>
              <CategoryFacet
                currentPath={this.state.currentPath}
                productForCategory={this.state.currentProductForCategory}
                id='category-facet--ec_category'
                engine={headlessEngine_PLP}
                facetId='ec_category'
                label='Category'
                field='ec_category'
              />

              {publicRuntimeConfig.features?.colorField && <FacetColor id='facet-color' engine={headlessEngine_PLP} facetId='f_color' label='Color' field={publicRuntimeConfig.features.colorField} />}
              {publicRuntimeConfig.features?.sizeField && <FacetSize id='facet-size' engine={headlessEngine_PLP} facetId='f_size' label='Size' field={publicRuntimeConfig.features.sizeField} />}

              <FacetManager engine={headlessEngine_PLP} additionalFacets={publicRuntimeConfig.facetFields}>
                <ReactFacet id='facet-brand' engine={headlessEngine_PLP} facetId='f_brand' label='Manufacturer' field='ec_brand' />
                <ReactFacet id='facet-availability' engine={headlessEngine_PLP} facetId='f_availability' label='Availability' field='ec_in_stock' />
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
