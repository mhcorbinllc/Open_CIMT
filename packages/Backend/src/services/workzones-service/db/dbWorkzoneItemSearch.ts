import {DynaMongoDB} from "dyna-mongo-db";

import {IWorkzone} from "../interfaces/IWorkzone";
import {
  IDBWorkzone,
  convertIDBWorkzoneToIWorkzone,
} from "../interfaces/IDBWorkzone";

import {getWorkzonesItemsCollection} from "./getWorkzonesCollections";
import {dbSearchCollection} from "../../../db/DBEntity/utils/dbSearchCollection";
import {removeUnknownItisCodes} from "./utils/removeUnknownItisCodes";

export const dbWorkzoneItemSearch = async (
  {
    dmdb,
    companyId,
    searchText,
    forEver = 'both',
    deleted,
    skip,
    limit,
    sortByFieldName,
    sortDirection,
  }: {
    dmdb: DynaMongoDB;
    companyId: string;
    searchText?: string;
    forEver?: boolean | 'both';
    deleted?: boolean | 'both';
    skip: number;
    limit: number;
    sortByFieldName?: string;
    sortDirection?: 0 | 1 | -1;
  },
): Promise<IWorkzone[]> => {
  const collection = await getWorkzonesItemsCollection(dmdb, companyId);

  const dbWorkzones = await dbSearchCollection<IDBWorkzone>({
    collection,

    searchText,
    deleted,

    find: forEver === 'both'
      ? undefined
      : {forEver},

    skip,
    limit,

    sortByFieldName,
    sortDirection,
  });

  await removeUnknownItisCodes({
    dmdb,
    companyId,
    dbWorkzones,
  });

  return dbWorkzones.map(convertIDBWorkzoneToIWorkzone);
};
