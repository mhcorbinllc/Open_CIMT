import {IWorkzone} from "../interfaces/IWorkzone";
import {DynaMongoDB} from "dyna-mongo-db";
import {getWorkzonesItemsCollection} from "./getWorkzonesCollections";
import {dbSearchCollection} from "../../../db/DBEntity/utils/dbSearchCollection";
import {
  convertIDBWorkzoneToIWorkzone,
  IDBWorkzone,
} from "../interfaces/IDBWorkzone";

export const dbWorkzoneItemsWithItisCodes = async (
  {
    dmdb,
    companyId,
    itisCodes,
    maxWorkzonesCount = 10,
  }: {
    dmdb: DynaMongoDB;
    companyId: string;
    itisCodes: number[];
    maxWorkzonesCount?: number;
  },
): Promise<IWorkzone[]> => {
  const collection = await getWorkzonesItemsCollection(dmdb, companyId);

  const dbWorkzones = await dbSearchCollection<IDBWorkzone>({
    collection,

    find: {
      "itisCodes": {
        $exists: true,
        $in: itisCodes,
      },
    },

    deleted: 'both',

    skip: 0,
    limit: maxWorkzonesCount,
  });

  return dbWorkzones.map(convertIDBWorkzoneToIWorkzone);
};
