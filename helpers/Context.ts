import { buildContext, loadConfigurationActions, SearchEngine } from '@coveo/headless';
import { NextRouter, } from 'next/router';
import { UrlObject } from 'url';

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

export function routerPush(router: NextRouter, options: UrlObject) {
  return router.push(options);
}

const Context = {
  routerPush,
};

export default Context;
