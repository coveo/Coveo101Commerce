import React from 'react';
import Head from 'next/head';
import { withRouter, NextRouter } from 'next/router';
import { Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@material-ui/core';
import { emitBasket, emitUser, emitUV } from '../../helpers/CoveoAnalytics';
import PopularViewed from '../../Components/Recommendations/PopularViewed';
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

  render() {
    return (
      <>
        <Head>
          <title>Confirmation | {publicRuntimeConfig.title}</title>
          <meta property='og:title' content='Confirmation' key='title' />
        </Head>
        <Container fixed maxWidth='sm' className='confirmation-container'>
          <Typography variant='h2' align='center'>
            THANK YOU!
          </Typography>
          <br />
          <Typography variant='h6' align='center'>
            Your Order Number is <span className='confirmation-order-number'>{this.props.orderId.substring(0, 7)}</span>
          </Typography>
          <Typography variant='h6' align='center'>
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
          <PopularViewed title='Top viewed' searchHub='Checkout' />
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
