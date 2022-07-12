import {IWorkzone} from "mhc-server";

import {getBrowserDbWorkzonesCollection} from "./getBrowserDbWorkzonesCollection";

export const browserDbWorkzoneUpdate = async (
  {
    companyId,
    userId,
    workzone,
    externalImport,
  }: {
    companyId: string;
    userId: string;
    workzone: IWorkzone;
    externalImport: boolean;
  },
): Promise<string> => {
  const collection = getBrowserDbWorkzonesCollection(companyId, userId);
  return await collection.update(
    workzone,
    {
      newerOnly: true,
      merge: false,
      externalImport,
    },
  );
};
