import {IWorkzone} from "../interfaces/IWorkzone";
import {convertIWorkzoneToIDBWorkzone} from "../interfaces/IDBWorkzone";
import {DynaMongoDB} from "dyna-mongo-db";
import {getWorkzonesItemsCollection} from "./getWorkzonesCollections";
import {dbWorkzoneItemHistoryAdd} from "./dbWorkzoneItemHistoryAdd";
import {removeUnknownItisCodes} from "./utils/removeUnknownItisCodes";
import {dbWorkzoneItemLoad} from "./dbWorkzoneItemLoad";

export const dbWorkzoneItemUpdate = async (
  {
    dmdb,
    companyId,
    userId,
    workzone,
    externalImport = false,
    newerOnly = false,
    historyName = "CIM update",
  }: {
    dmdb: DynaMongoDB;
    companyId: string;
    userId: string;
    workzone: IWorkzone;
    externalImport?: boolean;
    newerOnly?: boolean;
    historyName?: string;
  },
): Promise<boolean> => {
  const collection = await getWorkzonesItemsCollection(dmdb, companyId);

  const dbWorkzone = convertIWorkzoneToIDBWorkzone(workzone);

  await removeUnknownItisCodes({
    dmdb,
    companyId,
    dbWorkzones: [dbWorkzone],
  });

  if (newerOnly) {
    const currentWorkzone = await dbWorkzoneItemLoad({
      dmdb,
      companyId,
      workzoneId: workzone.workzoneId,
    });
    if (currentWorkzone && currentWorkzone.updatedAt > workzone.updatedAt) {
      return false;
    }
  }

  if (!externalImport) {
    dbWorkzone.updatedAt = Date.now();
  }

  const updateResult = await collection
    .updateOne(
      {workzoneId: dbWorkzone.workzoneId},
      {$set: dbWorkzone},
    );

  await dbWorkzoneItemHistoryAdd({
    dmdb,
    companyId,
    userId,
    historyName,
    dbWorkzone,
  });

  return updateResult.matchedCount === 1;
};
