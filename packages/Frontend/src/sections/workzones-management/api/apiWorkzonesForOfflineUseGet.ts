import {
  IWorkzone,
  API_PATH_ApiWorkzonesForOfflineUseGet,
  IApiWorkzonesForOfflineUseGetQueryRequest,
  IApiWorkzonesForOfflineUseGetResponse,
} from "mhc-server";

import {apiFetch} from "../../../api/apiFetch";

export const apiWorkzonesForOfflineUseGet = async (args: IApiWorkzonesForOfflineUseGetQueryRequest): Promise<IWorkzone[]> => {
  const response = await apiFetch.request<void, IApiWorkzonesForOfflineUseGetResponse, IApiWorkzonesForOfflineUseGetQueryRequest>({
    path: API_PATH_ApiWorkzonesForOfflineUseGet,
    query: args,
  });
  return response.workzones;
};
