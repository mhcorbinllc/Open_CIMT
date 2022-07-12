import {IWorkzone} from "mhc-server";

import {getBrowserDbWorkzonesCollection} from "./getBrowserDbWorkzonesCollection";

export const browserDbWorkzonesUpdate = async (
  {
    companyId,
    userId,
    workzones,
    externalImport,
  }: {
    companyId: string;
    userId: string;
    workzones: IWorkzone[];
    externalImport?: boolean;
  },
): Promise<void> => {
  const collection = getBrowserDbWorkzonesCollection(companyId, userId);
  collection.updateMany(
    workzones,
    {
      newerOnly: true,
      merge: false,
      externalImport,
    },
  );
};
