import {
  API_PATH_apiWorkzoneItemHistorySearch,
  IApiWorkzoneItemHistorySearchGetQueryRequest,
  IApiWorkzoneItemHistorySearchGetResponse,
  IWorkzoneHistory,
} from "mhc-server";

import {apiFetch} from "../../../api/apiFetch";

export const apiWorkzoneItemHistoryGet = async (
  {
    workzoneId,
    search,
    skip,
    limit,
  }: {
    workzoneId: string;
    search: string;
    skip: string;
    limit: string;
  },
): Promise<IWorkzoneHistory[]> => {
  const response = await apiFetch.request<void, IApiWorkzoneItemHistorySearchGetResponse, IApiWorkzoneItemHistorySearchGetQueryRequest>({
    path: API_PATH_apiWorkzoneItemHistorySearch,
    method: 'GET',
    query: {
      workzoneId,
      search,
      skip,
      limit,
    },
  });
  return response.workzones;
};
