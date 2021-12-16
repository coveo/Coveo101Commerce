# Commerce Setup - Creating resource

This folder contains the script to help set up and configure a new org for a Commerce scenario.

### Dependencies

From the `_setup_commerce_scenario` folder, run this:

```bash
> npm install
```

## How to run

In a terminal, go in the `_setup_commerce_scenario` folder

Then execute this script to set up your Coveo organization with the sample pipelines and catalog configuration:

```bash
node _create_resources_in_Coveo.js <myOrgName>
```

Replace `<myOrgName>` with the name of your organization.

When required, the script will open a browser window for you to authenticate in the Coveo platform.

After a successful run, you will have a few Pipelines and ML models created for you.

## Data

Then you can push your data in the Catalog source called `Products` using the stream API.

Your data should use the standard Coveo commerce fields.

There are tools to help pushing data, here's one of the them:

### PushApi cli

To install the [pushapi tool](https://www.npmjs.com/package/coveo-pushapi-cli) :

```bash
> npm install -g coveo-pushapi-cli
```

Then in a terminal, from the folder `_Setup/data`, run:

```bash
> pushapi catalog
```

The tool will ask for the proper ids (org, source, apikey) you need to do a successful Push.
If asked about the source being a Catalog source, say "yes".
