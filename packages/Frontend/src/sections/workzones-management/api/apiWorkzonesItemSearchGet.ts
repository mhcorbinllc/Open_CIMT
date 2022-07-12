import {
  IWorkzone,
  API_PATH_apiWorkzoneItemSearch,
  IApiWorkzoneItemSearchGetQueryRequest,
  IApiWorkzoneItemSearchGetResponse,
} from "mhc-server";
import {EOfflineStatus} from "./interfaces";
import {IDataWithOfflineInfo} from "./interfaces";

import {apiFetch} from "../../../api/apiFetch";
import {getOnline} from "../../../utils/getOnline";
import {checkOfflineUserSignedIn} from "../../user-authnentication/api/localstorageSignState";

import {browserDbWorkzonesUpdate} from "./browserDb/entities/workzone/browserDbWorkzonesUpdate";
import {browserDbWorkzoneSearch} from "./browserDb/entities/workzone/browserDbWorkzoneSearch";
import {browserDbWorkzoneLoadMany} from "./browserDb/entities/workzone/browserDbWorkzoneLoadMany";
import {browserDbWorkzoneLoadOfflineCreated} from "./browserDb/entities/workzone/browserDbWorkzoneLoadOfflineCreated";
import {cimDefreezeDates} from "./utils/cimDefreezeDates";

export type IApiWorkzonesItemSearchGetResult = IDataWithOfflineInfo<IDataWithOfflineInfo<IWorkzone>[]>;

export const apiWorkzonesItemSearchGet = async (
  args: {
    companyId: string;
    userId: string;
    search: string;
    deleted: boolean;
    forEver: boolean | 'both';
    skip: number;
    limit: number;
    sortByFieldName: string;
    sortDirection: 0 | 1 | -1;
  },
): Promise<IApiWorkzonesItemSearchGetResult> => {
  const results = await (
    getOnline()
      ? apiWorkzonesItemSearchGetOnline(args)
      : apiWorkzonesItemSearchGetOffline(args)
  );
  return {
    ...results,
    data: results.data.map(item => ({
      ...item,
      data: cimDefreezeDates(item.data),
    })),
  };
};

