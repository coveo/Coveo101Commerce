require('isomorphic-fetch'); // polyfill (needed for fetch) for NodeJs
require('abortcontroller-polyfill'); // polyfill (needed for fetch) for NodeJs

const { PlatformClient, SourceVisibility, SourceType, } = require('@coveord/platform-client');
const fs = require('fs');

const { OAuth } = require('@coveo/cli/lib/lib/oauth/oauth');

let CONFIG = null;

class Config {
  constructor(orgName) {
    this.config = {};
    try {
      this.config = JSON.parse(fs.readFileSync('.config.json').toString());
    }
    catch (e) {
      console.error('Reading .config.json', e);
    }
    try {
      this.snapshot = JSON.parse(fs.readFileSync('./snapshot.json').toString());
    }
    catch (e) {
      console.error('Reading snapshot', e);
    }
    this.orgName = orgName;
  }

  async login() {
    let response = null;
    if (this.config?.accessToken) {
      // validate accessToken
      try {
        response = await this.validateAccessTokenAndOrg();
      }
      catch (err) {
        console.log('[ERR-001] Login failed.', err);
        response = err;
      }
    }

    if (!this.config?.accessToken || response?.errorCode === 'INVALID_TOKEN') {
      await this.loginGetAccessToken();
      this.writeConfig();
      await this.validateAccessTokenAndOrg();
    }
  }

  async validateAccessTokenAndOrg() {
    this.client = new PlatformClient({ accessToken: this.config.accessToken, environment: PLATFORM });
    let res = null;
    try {
      res = await getOrganization(this.client, this.config.orgName);
    }
    catch (err) {
      console.log('[ERR-002] Token validation failed.', err);
    }
    return res;
  }


  async loginGetAccessToken() {
    const envMap = {
      'staging': 'qa',
    };

    const { accessToken } = await new OAuth({
      environment: envMap[process.env.PLATFORM] || 'prod', //Environment.prod, // flags.environment as PlatformEnvironment,
      region: process.env.REGION || 'us', // flags.region as Region,
    }).getToken();

    this.config.accessToken = accessToken;
  }

  get accessToken() { return this.config.accessToken; }
  set accessToken(s) { this.config.accessToken = s; }

  get client() { return this.config.client; }
  set client(s) { this.config.client = s; }

  get organizationId() { return this.config.orgId; }
  set organizationId(s) { this.config.orgId = s; }

  get organizationName() { return this.config.orgName; }
  set organizationName(s) { this.config.orgName = s; }

  writeConfig() {
    fs.writeFileSync('.config.json', JSON.stringify(this.config));
  }
}


class SnapshotHelper {
  static findPipelineName(queryPipelineId) {
    let resourceName = queryPipelineId.split('QUERY_PIPELINE.')[1].replace(/\s+\}\}\s*$/g, '');
    let name = CONFIG.snapshot?.resources?.QUERY_PIPELINE.filter(p => p.resourceName === resourceName)[0].model.name;
    return name;
  }

  static findModelName(ref) {
    let resourceName = ref.split('ML_MODEL.')[1].replace(/\s+\}\}\s*$/g, '');
    let name = CONFIG.snapshot?.resources?.ML_MODEL.filter(p => p.resourceName === resourceName)[0].model.modelDisplayName;
    return name;
  }

  static findConditionDefinition(ref) {
    let resourceName = ref.split('QUERY_PIPELINE_CONDITION.')[1].replace(/\s+\}\}\s*$/g, '');
    let name = CONFIG.snapshot?.resources?.QUERY_PIPELINE_CONDITION.filter(p => p.resourceName === resourceName)[0].model.definition;
    return name;
  }
}


const PLATFORM = process.env.PLATFORM || 'production';

// Extracts the arguments from the command line
function readArguments() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log(`\n\t⚠️  Missing arguments\n\n\tUsage: node setup_generic_store_demo.js <orgName>\n\n`);
    process.exit(1);
  }

  return {
    ORG_NAME: args[0].trim()
  };
}

// Outputs the error and quits
function handleError(callerName, err) {
  console.warn('\n⚠️  Error from:', callerName);
  console.error(err, '\n');
  process.exit(1);
}

async function getOrganization(client, name) {
  let resources = await client.organization.list(); // no catch, we want to throw here
  resources = resources.filter(res => (res.id.trim() === name || res.displayName.trim() === name));
  return resources;
}

async function getSource(client, name) {
  let resources = await client.source.list().catch(handleError.bind(null, 'getSource'));
  resources = resources.sourceModels.filter(res => (res.id.trim() === name || res.name.trim() === name));

  return resources;
}

