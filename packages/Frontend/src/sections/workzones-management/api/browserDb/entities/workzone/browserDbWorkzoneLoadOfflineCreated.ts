import {IWorkzone} from "mhc-server";

import {EOfflineAction} from "mhc-ui-components/dist/BrowserDb";
import {searchTextEngine} from "mhc-ui-components/dist/utils";

import {getBrowserDbWorkzonesCollection} from "./getBrowserDbWorkzonesCollection";
import {getBrowserDb} from "../../db/db/getBrowserDb";

export const browserDbWorkzoneLoadOfflineCreated = async (
  {
    companyId,
    userId,
    search,
    forEver: filterForEver = 'both',
  }: {
    companyId: string;
    userId: string;
    search: string;
    forEver?: boolean | 'both';
  },
): Promise<Array<IWorkzone>> => {
  const browserDb = getBrowserDb(companyId, userId);
  const collection = getBrowserDbWorkzonesCollection(companyId, userId);
  const collectionName = collection.collectionName;
  const userSearchText = search.toLocaleLowerCase();

  const allChanges = await browserDb.getDbChangesAll();
  return allChanges
    .filter(dbChange => {
      const isCreatedOffline = dbChange.collectionName === collectionName && dbChange.offlineAction === EOfflineAction.CREATE;

      if (!isCreatedOffline) return false;

      const workzone: IWorkzone = dbChange.doc;

      const {forEver: workzoneWorkForEver = false} = workzone; // Fallback in case of old CIM and the forEver is undefined

      if (filterForEver !== 'both' && filterForEver !== workzoneWorkForEver) return false;

      const dbSearchText = [
        workzone.workzoneId,
        workzone.kapschId,
        workzone.itisCodes.join(', '),
        workzone.name,
        workzone.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase();

      return searchTextEngine({
        source: dbSearchText,
        search: userSearchText,
      });
    })
    .map(dbChange => dbChange.doc);
};
