import {DynaMongoDB} from "dyna-mongo-db";
import {
  IWorkzonesAppSettings,
  defaultWorkzoneAppSettings,
} from "../interfaces/IWorkzonesAppSettings";
import {getWorkzonesAppSettingsCollection} from "./getWorkzonesCollections";

export const dbWorkzonesAppSettingsLoad = async (dmdb: DynaMongoDB, companyId: string, deviceId = '*'): Promise<IWorkzonesAppSettings> => {
  const collection = await getWorkzonesAppSettingsCollection(dmdb, companyId);
  const savedSettings = await collection.findOne({deviceId});

  if (savedSettings) {
    delete (savedSettings as any)._id;
    return savedSettings;
  }

  return {
    ...defaultWorkzoneAppSettings,
    deviceId,
    createdAt: Date.now(),
  };
};
