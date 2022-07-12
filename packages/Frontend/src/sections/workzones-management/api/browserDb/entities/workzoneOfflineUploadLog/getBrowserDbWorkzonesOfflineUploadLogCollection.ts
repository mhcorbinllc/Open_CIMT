import {
  IWorkzone,
  IWorkzonesAppSettings,
} from "mhc-server";

import {
  BrowserDb,
  BrowserDbCollection,
  ICRUDDoc,
} from "mhc-ui-components/dist/BrowserDb";

export interface IWorkzoneOfflineUploadLog extends ICRUDDoc {
  logId: string;
  collectionName: 'cimtAppSettings' | 'cims';
  doc: any;
  success: boolean;
  applied: boolean;
  noAppliedReason?: string;
  error: null | {
    message: string;
    userMessage: string;
  };
}

export const getBrowserDbWorkzonesOfflineUploadLogCollection = (companyId: string, userId: string): BrowserDbCollection<IWorkzoneOfflineUploadLog> => {
  const browserDb = new BrowserDb({dbName: 'OfflineDB'});
  return browserDb.collection<IWorkzoneOfflineUploadLog>(
    {
      version: 701,
      collectionName: [
        companyId,
        userId,
        'workzonesOfflineUploadLog',
      ].join('--'),
      keyFieldName: 'logId',
      indexFieldNames: 'createdAt'.split(','),
      buildSearchContent: log => {
        const output: string[] = [];

        if (log.collectionName === 'cims') {
          const workzone: IWorkzone = log.doc;
          output.push(workzone.workzoneId);
          output.push(workzone.kapschId.toString());
          output.push(workzone.itisCodes.join(', '));
          output.push(workzone.name);
          output.push(workzone.notes);
        }

        if (log.collectionName === 'cimtAppSettings') {
          const workzone: IWorkzonesAppSettings = log.doc;
          output.push(workzone.deviceId);
        }

        return output;
      },
    },
  );
};
