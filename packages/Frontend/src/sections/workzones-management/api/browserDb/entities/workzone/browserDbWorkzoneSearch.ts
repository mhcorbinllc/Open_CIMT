import {IWorkzone} from "mhc-server";

import {getBrowserDbWorkzonesCollection} from "./getBrowserDbWorkzonesCollection";

export const browserDbWorkzoneSearch = async (
  {
    companyId,
    userId,
    search,
    forEver: filterForEver = 'both',
    deleted,
    skip,
    limit,
    sortByFieldName,
    sortDirection,
  }: {
    companyId: string;
    userId: string;
    search: string;
    forEver?: boolean | 'both';
    deleted: boolean;
    skip: number;
    limit: number;
    sortByFieldName: string;
    sortDirection: 0 | 1 | -1;
  },
): Promise<IWorkzone[]> => {
  const collection = getBrowserDbWorkzonesCollection(companyId, userId);
  const workzones = await collection.search({
    searchText: search,
    deleted,
    pagination: {
      skip,
      limit,
    },
    sort: {
      fieldName: sortByFieldName,
      direction: sortDirection,
    },
  });

  // Todo: MHC-00448 This filter is problematic. If all fetched Workzones doesn't match the `forEver` filter, the output will be empty array.
  // Empty array means "There are no more records" but this is not true.
  // The fix is to improve the collection.search (of the getBrowserDbWorkzonesCollection) to support the `find` feature, like the `dbSearchCollection` for the MondoDb
  return workzones.filter(workzone => {
    if (filterForEver === 'both') return true;      // Return all
    const {forEver: wzForEver = false} = workzone;  // Fallback for all Workzones with forEver === undefined

    return wzForEver === filterForEver;
  });
};
