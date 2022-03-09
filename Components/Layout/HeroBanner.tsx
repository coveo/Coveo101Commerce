import React from 'react';
import {
  Unsubscribe,
  buildResultList,
  ResultListState,
  ResultList as HeadlessResultList,
  loadSearchAnalyticsActions,
  loadSearchActions,
  loadPaginationActions,
  loadQueryActions,
} from '@coveo/headless';
import { headlessEngine_Banner } from '../../helpers/Engine';
import { routerPush } from '../../helpers/Context';

import { Grid, Card, CardMedia, Button } from '@mui/material';
import { NextRouter, withRouter } from 'next/router';

interface IHeroBannerProps {
  router?: NextRouter;
}

export class HeroBanner extends React.PureComponent<IHeroBannerProps> {
  private headlessResultList: HeadlessResultList;
  private unsubscribe: Unsubscribe = () => { };
  state: ResultListState;

  constructor(props) {
    super(props);
    this.headlessResultList = buildResultList(headlessEngine_Banner);
    this.state = this.headlessResultList.state;
  }

  componentDidMount() {
    const analyticActions = loadSearchAnalyticsActions(headlessEngine_Banner);
    const searchActions = loadSearchActions(headlessEngine_Banner);
    headlessEngine_Banner.dispatch(searchActions.executeSearch(analyticActions.logInterfaceLoad()));

    this.unsubscribe = this.headlessResultList.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  updateState() {
    this.setState(this.headlessResultList.state);
  }

  async goToSearchPage() {
    this.props.router?.push('/search');
  }

  async getImageResult() {
    const analyticActions = loadSearchAnalyticsActions(headlessEngine_Banner);
    const searchActions = loadSearchActions(headlessEngine_Banner);
    const searchParActions = loadPaginationActions(headlessEngine_Banner);
    const queryActions = loadQueryActions(headlessEngine_Banner);
    headlessEngine_Banner.dispatch(queryActions.updateQuery({ q: 'men tee' }));
    headlessEngine_Banner.dispatch(searchParActions.registerNumberOfResults(1));
    await headlessEngine_Banner.dispatch(searchActions.executeSearch(analyticActions.logInterfaceLoad()));
  }

  renderCard(result) {
    let resultImage: string = typeof result.raw.ec_images === 'string' ? result.raw.ec_images : result.raw.ec_images[0];
    if (!resultImage) {
      resultImage = '/missing.svg';
    }
    return (
      <Grid item xs={12} key={result.uniqueId}>
        <Card className='hero__card hero__card--lg'>
          <CardMedia className='hero__card-img' image={resultImage} />
        </Card>
      </Grid>
    );
  }

  private goToCategory(q: string) {
    routerPush(this.props.router, { pathname: '/plp/[...category]', query: { category: q } });
  }

  render() {
    return (
      <Grid container>
        <Grid item xs={12}>
          <Grid container className='hero-banner-1'>
            <Grid item xs={12} sm={6}>
              <Grid container>
                <Grid item xs={12}>
                  <Grid item xs={12} style={{ background: `url(/banner1_small_image.png)` }} className='banner1-small-img'>
                    <div className={'banner1-img-text'}>Sweater Weather</div>
                  </Grid>
                </Grid>
                <Grid item xs={12} className='hero-text__grid'>
                  <div className='hero__tl'>The Closet Collective</div>
                  <div className='hero__subtl'>Get ready for the new season with a collection of affordable and warm clothes.</div>
                  <Button className='btn--hero hero-text__btn' onClick={() => this.goToSearchPage()}>
                    <span className='hero__txt'>Shop now</span>
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid item style={{ background: `url(/banner1_large_image.png)` }} className='banner1-large-img'></Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <div id='q-bestsellers' className='q-recomendations'></div>
        </Grid>
        <Grid item xs={12} id='hero-banner-2'>
          <Grid container className='hero-jeans-grid'>
            <Grid item xs={6}>
              <Grid container direction='column'>
                <Grid item className='banner2-text-grid'>
                  <div className='banner2-text1'> Jeans for everyone </div>
                  <div className='banner2-text2'>Not everyone is made the same. This is why we have an extended selection of jeans to fit everybody just the perfect way!</div>
                  <Button className='banner2-btn' onClick={() => this.goToCategory('men/jeans')}>
                    Find your perfect jeans
                  </Button>
                </Grid>
                <Grid item className='banner2-stock-image' style={{ background: `url(/bannerjeans.png)` }}></Grid>
              </Grid>
            </Grid>
            <Grid item xs={5}>
              <img className='banner2-product-image' src={'https://fashion.coveodemo.com/images/225538_cn15616160.jpg'} alt='jeans-product-image'></img>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withRouter(HeroBanner);
