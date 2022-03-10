/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import Document, {
  Html, Head, Main, NextScript,
} from 'next/document';
import { ServerStyleSheets } from '@mui/styles';
import { getEndpoint } from '../helpers/Endpoints';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

const COVEOUA_script = () => {
  return (
    <script dangerouslySetInnerHTML={{
      __html: `(function(c,o,v,e,O,u,a){
        a='coveoua';c[a]=c[a]||function(){(c[a].q=c[a].q|| []).push(arguments)};
        c[a].t=Date.now();u=o.createElement(v);u.async=1;u.src=e;
        O=o.getElementsByTagName(v)[0];O.parentNode.insertBefore(u,O)
        })(window,document,'script','https://static.cloud.coveo.com/coveo.analytics.js/2/coveoua.js')
        coveoua('init', '${process.env.API_KEY}','${getEndpoint('analytics')}');`,
    }}>
    </script>
  );
};

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Roboto:400,700,300&display=swap" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;800&display=swap"></link>
          {publicRuntimeConfig.extraCSS && <link rel="stylesheet" type="text/css" href={publicRuntimeConfig.extraCSS} />}
          <COVEOUA_script />
        </Head>
        <body className={publicRuntimeConfig.scenario || ''}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}


// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with server-side generation (SSG).
MyDocument.getInitialProps = async (ctx) => {

  // Render app and page and get the context of the page with collected side effects.
  const sheets = new ServerStyleSheets();
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () => originalRenderPage({
    // eslint-disable-next-line react/display-name
    enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
  });

  const initialProps = await Document.getInitialProps(ctx);

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
  };
};
