import {IWorkzone} from "mhc-server";

import {getBrowserDbWorkzonesCollection} from "./getBrowserDbWorkzonesCollection";

export const browserDbWorkzoneLoadMany = async (companyId: string, userId: string, workzoneIds: string[]): Promise<Array<IWorkzone | null>> => {
  const collection = getBrowserDbWorkzonesCollection(companyId, userId);
  return collection.getMany(workzoneIds);
};
