import {IWorkzone} from "mhc-server";

import {BrowserDbCollection} from "mhc-ui-components/dist/BrowserDb";

import {getBrowserDbCollection} from "../../db/db/getBrowserDbCollection";

export const getBrowserDbWorkzonesCollection = (companyId: string, userId: string): BrowserDbCollection<IWorkzone> => {
  return getBrowserDbCollection<IWorkzone>(
    companyId,
    userId,
    {
      collectionName: 'cims',
      keyFieldName: 'workzoneId',
      version: 701,
      indexFieldNames: [
        'active',
        'name',
        'updatedAt',
        'start',
        'end',
        'workersPresent',
      ],
      buildSearchContent: workzone => [
        workzone.workzoneId,
        workzone.kapschId.toString(),
        workzone.itisCodes.join(', '),
        workzone.name,
        workzone.notes,
      ],
    },
  );
};
