import React from 'react';
import Head from 'next/head';
import { withRouter, NextRouter } from 'next/router';
import { Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';

import UserRecommender from '../../Components/Recommendations/UserRecommender';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

interface IConfirmationProps {
  router?: NextRouter;
  orderId: string;
}

interface IConfirmationState {
  open: boolean;
}

class Confirmation extends React.Component<IConfirmationProps, IConfirmationState> {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  async goToSearchPage() {
    this.props.router?.push('/search');
  }

  render() {
    return (
      <>
        <Head>
          <title>Confirmation | {publicRuntimeConfig.title}</title>
          <meta property='og:title' content='Confirmation' key='title' />
        </Head>
        <Container fixed className='confirmation-container'>
          <Typography className='confirmation-header' align='center'>
            Thank you, your order has been received.
          </Typography>
          <br />
          <Typography className='confirmation-subheader1' align='center'>
            Your Order Number is <span className='confirmation-order-number'>{this.props.orderId.substring(0, 7)}</span>
          </Typography>
          <Typography className='confirmation-subheader2' align='center'>
            We are getting started on your order right away. The estimated delivery time is 5-7 business days. In the meantime, keep exploring our new fashion additions and get inspired by the latest
            trends.
          </Typography>
          <Typography
            className='confirmation-dialog__label'
            variant='subtitle1'
            align='center'
            onClick={() => {
              this.setState({ open: true });
            }}>
            Read about our return policy
          </Typography>
          <Button className='cart-confirmation__btn' onClick={() => this.goToSearchPage()}>
            Shop New Arrivals
          </Button>
          <Dialog open={this.state.open} scroll={'paper'}>
            <DialogTitle>Return Policy</DialogTitle>
            <DialogContent dividers={true}>
              <DialogContentText tabIndex={-1} className='return-policy-text'>
                {`We offer a 30-day return policy in-store and online.
Some store locations may be temporarily closed due to COVID-19, so for your convenience we have a 30-day return policy from the date our stores reopen for the regions affected by closures.

PLEASE NOTE:
Refunds are issued on the original method of payment.
Online orders returned in-store are refunded on a gift card.
See below for full details.

Please see our return eligibility criteria below before returning or exchanging any items.`}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  this.setState({ open: false });
                }}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
        <div className='confirmation-popular-viewed'>
          <UserRecommender title='For your next visit' searchHub='Confirmation' />
        </div>
      </>
    );
  }
}

export default withRouter(Confirmation);

export async function getServerSideProps({ query }) {
  return {
    props: { orderId: query.orderId },
  };
}
