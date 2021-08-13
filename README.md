# Coveo for Commerce - Developer Training

## Dependencies

- [Git](https://git-scm.com/download)
- [node.js](https://nodejs.org/en/)

> Instead of nodejs, you can use [nvm](https://github.com/nvm-sh/nvm) to better handle/manage multiple node versions on your computer.

### Requirements

This project relies on [Node.js](https://nodejs.org/) to build and run. It has been tested with version 16.

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
| env > API_KEY | The Seach API Key (should also have write access to Analytics events) |
| env > SEARCH_HUB | Hub for Search |
| env > SEARCH_PIPELINE | Pipeline for search |
| publicRuntimeConfig > logo | Logo to display in the Header |
| publicRuntimeConfig > title | Title to display in the Header |
| publicRuntimeConfig > searchhubPDP | Search hub for the Product Detail Page |
| publicRuntimeConfig > fields | Extra fields to return with the search response |
| publicRuntimeConfig > facetFields | Additional facets to show for this store array of: `{ field: 'ec_processor_model_number', label: 'Processor Model' }` |

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
