import * as moment from "moment";
import {DynaMongoDB} from "dyna-mongo-db";

import {IWorkzone} from "../interfaces/IWorkzone";
import {getWorkzonesItemsCollection} from "./getWorkzonesCollections";

export const dbWorkzonesLoadForOfflineUse = async (
  {
    dmdb,
    companyId,
    lastMonths,
    skip,
    limit,
  }: {
    dmdb: DynaMongoDB;
    companyId: string;
    lastMonths: number;
    skip: number;
    limit: number;
  },
): Promise<IWorkzone[]> => {
  const collection = await getWorkzonesItemsCollection(dmdb, companyId);

  return collection.find(
    {
      createdAt: {
        $gte: moment().subtract(lastMonths, "months")
          .toDate()
          .valueOf(),
      },
    },
    {
      skip,
      limit,
    },
  )
    .toArray();
};
