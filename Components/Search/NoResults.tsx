import React from 'react';
import { buildHistoryManager, buildQuerySummary, HistoryManager, QuerySummary } from '@coveo/headless';
import { headlessEngine } from '../../helpers/Engine';
import { Container, Typography } from '@mui/material';
import PopularBought from '../Recommendations/PopularBought';
import UserRecommender from '../Recommendations/UserRecommender';

export default class NoResults extends React.Component {
  private headlessHistory: HistoryManager;
  private querySummary: QuerySummary;

  constructor(props: any) {
    super(props);
    this.headlessHistory = buildHistoryManager(headlessEngine);
    this.querySummary = buildQuerySummary(headlessEngine);
  }

  goBackHistory() {
    this.headlessHistory.back();
  }

  render() {
    if (typeof window === 'undefined') {
      return null;
    }

    return (
      <Container className='noResults-container'>
        <Typography className='display-message' variant='subtitle1' align='center'>
          Ooops...we did not find anything for <span className='query'>{this.querySummary.state.query}</span>
        </Typography>
        <Typography variant='subtitle1' align='center' style={{ fontSize: '16px' }}>
          Try using different or more general keyword or you could check out some of our recommendations below.
        </Typography>
        <div className='recommendations-box'>
          <UserRecommender title='Recommended Styles' searchHub='NoResults' />
          <PopularBought title='Popularly Bought' searchHub='NoResults' />
        </div>
      </Container>
    );
  }
}
