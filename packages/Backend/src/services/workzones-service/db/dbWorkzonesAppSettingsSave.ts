import {DynaMongoDB} from "dyna-mongo-db";
import {IWorkzonesAppSettings} from "../interfaces/IWorkzonesAppSettings";
import {getWorkzonesAppSettingsCollection} from "./getWorkzonesCollections";

export const dbWorkzonesAppSettingsSave = async (
  {
    dmdb,
    companyId,
    workzoneAppSettings,
    externalImport = false,
    newerOnly = false,
  }: {
    dmdb: DynaMongoDB;
    companyId: string;
    workzoneAppSettings: IWorkzonesAppSettings;
    externalImport?: boolean;
    newerOnly?: boolean;
  },
): Promise<void> => {
  const collection = await getWorkzonesAppSettingsCollection(dmdb, companyId);

  const currentWorkzoneAppSettings = await collection.findOne({deviceId: workzoneAppSettings.deviceId});

  if (
    newerOnly
    && currentWorkzoneAppSettings
    && currentWorkzoneAppSettings.updatedAt > workzoneAppSettings.updatedAt
  ) {
    return;
  }

  const now = Date.now();

  await collection.updateOne(
    {deviceId: workzoneAppSettings.deviceId},
    {
      $set:
        externalImport
          ? workzoneAppSettings
          : {
            ...workzoneAppSettings,
            createdAt: currentWorkzoneAppSettings ? currentWorkzoneAppSettings.createdAt : now,
            updatedAt: now,
            deletedAt: 0,
          },
    },
    {upsert: true},
  );
};
