import {IWorkzonesAppSettings} from "mhc-server";

import {BrowserDbCollection} from "mhc-ui-components/dist/BrowserDb";

import {getBrowserDbCollection} from "../../db/db/getBrowserDbCollection";

export const getBrowserDbAppSettingsCollection = (companyId: string, userId: string): BrowserDbCollection<IWorkzonesAppSettings> => {
  return getBrowserDbCollection<IWorkzonesAppSettings>(
    companyId,
    userId,
    {
      collectionName: 'cimtAppSettings',
      keyFieldName: 'deviceId',
      version: 701,
    },
  );
};
