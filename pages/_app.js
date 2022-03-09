import App from '../Components/Layout/App';
import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../helpers/theme';
import { Provider } from "react-redux";

import '../styles/Index.scss';
import cartStore from '../reducers/cartStore'; // used in <Provider>

import { Overlay as DebugOverlay } from '../Components/Debug/Overlay';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

export default function MyApp(props) {
  const { Component, pageProps } = props;

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>{publicRuntimeConfig.title}</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <meta property="og:site_name" content={publicRuntimeConfig.title} />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Provider store={cartStore}>
          <App>
            <Component {...pageProps} />
            {typeof window === 'object' && <DebugOverlay></DebugOverlay>}
          </App>
        </Provider>
      </ThemeProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
