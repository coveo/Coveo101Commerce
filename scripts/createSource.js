require('isomorphic-fetch'); // polyfill (needed for fetch) for NodeJs
require('abortcontroller-polyfill'); // polyfill (needed for fetch) for NodeJs

const { PlatformClient, SourceVisibility, SourceType } = require('@coveord/platform-client');
const fs = require('fs');
const PLATFORM = 'production';


function validateEnv() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log(`\n\t⚠️  Missing arguments\n\n\tUsage: node createSource.js <org_id> <token>\n\n`);
    process.exit(1);
  }

  return {
    FIELDS_FILENAME: 'fields.json',
    ORG_ID: args[0],
    TOKEN: args[1],
  };
}

// get a source by Name.
async function getSource(client, name) {
  let resources = await client.source.list().catch((err) => { console.error(err); });
  resources = resources.sourceModels.filter(res => (res.id.trim() === name || res.name.trim() === name));
  return (resources.length && resources[0]) || null;
}

//
// Main script to create fields, a Catalog source, and its mappings.
//
async function main(ARGS) {
  const client = new PlatformClient({
    accessToken: ARGS.TOKEN,
    environment: PLATFORM,
    organizationId: ARGS.ORG_ID,
  });

  // Create fields
  const existingFields = await client.field.list({ perPage: 1000 });
  const existingFieldNames = existingFields.items.map(field => field.name);
  let fieldsToCreate = JSON.parse(fs.readFileSync(ARGS.FIELDS_FILENAME));

  fieldsToCreate = fieldsToCreate.filter(field => !existingFieldNames.includes(field.name));
  if (fieldsToCreate.length) {
    console.log('Creating fields: ', fieldsToCreate.map(field => field.name).join());
    await client.field.createFields(fieldsToCreate);
  }
  console.log('Fields created/validated.');

  // Create/validate Catalog source
  let source = await getSource(client, 'Products');
  if (!source) {
    const createSourceResponse = await client.source.create({
      name: 'Products',
      sourceType: SourceType.CATALOG,
      sourceVisibility: SourceVisibility.SHARED,
      pushEnabled: true,
      streamEnabled: true,
    }).catch((err) => { console.error(err); });

    source = await getSource(client, 'Products');
    console.log('Source created.');
  }
  else {
    console.log('Source already exists.');
  }

  // Create mappings
  const existingMappings = (await client.source.mappings.get(source.id));
  const existingMappingsNames = existingMappings.common.rules.map(item => item.field);

  fieldsToCreate = JSON.parse(fs.readFileSync(ARGS.FIELDS_FILENAME)); // reset, we want to validate mapping for all fields. 
  const nMappingsBefore = existingMappings.common.rules.length;
  existingMappings.common.rules.push(...fieldsToCreate.map(field => {
    if (existingMappingsNames.includes(field.name)) {
      return null;
    }
    return {
      field: field.name,
      content: [`%[${field.name}]`],
    };
  }).filter(f => f));

  if (existingMappings.common.rules.length > nMappingsBefore) {
    // create mappings
    await client.source.mappings.update(source.id, existingMappings);
  }
  console.log('Mappings updated.');
}

const ARGS = validateEnv();
main(ARGS);
