import {DynaMongoDB} from "dyna-mongo-db";
import {dynaError} from "dyna-error";
import {guid} from "dyna-guid";

import {IWorkzone} from "../interfaces/IWorkzone";
import {
  IDBWorkzone,
  convertIWorkzoneToIDBWorkzone,
  convertIDBWorkzoneToIWorkzone,
} from "../interfaces/IDBWorkzone";

import {getWorkzonesItemsCollection} from "./getWorkzonesCollections";
import {dbWorkzoneItemHistoryAdd} from "./dbWorkzoneItemHistoryAdd";
import {removeUnknownItisCodes} from "./utils/removeUnknownItisCodes";

export const dbWorkzoneItemCreate = async (
  {
    dmdb,
    companyId,
    userId,
    workzone,
    externalImport = false,
  }: {
    dmdb: DynaMongoDB;
    companyId: string;
    userId: string;
    workzone: IWorkzone;
    externalImport?: boolean;
  },
): Promise<IWorkzone> => {
  const collection = await getWorkzonesItemsCollection(dmdb, companyId);
  const dbWorkzone: IDBWorkzone = convertIWorkzoneToIDBWorkzone(workzone);

  if (externalImport) {
    [
      'workzoneId',
      'createdAt',
      'updatedAt',
      'deletedAt',
    ].forEach(fieldName => {
      if (workzone[fieldName] === undefined) {
        throw dynaError({
          message: `dbWorkzoneItemCreate: [${fieldName}] is not defined`,
          status: 400,
          validationErrors: {[fieldName]: 'Not defined'},
        });
      }
    });
  }
  else {
    dbWorkzone.workzoneId = guid();
    const now = Date.now();
    dbWorkzone.createdAt = now;
    dbWorkzone.updatedAt = now;
    dbWorkzone.deletedAt = 0;
  }

  await collection.insertOne(dbWorkzone);
  await dbWorkzoneItemHistoryAdd({
    dmdb,
    companyId,
    userId,
    historyName: 'CIM creation',
    dbWorkzone: dbWorkzone,
  });

  await removeUnknownItisCodes({
    dmdb,
    companyId,
    dbWorkzones: [dbWorkzone],
  });

  return convertIDBWorkzoneToIWorkzone(dbWorkzone);
};
