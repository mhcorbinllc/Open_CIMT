import {IWorkzone} from "mhc-server";

import {getBrowserDbWorkzonesCollection} from "./getBrowserDbWorkzonesCollection";

export const browserDbWorkzoneLoad = async (companyId: string, userId: string, workzoneId: string): Promise<IWorkzone | null> => {
  const collection = getBrowserDbWorkzonesCollection(companyId, userId);
  return collection.get(workzoneId);
};
