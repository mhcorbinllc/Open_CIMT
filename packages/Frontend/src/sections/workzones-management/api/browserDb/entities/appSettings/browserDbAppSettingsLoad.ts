import {IWorkzonesAppSettings} from "mhc-server";

import {getBrowserDbAppSettingsCollection} from "./getBrowserDbAppSettingsCollection";

export const browserDbAppSettingsLoad = async (companyId: string, userId: string): Promise<IWorkzonesAppSettings | null> => {
  try {
    const collection = getBrowserDbAppSettingsCollection(companyId, userId);
    const output = await collection.get('*');
    return output;
  }
  catch (e) {
    console.error('browserDbAppSettingsLoad: cannot load', e);
    return null;
  }
};
