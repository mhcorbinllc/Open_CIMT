import {Db} from "mongodb";
import {syncPromises} from "dyna-sync";

import {
  IWorkzonesAppSettings,
} from "../../interfaces/IWorkzonesAppSettings";
import {getDefaultAppItisCodes} from "../../interfaces/getDefaultAppItisCodes";

export const mergeUpdatedDefaultItisCodes = async (
  {
    db,
    collectionName,
  }: {
    db: Db;
    collectionName: string;
  },
): Promise<void> => {
  const collection = db.collection<IWorkzonesAppSettings>(collectionName);
  const appsSettings = await collection.find().toArray();
  const defaultAppItisCodes = getDefaultAppItisCodes();

  await syncPromises(
    ...appsSettings.map(appSettings => {

      const hasSameCodes =
        appSettings.itisCodes.map(v => v.code).sort()
          .join(',') ===
        defaultAppItisCodes.map(v => v.code).sort()
          .join(',');

      if (hasSameCodes) return () => Promise.resolve();

      const mergedItisCodes = defaultAppItisCodes
        .filter((v) => !appSettings.itisCodes.find(t =>
          t.code === v.code
          && t.label.toLowerCase() === v.label.toLowerCase(),
        ))
        .concat(appSettings.itisCodes);

      return async () => {
        await collection.updateOne(
          {deviceId: appSettings.deviceId},
          {$set: {itisCodes: mergedItisCodes}},
        );
      };
    }),
  );
};
