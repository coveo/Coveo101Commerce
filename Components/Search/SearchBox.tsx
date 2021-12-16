import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  buildSearchBox,
  SearchBoxState,
  SearchBox as HeadlessSearchBox,
  Unsubscribe,
  buildUrlManager,
  UrlManager,
  loadSearchActions,
  loadPaginationActions,
  loadQueryActions,
  loadSearchAnalyticsActions,
  HighlightUtils,
} from '@coveo/headless';
import { headlessEngine, headlessEngineQS } from '../../helpers/Engine';
import router, { withRouter, NextRouter } from 'next/router';
import getConfig from 'next/config';
import store from '../../reducers/cartStore';
import { Card, CardContent, CardMedia, Typography } from '@material-ui/core';
import { formatPrice } from '../Price';

const { publicRuntimeConfig } = getConfig();

interface SearchBoxProps {
  router?: NextRouter;
  color: string;
}

const searchAsYouTypeEnabled: boolean = publicRuntimeConfig.features?.searchAsYouType;

class SearchBox extends React.Component<SearchBoxProps> {
  private headlessSearchBox: HeadlessSearchBox;
  state: SearchBoxState;
  private searchPagePath = '/search';
  private unsubscribe: Unsubscribe = () => {};
  private urlManager: UrlManager;
  private unsubscribeUrlManager: Unsubscribe = () => {};
  private otherSuggestions = [];
  private handler;

  constructor(props: any) {
    super(props);

    this.headlessSearchBox = buildSearchBox(headlessEngine, {
      options: {
        highlightOptions: {
          notMatchDelimiters: {
            open: '<strong>',
            close: '</strong>',
          },
          correctionDelimiters: {
            open: '<i>',
            close: '</i>',
          },
        },
      },
    });
    this.state = this.headlessSearchBox.state;
  }

  componentDidMount() {
    this.unsubscribe = this.headlessSearchBox.subscribe(() => this.updateState());
    this.initUrlManager();
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.unsubscribeUrlManager();
    window.removeEventListener('popstate', this.onHashChange);
  }

  async getResultForSuggestions(q) {
    const searchActions = loadSearchActions(headlessEngineQS);
    const searchParActions = loadPaginationActions(headlessEngineQS);
    const queryActions = loadQueryActions(headlessEngineQS);
    const analyticsActions = loadSearchAnalyticsActions(headlessEngineQS);
    await headlessEngineQS.dispatch(queryActions.updateQuery({ q }));
    await headlessEngineQS.dispatch(searchParActions.registerNumberOfResults(3));
    const res = await headlessEngineQS.dispatch(searchActions.executeSearch(analyticsActions.logInterfaceLoad()));

    const results = (res?.payload as any)?.response?.results;
    this.otherSuggestions = [];
    if (results) {
      if (results?.length) {
        results.forEach((product) => {
          let img = product.raw['ec_images'][0] || product.raw['ec_images'];
          let title = HighlightUtils.highlightString({ content: product.title, highlights: product.titleHighlights, openingDelimiter: '<strong>', closingDelimiter: '</strong>' });

          this.otherSuggestions.push({
            highlightedValue: title,
            img,
            group: 'Products',
            rawValue: product.title,
            info: { url: product.clickUri, pid: product.raw['permanentid'], price: product.raw['ec_promo_price'] || product.raw['ec_price'] },
          });
        });
      }
    }
    this.updateState();
  }

  updateState() {
    //new object added explicitly for styling purpose
    let suggestions = [...this.headlessSearchBox.state.suggestions, { hideValue: true }];
    if (searchAsYouTypeEnabled && this.otherSuggestions && this.otherSuggestions.length > 0) {
      suggestions = suggestions.concat(this.otherSuggestions);
    }
    this.setState({ ...this.headlessSearchBox.state, suggestions: suggestions });
  }

  get fragment() {
    return window.location.hash.slice(1);
  }

  updateHash() {
    //Only adds/pushes the state when facets are selected or deselected
    const isFacetDeselected = window.location.hash.includes('f[') && this.urlManager.state.fragment.indexOf('f[') === -1;
    if (this.props.router.pathname == this.searchPagePath && (this.urlManager.state.fragment.includes('f[') || isFacetDeselected)) {
      history.pushState(null, document.title, `#${this.urlManager.state.fragment}`);
    }
  }

  onHashChange = () => {
    if (window.location.pathname == this.searchPagePath && this.props.router.pathname != this.searchPagePath) {
      this.handleRedirect();
    }
    //Synchronize only either when back or forward buttons are clicked (when in case of forced navigation)
    this.urlManager.synchronize(this.fragment);
  };

  initUrlManager() {
    this.urlManager = buildUrlManager(headlessEngine, {
      initialState: { fragment: this.fragment },
    });

    this.unsubscribeUrlManager = this.urlManager.subscribe(() => this.updateHash());

    window.addEventListener('popstate', this.onHashChange);
  }

  getSearchAsYouTypeResults() {
    let q = this.headlessSearchBox.state.value;
    if (q.length > 2) {
      clearTimeout(this.handler);
      this.handler = setTimeout(() => {
        this.getResultForSuggestions(q);
      }, 300);
    }
  }

  handleRedirect(option?: any) {
    if (option?.info?.pid) {
      // Navigate to PDP
      const routerOptions = {
        pathname: `/pdp/[sku]`,
        query: {
          sku: option.info.pid,
          model: '',
        },
      };

      const { storeId } = store.getState();
      if (storeId) {
        routerOptions.query['storeId'] = storeId;
      }
      this.props.router.push(routerOptions);
    } else {
      router.push(`/search#${this.urlManager.state.fragment}`);
    }
  }

  handleKeyPress(event: any) {
    if (event.key === 'Enter') {
      this.handleRedirect();
    }
  }

  render() {
    return (
      <div className='searchBox'>
        <Autocomplete
          disableCloseOnSelect={false}
          filterOptions={(options) => options}
          id='search-box'
          inputValue={this.state.value}
          onInputChange={(_, newInputValue) => {
            this.headlessSearchBox.updateText(newInputValue);

            if (searchAsYouTypeEnabled) {
              this.getSearchAsYouTypeResults();
            }
          }}
          groupBy={(option: any) => option.group || 'Suggestions'}
          onChange={(_, value) => {
            this.headlessSearchBox.submit();
            this.handleRedirect(value);
          }}
          onKeyPress={(e) => this.handleKeyPress(e)}
          options={this.state.suggestions}
          getOptionLabel={(option) => {
            return typeof option === 'object' ? option.rawValue : option;
          }}
          onFocus={() => {
            if (!this.headlessSearchBox.state.value) {
              this.headlessSearchBox.updateText('');
            }
          }}
          renderOption={(option) => {
            if (option.group === 'Products') {
              return (
                <div className={'productSuggestion_card'}>
                  <Card style={{ width: '200px', height: '230px' }} variant='outlined'>
                    <CardMedia component='img' height='150' width='150' image={option.img} alt={option.rawValue} />
                    <CardContent>
                      <Typography gutterBottom variant='body1' component='div' noWrap={false}>
                        {option.rawValue}
                      </Typography>
                      <Typography gutterBottom variant='body1' component='div' noWrap={false}>
                        <strong>{formatPrice(option.info?.price)}</strong>
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
              );
            } else {
              return <div className='redirection-div' dangerouslySetInnerHTML={{ __html: option.highlightedValue }}></div>;
            }
          }}
          freeSolo
          renderInput={(params) => <TextField {...params} id='filled-secondary' placeholder='Search' variant='outlined' size='small' />}></Autocomplete>
      </div>
    );
  }
}

export default withRouter(SearchBox);
