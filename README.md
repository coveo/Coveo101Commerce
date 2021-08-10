# Coveo for Commerce - Developer Training

## Dependencies

- [Git](https://git-scm.com/download)
- [node.js](https://nodejs.org/en/)
  !!! instead of nodejs, you can use [nvm](https://github.com/nvm-sh/nvm) to better handle/manage node versions you are using

### Requirements

This project relies on [Node.js](https://nodejs.org/) to build and run. It has been tested with version 16.

It also relies on [Yarn](https://yarnpkg.com/) to handle the dependencies.

With `Node.js` installed, make sure you also have `yarn`:

```bash
> npm install -g yarn
```

(or `sudo .... `)

### Start the storefront UI

Then, run the development server:

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You will get empty results until you set up your config (see next section)

## Configuration changes

In order to 'configure' the store, you can configure the `next.config.js`.

Here you can specify the following:
| Key | Description |
| --- | ----------- |
| env > ORG_ID | The Organization Id |
| env > API_KEY | The Seach API Key (should also have write access to Analytics events) |
| env > SEARCH_HUB | Hub |
| env > SEARCH_PIPELINE | Pipeline for search |
| publicRuntimeConfig > logo | Logo to display in the Header |
| publicRuntimeConfig > title | Title to display in the Header |
| publicRuntimeConfig > pipelinePDP | Pipeline for the Product Detail Page |
| publicRuntimeConfig > fields | Extra fields to return with search |
| publicRuntimeConfig > facetFields | Additional facets to show for this store array of: `{ field: 'ec_processor_model_number', label: 'Processor Model' }` |

## Learn More

To learn more about Coveo platform:

- [Headless documentation](https://docs.coveo.com/en/headless/latest/)
- [Headless on NPM](https://www.npmjs.com/package/@coveo/headless)
- [Coveo documentation](https://docs.coveo.com)

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