async function createOrganization(orgName) {
  const accessToken = CONFIG.accessToken;
  const environment = PLATFORM;
  CONFIG.client = new PlatformClient({ accessToken, environment, });

  let orgs = await getOrganization(CONFIG.client, orgName);
  if (orgs.length >= 1) {
    console.log(`\n ⚠️  Org "${orgName}" already exists.\n`);
  }
  else {
    console.log('Creating org: ', orgName);
    const createOrgResponse = await CONFIG.client.organization.create({
      name: orgName,
      // owner,
      organizationTemplate: 'Developer'
    }).catch(handleError.bind(null, `organization.create(${orgName})`));
    orgs = await getOrganization(CONFIG.client, createOrgResponse.id);
  }

  // should have only one org that matches here.
  const targetOrg = orgs[0];

  console.log('Using org: ', targetOrg.displayName, ` [${targetOrg.id}]`);
  CONFIG.organizationId = targetOrg.id;
  CONFIG.client = new PlatformClient({ accessToken, environment, organizationId: CONFIG.organizationId });
}

async function createCatalogSource(sourceName) {
  // Create a Catalog source
  let sources = await getSource(CONFIG.client, sourceName);
  if (sources.length < 1) {
    const sourceCreationResponse = await CONFIG.client.source.create({
      name: sourceName,
      sourceType: SourceType.CATALOG,
      sourceVisibility: SourceVisibility.SHARED,
      pushEnabled: true,
      streamEnabled: true,
    }).catch(handleError.bind(null, 'createCatalogSource()'));

    console.log(JSON.stringify(sourceCreationResponse, null, 2));
  }

  // get sources again, to get the ID of the newly created source.
  sources = await getSource(CONFIG.client, sourceName);

  const catalogSource = sources[0];
  CONFIG.catalogSourceId = catalogSource.id;

  console.log('Using source: ', catalogSource.name, ` [${catalogSource.id}]`);
}


// Validate (and create missing) fields
async function createFields() {
  const client = CONFIG.client;

  let fieldsToCreate = CONFIG.snapshot?.resources?.FIELD || [];
  fieldsToCreate = fieldsToCreate.map(i => i.model);

  const existingFields = await client.field.list({ perPage: 1000 }).catch(handleError.bind(null, 'field.list()'));
  const existingFieldNames = existingFields.items.map(field => field.name);

  fieldsToCreate = fieldsToCreate.filter(field => !existingFieldNames.includes(field.name));
  if (fieldsToCreate.length) {
    console.log('Creating fields: ', fieldsToCreate.map(field => field.name).join());
    await client.field.createFields(fieldsToCreate).catch(handleError.bind(null, 'field.create()'));
  }
  else {
    console.log('All fields exists already.');
  }
}


// Validate (and create missing) mappings
async function createMappings() {
  const client = CONFIG.client;
  const sourceId = CONFIG.catalogSourceId;
  let fieldsToCreate = CONFIG.snapshot?.resources?.FIELD || [];
  fieldsToCreate = fieldsToCreate.map(i => i.model);

  const existingMappings = (await client.source.mappings.get(sourceId));
  const existingMappingsNames = existingMappings.common.rules.map(item => item.field);

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
    await client.source.mappings.update(sourceId, existingMappings);
    console.log('Mappings updated.');
  }
}

// Validate (and create missing) mappings
async function createModels() {
  const client = CONFIG.client;

  let modelsToCreate = CONFIG.snapshot?.resources?.ML_MODEL || [];
  modelsToCreate = modelsToCreate.map(i => i.model);

  const existingModels = await client.ml.models.list({ perPage: 1000 }).catch(handleError.bind(null, 'model.list()'));
  const existingModelsNames = existingModels.map(item => item.modelDisplayName);

  modelsToCreate = modelsToCreate.filter(model => !existingModelsNames.includes(model.modelDisplayName));

  for (let i = 0; i < modelsToCreate.length; i++) {
    await client.ml.register(modelsToCreate[i]).catch(handleError.bind(null, 'ml.register()'));
  }

  console.log(`${modelsToCreate.length} models created.`);
}


async function createConditions() {
  const client = CONFIG.client;

  let conditionsToCreate = CONFIG.snapshot?.resources?.QUERY_PIPELINE_CONDITION || [];
  conditionsToCreate = conditionsToCreate.map(i => i.model);

  let existingConditions = await client.pipeline.conditions.list({ perPage: 1000 }).catch(handleError.bind(null, 'conditions.list()'));
  const existingConditionsExpressions = existingConditions.statements.map(item => item.definition);

  conditionsToCreate = conditionsToCreate.filter(c => !existingConditionsExpressions.includes(c.definition));

  if (conditionsToCreate.length) {
    for (let i = 0; i < conditionsToCreate.length; i++) {
      await client.pipeline.conditions.create(conditionsToCreate[i]).catch(handleError.bind(null, 'condition.create()'));
    }

    console.log(`${conditionsToCreate.length} conditions created.`);
    existingConditions = await client.pipeline.conditions.list({ perPage: 1000 }).catch(handleError.bind(null, 'conditions.list()'));
  }
  else {
    console.log('No Condition created (none configured or all already exists).');
  }

  // return the list of conditions as a map of [definition, condition]
  const conditions = {};
  existingConditions.statements.forEach(c => {
    conditions[c.definition] = c;
  });
  return conditions;
}

