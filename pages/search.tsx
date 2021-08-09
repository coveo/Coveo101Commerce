import getConfig from 'next/config';

import React from "react";
import Head from 'next/head';
import ResultList from "../Components/Search/ResultList";
import ReactFacet from "../Components/Facets/Facet";
import FacetColor from "../Components/Fashion/FacetColor";
import FacetSize from "../Components/Fashion/FacetSize";
import CategoryFacet from "../Components/Categories/CategoryFacet";
import { loadSearchActions, loadSearchAnalyticsActions } from "@coveo/headless";
import { headlessEngine } from "../helpers/Engine";
import { Button } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import ResultPerPage from "../Components/Search/ResultPerPage";
import SortBy from "../Components/Search/SortBy";
import Pager from "../Components/Search/Pager";
import QuerySummary from "../Components/Search/QuerySummary";
import Breadcrumb from "../Components/Facets/Breadcrumb";
import FacetManager from "../Components/Facets/FacetManager";
import { setContext } from "../helpers/Context";

import { withRouter, NextRouter } from 'next/router';
import RelevanceInspector from "../Components/RelevanceInspector/RelevanceInspector";

const { publicRuntimeConfig } = getConfig();

interface SearchState {
  openFacets: boolean;
}

interface SearchPageProps {
  router?: NextRouter;
}

class SearchPage extends React.Component<SearchPageProps, SearchState> {
  constructor(props) {
    super(props);

    this.state = {
      openFacets: false
    };
  }

  setContextForTest() {
    // When executed from tests, make sure to set the context
    const fromTest = this.props.router.query['fromTest'];
    if (fromTest) {
      setContext(headlessEngine);
    }
  }

  componentDidUpdate() {
    this.setContextForTest();
  }

  componentDidMount() {
    // Execute initial search when query is empty
    if (headlessEngine.state.query.q === '') {
      this.setContextForTest();

      const analyticActions = loadSearchAnalyticsActions(headlessEngine);
      const searchActions = loadSearchActions(headlessEngine);
      headlessEngine.dispatch(searchActions.executeSearch(analyticActions.logInterfaceLoad()));
    }
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
          <meta property="og:title" content="Search" key="title" />
        </Head>
        {publicRuntimeConfig.customCSS && <link rel="stylesheet" href={publicRuntimeConfig.customCSS}></link>}
        <Grid container spacing={10} className="searchInterface" id="generic-store-main-search">
          <div className={this.state.openFacets ? "search-facets__container show-facets" : "search-facets__container"}>
            <div className="mobile-backdrop" onClick={() => this.closeFacetsMobile()}></div>
            <Grid item className="search__facet-column">
              <Button onClick={() => this.closeFacetsMobile()} className="btn--close-facets">Close</Button>
              <CategoryFacet id="category-facet--ec_category" engine={headlessEngine} facetId="ec_category" label="Category" field="ec_category" />

              <FacetColor id="color" engine={headlessEngine} facetId="cat_color" label="Color" field="cat_color" />
              <FacetSize id="size" engine={headlessEngine} facetId="cat_size" label="Size" field="cat_size" />

              <FacetManager engine={headlessEngine} additionalFacets={publicRuntimeConfig.facetFields}>
                <ReactFacet id="facet--ec_brand" engine={headlessEngine} facetId="ec_brand" label="Manufacturer" field="ec_brand" />
              </FacetManager>
            </Grid>
          </div>
          <Grid item className={"search__result-section"}>
            <Grid item xs={12}>
              <Button onClick={() => this.openFacetsMobile()} className="btn--filters">Filters</Button>
            </Grid>
            <Grid item container className="search-nav">
              <QuerySummary engine={headlessEngine} />
              <SortBy engine={headlessEngine} />
            </Grid>
            <Grid item xs={12}>
              <Breadcrumb engine={headlessEngine} />
            </Grid>
            <ResultList id='result-list--search-page' engine={headlessEngine} />
            <Grid item container justifyContent="space-between" spacing={2} className="search__footer-ui">
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
