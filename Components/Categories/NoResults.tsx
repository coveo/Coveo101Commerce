import React from 'react';
import { Container, Typography } from '@mui/material';
import PopularBought from '../Recommendations/PopularBought';

export interface NoResultsProps {
  displayValue: string;
}

export default class NoResults extends React.Component<NoResultsProps> {

  render() {
    return (
      <Container className='noResults-container'>
        <Typography className='display-message' variant='subtitle1' align='center'>
          There are no products in this category yet.
          <br /><br />
          <code>{this.props.displayValue}</code>
          <br /><br />
        </Typography>

        <PopularBought title='Popularly Bought' searchHub='NoResults' />
      </Container>
    );
  }
}