// Validate (and create missing) mappings
async function createPipelines() {
  const client = CONFIG.client;
  const conditions = await createConditions();

  let existingPipelines = await client.pipeline.list({ perPage: 1000 }).catch(handleError.bind(null, 'pipelines.list()'));
  const existingPipelinesNames = existingPipelines.map(item => item.name);

  let pipelinesToCreate = CONFIG.snapshot?.resources?.QUERY_PIPELINE || [];
  pipelinesToCreate = pipelinesToCreate.map(i => i.model);
  pipelinesToCreate = pipelinesToCreate.filter(p => !existingPipelinesNames.includes(p.name));
  if (pipelinesToCreate.length) {
    for (let i = 0; i < pipelinesToCreate.length; i++) {
      let pipelineDefinition = pipelinesToCreate[i];
      if (pipelineDefinition.condition) {
        // replace the condition with the proper ids from before, using the definition.
        pipelineDefinition.condition = conditions[pipelineDefinition.condition.definition];
      }
      await client.pipeline.create(pipelinesToCreate[i]).catch(handleError.bind(null, 'pipeline.create()'));
    }

    console.log(`${pipelinesToCreate.length} pipelines created.`);
    existingPipelines = await client.pipeline.list({ perPage: 1000 }).catch(handleError.bind(null, 'pipelines.list()'));
  }
  else {
    console.log('No Pipeline created (none configured or all already exists).');
  }

  for (let i = 0; i < existingPipelines.length; i++) {
    console.log('Validating pipeline ', existingPipelines[i].name, '...');
    await createQueryParameters(existingPipelines[i], conditions);
    await createRankingExpressions(existingPipelines[i], conditions);
    await createModelAssociations(existingPipelines[i], conditions);
  }
}

// Validate (and create missing) statements
async function createQueryParameters(pipeline, conditions) {
  const client = CONFIG.client;

  let existing = await client.pipeline.statements.list(pipeline.id, { perPage: 1000 }).catch(handleError.bind(null, 'statements.list()'));
  existing = existing.statements;
  const existingDefinition = existing.map(item => item.definition);

  let resourcesToCreate = (CONFIG.snapshot?.resources?.QUERY_PARAMETER || []).concat(CONFIG.snapshot?.resources?.FILTER || []);
  resourcesToCreate = resourcesToCreate.filter(p => SnapshotHelper.findPipelineName(p.parents.queryPipelineId) === pipeline.name);// keep only the ones for this pipeline
  resourcesToCreate = resourcesToCreate.filter(p => !existingDefinition.includes(p.model.definition));// filter out existing

  if (resourcesToCreate.length) {
    for (let i = 0; i < resourcesToCreate.length; i++) {
      let statementDefinition = resourcesToCreate[i];
      const model = statementDefinition.model;
      if (model.condition) {
        // replace the condition with the proper ids from before, using the definition.
        model.condition = conditions[model.condition.definition];
      }

      await client.pipeline.statements.create(pipeline.id, model).catch(handleError.bind(null, 'statement.create()'));
    }

    console.log(`${resourcesToCreate.length} statements created for pipeline "${pipeline.name}" (${pipeline.id}).`);
  }
  // else {
  //   console.log('No Statements in Pipeline created (none configured or all already exists).');
  // }
}

// Validate (and create missing) statements
async function createRankingExpressions(pipeline, conditions) {
  const client = CONFIG.client;

  let existing = await client.pipeline.resultRanking.list(pipeline.id, { perPage: 1000 }).catch(handleError.bind(null, 'resultRanking.list()'));
  existing = existing.resultRankings;
  const existingNames = existing.map(item => item.resultRanking.name);

  let resourcesToCreate = (CONFIG.snapshot?.resources?.RANKING_EXPRESSION || []);
  resourcesToCreate = resourcesToCreate.filter(p => SnapshotHelper.findPipelineName(p.parents.queryPipelineId) === pipeline.name); // keep only the ones for this pipeline
  resourcesToCreate = resourcesToCreate.filter(p => !existingNames.includes(p.model.name)); // filter out existing

  if (resourcesToCreate.length) {
    for (let i = 0; i < resourcesToCreate.length; i++) {
      const model = resourcesToCreate[i].model;
      if (model.condition) {
        // replace the condition with the proper ids from before, using the definition.
        model.condition = conditions[model.condition.definition];
      }
      await client.pipeline.resultRanking.create(pipeline.id, model).catch(handleError.bind(null, 'resultRanking.create()'));
    }

    console.log(`${resourcesToCreate.length} resultRanking created for pipeline "${pipeline.name}" (${pipeline.id}).`);
  }
  // else {
  //   console.log('No Ranking Expression created (none configured or all already exists).');
  // }
}


