# Coveo for Commerce - Developer Training

## Dependencies

- [Git](https://git-scm.com/download)
- [node.js](https://nodejs.org/en/)

> Instead of nodejs, you can use [nvm](https://github.com/nvm-sh/nvm) to better handle/manage multiple node versions on your computer.

### Requirements

This project relies on [Node.js](https://nodejs.org/) to build and run. It has been tested with version 16.

## Before starting the storefront UI (Initial configuration)

Under [\_Setup](_Setup/README.md), we are providing instructions to help set up a Coveo org to be used with this storefront UI.

## Start the storefront UI

To run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You will get empty results until you set up your config (see next section).

## Configuration changes

In order to 'configure' the store, you can configure the `next.config.js`.

Here you can specify the following:
| Key | Description |
| --- | ----------- |
| env > ORG_ID | The Organization Id |
| env > API_KEY | The Seach API Key (should also have write access to Analytics events, see below) |
| env > SEARCH_PIPELINE | Pipeline for search |
| publicRuntimeConfig > logo | Logo to display in the Header |
| publicRuntimeConfig > title | Title to display in the Header |
| publicRuntimeConfig > searchhubPDP | Search hub for the Product Detail Page |
| publicRuntimeConfig > fields | Extra fields to return with the search response |
| publicRuntimeConfig > facetFields | Additional facets to show for this store array of: `{ field: 'ec_processor_model_number', label: 'Processor Model' }` |

### Search API key

To perform Search against the Coveo index, you need an API key to authenticate the requests from the storefront.
In the Coveo Administration console, go in `Organization / API keys` and create a new API key for search, with these privileges:

- Under **Analytics**, set `Analytics Data` to _Push_
- Under **Analytics**, set `Impersonate` to _Allowed_
- Under **Search**, set `Execute Queries` to _Allowed_

## Learn More

### Coveo

To learn more about Coveo platform:

- [Coveo documentation](https://docs.coveo.com)
- [Coveo Headless documentation](https://docs.coveo.com/en/headless/latest/)
- [Coveo Headless on NPM](https://www.npmjs.com/package/@coveo/headless)

### Next.js

The storefront is implemented with Next.js. To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
