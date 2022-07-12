import {IDBWorkzone} from "../../interfaces/IDBWorkzone";
import {DynaMongoDB} from "dyna-mongo-db";
import {dbWorkzonesAppSettingsLoad} from "../dbWorkzonesAppSettingsLoad";

export const removeUnknownItisCodes = async (
  {
    dmdb,
    companyId,
    dbWorkzones,
  }: {
    dmdb: DynaMongoDB;
    companyId: string;
    dbWorkzones: IDBWorkzone[];
  },
): Promise<void> => {
  const settings = await dbWorkzonesAppSettingsLoad(dmdb, companyId);
  dbWorkzones
    .forEach(dbWorkzone => {
      dbWorkzone.itisCodes =
        dbWorkzone.itisCodes
          .filter(itisCode => settings.itisCodes.find(ic => itisCode === ic.code));
    });
};
