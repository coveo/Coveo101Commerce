import React from 'react';
import { withRouter, NextRouter } from 'next/router';

import { Container, Grid, Typography, TextField, InputAdornment } from '@mui/material';
import ArrowRightAltOutlinedIcon from '@mui/icons-material/ArrowRightAltOutlined';

interface IFooterProps {
  router?: NextRouter;
}

class Footer extends React.Component<IFooterProps> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container maxWidth='xl' className='footer__container'>
        <Grid container alignItems={'center'} style={{ height: '100%', paddingTop: '15px', paddingBottom: '15px' }}>
          <Grid className='footer-email-subscription-grid' item xs={12} sm={7}>
            <div style={{ marginLeft: '45px' }}>
              <Typography className='email-sub-header'>{"Let's Keep in Touch"} </Typography>
              <Typography className='email-sub-text'>{`We send you really good emails about our collection, new products and deals. Don't miss out!`} </Typography>
              <TextField
                id='email-sub-inputField'
                label='Subscribe'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <ArrowRightAltOutlinedIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          </Grid>
          <Grid item className='footer-options-grid' xs={12} sm={5}>
            <div style={{ marginLeft: '30px' }}>
              <div>FAQs</div>
              <div>Returns</div>
              <div>Shipping</div>
              <div>Sizing</div>
              <div>Rewards</div>
              <div>Refer a friend</div>
              <div>Contact</div>
              <div>Careers</div>
              <div>Instagram</div>
              <div>Facebook</div>
              <div>Program</div>
              <div>Sustainability</div>
            </div>
          </Grid>
        </Grid>
      </Container>
    );
  }
}
export default withRouter(Footer);
