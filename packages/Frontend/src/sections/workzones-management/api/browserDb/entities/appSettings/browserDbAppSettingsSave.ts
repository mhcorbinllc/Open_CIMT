import {IWorkzonesAppSettings} from "mhc-server";

import {getBrowserDbAppSettingsCollection} from "./getBrowserDbAppSettingsCollection";

export const browserDbAppSettingsSave = async (
  {
    companyId,
    userId,
    appSettings,
    externalImport,
  }: {
    companyId: string;
    userId: string;
    appSettings: IWorkzonesAppSettings;
    externalImport: boolean;
  },
): Promise<void> => {
  try {
    const collection = getBrowserDbAppSettingsCollection(companyId, userId);
    await collection.update(
      {
        ...appSettings,
        updatedAt: externalImport
          ? appSettings.updatedAt
          : Date.now(),
      },
      {
        newerOnly: true,
        externalImport,
      },
    );
  }
  catch (e) {
    console.error('browserDbAppSettingsSave: cannot save', e);
  }
};
