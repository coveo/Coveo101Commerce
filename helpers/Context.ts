import { buildContext, loadConfigurationActions, SearchEngine } from '@coveo/headless';
import { NextRouter, } from 'next/router';
import { UrlObject } from 'url';

export function setContext(
  engine: SearchEngine
) {
  buildContext(engine!).add("fromTester", "true");
}


export function setStoreContext(
  engine: SearchEngine,
  storeId: string
) {
  buildContext(engine!).add("dictionaryFieldContext", storeId);
}

export function setTabContext(
  engine: SearchEngine,
  tab: string
) {
  const configurationActions = loadConfigurationActions(engine);
  engine.dispatch(configurationActions.setOriginLevel2({ originLevel2: tab }));
}

export function routerOptions(router: NextRouter, options: UrlObject): UrlObject {
  const fromTest = router.query['fromTest'];
  if (fromTest) {
    if (!options?.query) {
      options.query = {};
    }
    options.query['fromTest'] = true;
  }
  return options;
}

export function routerPush(router: NextRouter, options: UrlObject) {
  return router.push(routerOptions(router, options));
}


const Context = {
  setContext,
  routerOptions,
  routerPush,
};

export default Context;
