import {
  DynaMongoDB,
  findLikeSearchEngine,
} from "dyna-mongo-db";
import {
  IWorkzoneHistory,
  IDBWorkzoneHistory,
  convertIDBWorkzoneHistorytoIWorkzoneHistory,
} from "../interfaces/IWorkzoneHistory";
import {getWorkzonesItemsHistoryCollection} from "./getWorkzonesCollections";

export const dbWorkzoneItemHistorySearch = async (
  {
    dmdb,
    companyId,
    workzoneId,
    searchText,
    skip,
    limit,
  }: {
    dmdb: DynaMongoDB;
    companyId: string;
    workzoneId: string;
    searchText?: string;
    skip: number;
    limit: number;
  },
): Promise<IWorkzoneHistory[]> => {
  const collection = await getWorkzonesItemsHistoryCollection(dmdb, companyId);

  const workzoneHistory: IDBWorkzoneHistory[] = await collection
    .find(
      {
        "workzone.workzoneId": workzoneId,
        ...findLikeSearchEngine('dbSearchText', searchText),
      },
      {
        skip,
        limit,
      },
    )
    .toArray();

  return workzoneHistory.map(convertIDBWorkzoneHistorytoIWorkzoneHistory);
};
