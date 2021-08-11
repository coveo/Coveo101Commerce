# Setting up a "Products" source

This folder contains the script to set up a source `Products` in your Commerce Training org. It will create the necessary fields and mappings on your Push source `Products`.

### Dependencies

Install dependencies. In a terminal, from the folder `_Setup`, run:

```bash
> npm install
```

## Creating "Products" source, fields & mappings

In a terminal, from the folder `_Setup`, run:

```bash
> node create_source_product.js <org_id> <token> <fields.json>
```

## Pushing data

There is sample data provided. You can send them to you index using the `pushapi` tool.

To install the tool

```bash
> npm install -g coveo-pushapi-cli
```

### Products

In a terminal, from the folder `_Setup/data`, run:

```bash
> pushapi catalog
```

### Stores

In a terminal, from the folder `_Setup/data/stores`, run:

```bash
> pushapi stores_with_variants.json
```

> !! Notice you should be running from within the `store` folder. The `pushapi` tool remembers the confiuration per folders.
