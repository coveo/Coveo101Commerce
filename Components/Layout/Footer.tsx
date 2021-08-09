import React from "react";
import Image from 'next/image';
import { Container, Grid, Typography, Box } from "@material-ui/core";
import { withRouter, NextRouter } from 'next/router';
import { routerPush } from '../../helpers/Context';

import logo from '../../public/logos/coveo_logo_footer.png';

interface IFooterProps {
  router?: NextRouter;
}

class Footer extends React.Component<IFooterProps> {

  constructor(props) {
    super(props);
  }

  render() {



    return (
      <Container maxWidth="xl" className="footer__container">
        <Grid container alignItems={"center"}>
          <Grid item sm={6} className="logo-container">
            <Box onClick={() => routerPush(this.props.router, { pathname: '/' })}>
              <Image
                alt=""
                className="footer-logo"
                src={logo}
                width={200}
                height={108}
              />
            </Box>
          </Grid>
          <Grid item sm={6}>
            <Grid className="footer-content">
              <Typography variant="h5">
                Built with
              </Typography>
              <Typography>
                <a className="footer-link" href="https://docs.coveo.com/en/headless/latest/">Coveo Headless API, </a>
                <a className="footer-link" href="https://material-ui.com/">React + Material UI</a>,
                and of course,
                <a className="footer-link" href="https://www.coveo.com/en"> Coveo Cloud V2.</a>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Container >
    );
  }
}
export default withRouter(Footer);
