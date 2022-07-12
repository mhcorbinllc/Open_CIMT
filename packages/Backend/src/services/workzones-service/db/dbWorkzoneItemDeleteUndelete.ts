import {DynaMongoDB} from "dyna-mongo-db";

import {IWorkzone} from "../interfaces/IWorkzone";
import {getWorkzonesItemsCollection} from "./getWorkzonesCollections";
import {dbWorkzoneItemHistoryAdd} from "./dbWorkzoneItemHistoryAdd";
import {dbWorkzoneItemLoad} from "./dbWorkzoneItemLoad";
import {convertIWorkzoneToIDBWorkzone} from "../interfaces/IDBWorkzone";

export const dbWorkzoneItemDeleteUndelete = async (
  {
    dmdb,
    companyId,
    userId,
    operation,
    workzoneId,
    externalImport,
  }: {
    dmdb: DynaMongoDB;
    companyId: string;
    userId: string;
    operation: 'delete' | 'undelete';
    workzoneId: string;
    externalImport?: {
      workzone: IWorkzone;
      newerOnly: boolean;
    };
  },
): Promise<{
  workzone: IWorkzone | null; // Null if not found
  applied: boolean;           // If the externalImportWorkzone is newer than server's version
}> => {
  const collection = await getWorkzonesItemsCollection(dmdb, companyId);
  const actionDate: number =
    externalImport
      ? externalImport.workzone.updatedAt
      : Date.now();

  const currentWorkzone = await dbWorkzoneItemLoad({
    dmdb,
    companyId,
    workzoneId,
  });

  if (!currentWorkzone) {
    return {
      workzone: null,
      applied: false,
    };
  }

  if (
    externalImport
    && externalImport.newerOnly
    && currentWorkzone.updatedAt > externalImport.workzone.updatedAt
  ) {
    return {
      workzone: currentWorkzone,
      applied: false,
    };
  }

  const updatedWorkzone: IWorkzone = {
    ...currentWorkzone,
    kapschId: operation === 'undelete' ? -1 : currentWorkzone.kapschId,
    updatedAt: actionDate,
    deletedAt: operation === 'delete' ? actionDate : 0,
  };

  await collection
    .updateOne(
      {workzoneId},
      {$set: updatedWorkzone},
    );

  const historyName =
      operation === 'delete'
        ? updatedWorkzone.kapschId > -1
          ? `CIM and broadcasted CIM kapschId ${updatedWorkzone.kapschId} deleted`
          : `CIM deleted`
        : 'CIM undeleted';

  await dbWorkzoneItemHistoryAdd({
    dmdb,
    companyId,
    userId,
    historyName,
    dbWorkzone: convertIWorkzoneToIDBWorkzone(updatedWorkzone),
  });

  return {
    workzone: updatedWorkzone,
    applied: true,
  };
};