// Validate (and create missing) statements
async function createModelAssociations(pipeline, conditions) {
  const client = CONFIG.client;

  let existing = await client.pipeline.associations.list(pipeline.id, { perPage: 1000 }).catch(handleError.bind(null, 'associations.list()'));
  existing = existing.rules;
  const existingNames = existing.map(item => item.modelDisplayName + '-' + (item.customQueryParameters?.submodel || ''));

  let resourcesToCreate = CONFIG.snapshot?.resources?.ML_MODEL_ASSOCIATION || [];
  resourcesToCreate = resourcesToCreate.filter(p => SnapshotHelper.findPipelineName(p.parents.queryPipelineId) === pipeline.name); // keep only the ones for this pipeline

  if (resourcesToCreate.length) {
    const existingModels = await client.ml.models.list({ perPage: 1000 }).catch(handleError.bind(null, 'model.list()'));

    for (let i = 0; i < resourcesToCreate.length; i++) {
      const model = resourcesToCreate[i].model;
      if (model.condition) {
        // in Snapshot, this is a reference, as opposed to any other resource.
        let snapshotConditionDefinition = SnapshotHelper.findConditionDefinition(model.condition);
        // replace the condition with the proper ids from before, using the definition.
        const c = conditions[snapshotConditionDefinition];
        model.condition = c.id;
        model.conditionDefinition = c.definition;
      }
      let modelInSnapshot = SnapshotHelper.findModelName(model.modelId);
      modelInSnapshot = existingModels.find(m => m.modelDisplayName === modelInSnapshot);
      model.modelId = modelInSnapshot.id;

      if (!existingNames.includes(modelInSnapshot.modelDisplayName + '-' + (model.customQueryParameters?.submodel || ''))) {
        // need to replace the model id
        await client.pipeline.associations.associate(pipeline.id, model).catch(handleError.bind(null, 'associations.create()'));
        console.log(`1 association created for pipeline "${pipeline.name}" (${pipeline.id}).`);
      }
    }
  }
  // else {
  //   console.log('No Model Association created (none configured or all already exists).');
  // }
}

async function createCatalogConfiguration() {
  const client = CONFIG.client;

  let existingConfigurations = await client.catalogConfiguration.list({ perPage: 1000 }).catch(handleError.bind(null, 'catalogConfiguration.list()'));
  let existingCatalog = await client.catalog.list({ perPage: 1000 }).catch(handleError.bind(null, 'catalog.list()'));

  let configurationInSnapshot = (CONFIG.snapshot?.resources?.CATALOG_CONFIGURATION || [])[0];
  let catalogInSnapshot = (CONFIG.snapshot?.resources?.CATALOG || [])[0];

  if (configurationInSnapshot && catalogInSnapshot) {
    if (!existingConfigurations.items.map(i => i.name).includes(configurationInSnapshot.name)) {
      // create configuration
      await client.catalogConfiguration.create(configurationInSnapshot).catch(handleError.bind(null, 'catalogConfiguration.create()'));
      existingConfigurations = await client.catalogConfiguration.list({ perPage: 1000 }).catch(handleError.bind(null, 'catalogConfiguration.list()'));
      console.log('Created Catalog Configuration.');
    }
    else {
      console.log('No Catalog Configuration created (none configured or all already exists).');
    }
    if (!existingCatalog.items.map(i => i.name).includes(catalogInSnapshot.name)) {
      const currentConfiguration = existingConfigurations.items.filter(i => i.name === configurationInSnapshot.name)[0];
      // update catalog configuration references
      catalogInSnapshot.catalogConfigurationId = currentConfiguration.id;
      catalogInSnapshot.configuration = currentConfiguration;
      catalogInSnapshot.sourceId = CONFIG.catalogSourceId;
      catalogInSnapshot.scope.sourceIds = [CONFIG.catalogSourceId];
      // create catalog
      await client.catalog.create(catalogInSnapshot).catch(handleError.bind(null, 'catalog.create()'));
      console.log('Created Catalog.');
    }
    else {
      console.log('No Catalog created (none configured or all already exists).');
    }
  }

}


async function main(ARGS) {

  CONFIG = new Config(ARGS.ORG_NAME);
  await CONFIG.login();

  const divider = '\n------------------------------------------------\n';

  await createOrganization(ARGS.ORG_NAME);
  await createCatalogSource('Products');
  await createFields();
  await createMappings();
  await createModels();
  await createPipelines();

  await createCatalogConfiguration();

  console.log(divider, 'Done.\n');
}

main(readArguments());
