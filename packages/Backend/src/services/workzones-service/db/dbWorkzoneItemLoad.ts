import {IWorkzone} from "../interfaces/IWorkzone";
import {convertIDBWorkzoneToIWorkzone} from "../interfaces/IDBWorkzone";
import {DynaMongoDB} from "dyna-mongo-db";
import {getWorkzonesItemsCollection} from "./getWorkzonesCollections";
import {removeUnknownItisCodes} from "./utils/removeUnknownItisCodes";

export const dbWorkzoneItemLoad = async (
  {
    dmdb,
    companyId,
    workzoneId,
  }: {
    dmdb: DynaMongoDB;
    companyId: string;
    workzoneId: string;
  },
): Promise<IWorkzone | null> => {
  const collection = await getWorkzonesItemsCollection(dmdb, companyId);

  const dbWorkzone = await collection.findOne({workzoneId});
  if (!dbWorkzone) return null;

  await removeUnknownItisCodes({
    dmdb,
    companyId,
    dbWorkzones: [dbWorkzone],
  });

  return convertIDBWorkzoneToIWorkzone(dbWorkzone);
};