const apiWorkzonesItemSearchGetOnline = async (
  {
    companyId,
    userId,
    search,
    deleted,
    forEver = 'both',
    skip,
    limit,
    sortByFieldName,
    sortDirection,
  }: {
    companyId: string;
    userId: string;
    search: string;
    deleted: boolean;
    forEver?: boolean | 'both';
    skip: number;
    limit: number;
    sortByFieldName: string;
    sortDirection: 0 | 1 | -1;
  },
): Promise<IApiWorkzonesItemSearchGetResult> => {
  const outputData: IApiWorkzonesItemSearchGetResult = {
    data: [],
    offlineInfo: {
      status: EOfflineStatus.ACTUAL_VERSION,
      userMessage: '',
    },
  };

  // Load the created and unsaved yet offline CIMs and put them on top the list
  // Note, these are expected:
  // - The offline items filtered by user's search
  // - The top offline items are not sorted!
  // - The return items for the 1st page load is increased by the offline unsaved items.
  // - The offline unsaved items are shown on top of the list and not mixed with the online items.
  if (skip === 0) {
    const createdOfflineWorkzones = await browserDbWorkzoneLoadOfflineCreated({
      companyId,
      userId,
      search,
      forEver,
    });
    createdOfflineWorkzones.forEach(workzone => outputData.data.push({
      data: workzone,
      offlineInfo: {
        status: EOfflineStatus.CREATED_OFFLINE,
        userMessage: 'Created locally and still not saved on server.',
      },
    }));
  }

  // Load Server side CIMs and make a dic
  const response = await apiFetch.request<void, IApiWorkzoneItemSearchGetResponse, IApiWorkzoneItemSearchGetQueryRequest>({
    path: API_PATH_apiWorkzoneItemSearch,
    query: {
      search,
      deleted: deleted.toString(),
      forEver,
      skip: skip.toString(),
      limit: limit.toString(),
      sortByFieldName,
      sortDirection: sortDirection.toString() as any,
    },
  });
  const onlineWorkzones = response.workzones;
  const onlineWorkzonesUpdatedAtDic = onlineWorkzones.reduce((acc: { [workzoneId: string]: number }, workzone) => {
    acc[workzone.workzoneId] = workzone.updatedAt;
    return acc;
  }, {});

  // Load the Offline Version of the online CIMs and make a dic
  const offlineWorkzones = await browserDbWorkzoneLoadMany(companyId, userId, onlineWorkzones.map(wz => wz.workzoneId));
  const offlineWorkzonesDic = offlineWorkzones.reduce((acc: { [workzoneId: string]: IWorkzone }, workzone) => {
    if (!workzone) return acc;
    acc[workzone.workzoneId] = workzone;
    return acc;
  }, {});

  // Merge (doc level) Server's with offline, (winner is the newer by updatedAt)
  let offlineAnsyncedItemsCount = 0;
  onlineWorkzones.forEach(onlineWorkzone => {

    // If there is no newer offline version for this CIM, add it in the output
    const offlineWorkzone = offlineWorkzonesDic[onlineWorkzone.workzoneId];
    if (!offlineWorkzone) {
      outputData.data.push({
        data: onlineWorkzone,
        offlineInfo: {
          status: EOfflineStatus.ACTUAL_VERSION,
          userMessage: '',
        },
      });
      return;
    }

    const onlineWorkzoneUpdatedAt = onlineWorkzonesUpdatedAtDic[offlineWorkzone.workzoneId];
    const offlineIsNewer = offlineWorkzone.updatedAt > onlineWorkzoneUpdatedAt;
    const offlineIsSame = offlineWorkzone.updatedAt === onlineWorkzoneUpdatedAt;
    const offlineIsOlder = offlineWorkzone.updatedAt < onlineWorkzoneUpdatedAt;

    // Merge
    if (offlineIsNewer) {
      offlineAnsyncedItemsCount++;
      outputData.offlineInfo.status = EOfflineStatus.MIXED_LIST_CONTENT;
      outputData.offlineInfo.userMessage = `${offlineAnsyncedItemsCount} CIMs are still not synced`;
      outputData.data.push({
        data: offlineWorkzone,
        offlineInfo: {
          status: EOfflineStatus.OFFLINE_VERSION,
          userMessage: "Your changes are still not saved.",
        },
      });
    }
    if (offlineIsSame) {
      outputData.data.push({
        data: onlineWorkzone,
        offlineInfo: {
          status: EOfflineStatus.ACTUAL_VERSION,
          userMessage: '',
        },
      });
    }
    if (offlineIsOlder) {
      outputData.data.push({
        data: onlineWorkzone,
        offlineInfo: {
          status: EOfflineStatus.ACTUAL_VERSION,
          userMessage: "Your still unsaved changes are overridden by server's newer version!",
          // Note: User will show this message only once! Because lower, we update the offline CIMs with the new fetched.
          // The user can see this "lost" change on CIMs' history once it is uploaded to the server.
        },
      });
    }
  });

  // Save the loaded online CIMs, as external import (if newer, default policy by the browserDbWorkzonesUpdate)
  browserDbWorkzonesUpdate({
    companyId,
    userId,
    workzones: onlineWorkzones,
    externalImport: true,
  });

  return outputData;
};

const apiWorkzonesItemSearchGetOffline = async (
  {
    companyId,
    userId,
    search,
    deleted,
    forEver = 'both',
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
): Promise<IApiWorkzonesItemSearchGetResult> => {
  checkOfflineUserSignedIn();

  const offlineWorkzones = await browserDbWorkzoneSearch({
    companyId,
    userId,
    forEver,
    deleted,
    search,
    skip,
    limit,
    sortByFieldName,
    sortDirection,
  });

  return {
    data:
      offlineWorkzones
        .map(workzone => ({
          data: workzone,
          offlineInfo: {
            status: EOfflineStatus.OFFLINE_VERSION,
            userMessage: 'Offline version',
          },
        })),
    offlineInfo: {
      status: EOfflineStatus.OFFLINE_VERSION,
      userMessage: 'You are offline. Offline CIMs are listed.',
    },
  };
};
