import React from 'react';

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
import { Autocomplete, Card, CardContent, CardMedia, TextField, Typography } from '@mui/material';
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
  private unsubscribe: Unsubscribe = () => { };
  private urlManager: UrlManager;
  private unsubscribeUrlManager: Unsubscribe = () => { };
  private productsSuggestions = [];
  private lastQSQueryString: string;
  private lastPath: string;

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
    this.lastPath = '';
  }

  componentDidMount() {
    this.unsubscribe = this.headlessSearchBox.subscribe(() => this.getSearchAsYouTypeResults());
    this.initUrlManager();
  }

  componentDidUpdate() {
    const path = this.props.router.pathname;
    if (path !== this.searchPagePath && path !== this.lastPath && this.state?.value) {
      // clear value when navigating away from the search page.
      this.setState({ value: '', suggestions: [] });
      return null;
    }
    this.lastPath = path;
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

    this.lastQSQueryString = q;

    const res = await headlessEngineQS.dispatch(searchActions.executeSearch(analyticsActions.logInterfaceLoad()));
    if ('error' in res) {
      // usually a query aborted by a new query
      // We don't want to update to the Query Suggestions on errors/cancelled queries.
      return;
    }

    const results = (res?.payload as any)?.response?.results;
    this.productsSuggestions = [];
    if (results) {
      if (results?.length) {
        results.forEach((product) => {
          let img = product.raw['ec_images'][0] || product.raw['ec_images'];
          let title = HighlightUtils.highlightString({ content: product.title, highlights: product.titleHighlights, openingDelimiter: '<strong>', closingDelimiter: '</strong>' });

          this.productsSuggestions.push({
            highlightedValue: title,
            img,
            group: 'Products',
            rawValue: product.title,
            info: { url: product.clickUri, pid: product.raw['permanentid'], price: product.raw['ec_promo_price'] || product.raw['ec_price'] },
          });
        });
      }
    }
  }

  updateState() {
    //new object added explicitly for styling purpose
    let suggestions = [...this.headlessSearchBox.state.suggestions];
    if (suggestions.length) {
      (suggestions as any).push({ hideValue: true });
      if (searchAsYouTypeEnabled && this.productsSuggestions?.length > 0) {
        suggestions = suggestions.concat(this.productsSuggestions);
      }
    }
    this.setState({ ...this.headlessSearchBox.state, suggestions: suggestions });
  }

  get fragment() {
    return window.location.hash.slice(1);
  }

  updateHash() {
    //Only adds/pushes the state when facets are selected or deselected
    const isFacetDeselected = window.location.hash.includes('f[') && this.urlManager.state.fragment.indexOf('f[') === -1;
    if (this.props.router.pathname === this.searchPagePath && (this.urlManager.state.fragment.includes('f[') || isFacetDeselected)) {
      history.pushState(null, document.title, `#${this.urlManager.state.fragment}`);
    }
  }

  onHashChange = () => {
    if (window.location.pathname === this.searchPagePath && this.props.router.pathname !== this.searchPagePath) {
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

  async getSearchAsYouTypeResults() {
    const firstSuggestion = this.headlessSearchBox.state?.suggestions[0]?.rawValue;
    if (firstSuggestion !== this.lastQSQueryString && searchAsYouTypeEnabled) {
      let q = firstSuggestion;
      await this.getResultForSuggestions(q);
    }
    this.updateState();
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

  async handleOnHighlightChange(event: any, option) {
    //for keydown events the tagname changes to 'INPUT'
    if (event?.target.tagName === 'LI' || event?.target.tagName === 'INPUT') {
      await this.getResultForSuggestions(option?.rawValue);
      this.updateState();
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
          onInputChange={(event: any, newInputValue: string, reason: string) => {
            if (reason == 'reset' && !event) {
              //else autocomplete will trigger update state with empty value
              return;
            }
            if (event?.type !== 'keydown') {
              this.headlessSearchBox.updateText(newInputValue);
            }
          }}
          groupBy={(option: any) => option.group || 'Suggestions'}
          onChange={(event: any, value, reason: string) => {
            //to handle the keypress on option explicitly
            if (reason == 'selectOption' && event?.key == 'Enter') {
              this.headlessSearchBox.updateText(value?.rawValue);
            }

            this.headlessSearchBox.submit();
            this.handleRedirect(value);
          }}
          onHighlightChange={(e, option) => this.handleOnHighlightChange(e, option)}
          options={this.state.suggestions}
          getOptionLabel={(option) => {
            return option?.rawValue || '';
          }}
          onFocus={() => {
            if (!this.headlessSearchBox.state.value) {
              this.headlessSearchBox.updateText('');
            }
          }}
          renderOption={(props, option) => {
            if (option.group === 'Products') {
              return (
                <div className={'productSuggestion_card'} key={'ps_' + option.info.pid}>
                  <Card {...(props as any)} className='productSuggestion_card' style={{ width: '200px', height: '230px' }} variant='outlined'>
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
              return <li className='redirection-div' {...(props as any)} dangerouslySetInnerHTML={{ __html: option.highlightedValue }}></li>;
            }
          }}
          freeSolo
          renderInput={(params) => <TextField {...params} id='filled-secondary' placeholder='Search' variant='outlined' size='small' />}></Autocomplete>
      </div>
    );
  }
}

export default withRouter(SearchBox);
