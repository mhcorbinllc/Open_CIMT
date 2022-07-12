import {DynaMongoDB} from "dyna-mongo-db";
import {
  IDBWorkzone,
  convertIDBWorkzoneToIWorkzone,
} from "../interfaces/IDBWorkzone";
import {getWorkzonesItemsHistoryCollection} from "./getWorkzonesCollections";
import {
  IWorkzoneHistory,
  convertIWorkzoneHistoryToIDBWorkzoneHistory,
} from "../interfaces/IWorkzoneHistory";

export const dbWorkzoneItemHistoryAdd = async (
  {
    dmdb,
    companyId,
    userId,
    historyName,
    dbWorkzone,
  }: {
    dmdb: DynaMongoDB;
    companyId: string;
    userId: string;
    historyName: string;
    dbWorkzone: IDBWorkzone;
  },
): Promise<void> => {
  const collection = await getWorkzonesItemsHistoryCollection(dmdb, companyId);

  const workzoneHistory: IWorkzoneHistory = {
    date: Date.now(),
    name: historyName,
    userId,
    workzone: convertIDBWorkzoneToIWorkzone(dbWorkzone),
  };

  const dbWorkzoneHistory = convertIWorkzoneHistoryToIDBWorkzoneHistory(workzoneHistory);

  await collection.insertOne(dbWorkzoneHistory);
};
