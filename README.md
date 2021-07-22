# Coveo for Commerce - Developer Training

## Dependencies

- [Git](https://git-scm.com/download)
- [npm](https://www.npmjs.com/)
- [node.js](https://nodejs.org/en/)
  !!! instead of nodejs, you can use [nvm](https://github.com/coreybutler/) to better handle/manage node versions you are using

## Getting Started

First, ask for the env variables, create a .env at the root of the project.

Then, install Node dependencies:

```bash
npm install
```

## Create source

Execute this script:

```bash
cd scripts
node createSource.js <org_id> <api_key>
```

## Push content

Install [pushapi](https://www.npmjs.com/package/coveo-pushapi-cli) tool.

```bash
npm install -g coveo-pushapi-cli
```

Push the Catalog. You will need the API key and the Source's ID.

```bash
pushapi catalog_data
```

and answer the questions.

## Learn More

TBD
