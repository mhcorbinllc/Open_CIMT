import {
  BrowserDbCollection,
  ICollectionConfig,
  ICRUDDoc,
} from "mhc-ui-components/dist/BrowserDb";

import {getBrowserDb} from "./getBrowserDb";

const collections: {[collectionId: string]: BrowserDbCollection<any>} = {};

export const getBrowserDbCollection = <TSchema extends ICRUDDoc>(
  companyId: string,
  userId: string,
  collectionConfig: ICollectionConfig<TSchema>,
): BrowserDbCollection<TSchema> => {
  const key = [companyId, userId, collectionConfig.collectionName].join('--');
  if (collections[key]) return collections[key];

  return collections[key] = getBrowserDb(companyId, userId).collection<TSchema>(collectionConfig);
};
