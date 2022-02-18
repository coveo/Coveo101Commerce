import React from 'react';
import {
  Unsubscribe,
  buildResultList,
  ResultListState,
  ResultList as HeadlessResultList,
  loadSearchAnalyticsActions,
  loadSearchActions
} from '@coveo/headless';
import { headlessEngine_Banner } from '../../helpers/Engine';
import { Grid, Card, CardMedia, Button, Typography } from '@mui/material';
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

  render() {
    const results = this.state.results;
    const spacing = 4;
    return (
      <Grid container spacing={0} className='hero'>
        <Grid item xs={12} md={5} className='hero__content'>
          <Typography variant='h1' className='hero__tl'>
            Welcome to the <span className='hero__tl-sp'>Coveo</span> Commerce Store
          </Typography>
          <p className='hero__subtl'>Browse, Search &amp; Shop.</p>
          <p className='hero__txt'>Check out our latest features and capabilities in the Commerce world. Don&apos;t miss out!</p>
          <Button className='btn--hero' onClick={() => this.goToSearchPage()}>
            See our catalog
          </Button>
        </Grid>
        <Grid item container xs={12} md={7} spacing={0} className='hero__grid'>
          <Grid item container spacing={spacing} xs={4} className='hero__column-1'>
            {results.slice(0, 3).map((result) => this.renderCard(result))}
          </Grid>
          <Grid item container spacing={spacing} xs={4} className='hero__column-2'>
            {results.slice(3, 6).map((result) => this.renderCard(result))}
          </Grid>
          <Grid item container spacing={spacing} xs={4} className='hero__column-3'>
            {results.slice(6, 9).map((result) => this.renderCard(result))}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withRouter(HeroBanner);
