import {dynaError} from "dyna-error";

import {
  API_PATH_ApiWorkzoneItemBroadcastPost,
  IApiWorkzoneItemBroadcastPostBodyRequest,
  IApiWorkzoneItemBroadcastPostResponse,
} from "mhc-server";

import {getOnline} from "../../../utils/getOnline";
import {apiFetch} from "../../../api/apiFetch";

export const apiWorkzoneItemBroadcastPost = (workzoneId: string): Promise<IApiWorkzoneItemBroadcastPostResponse> => {
  if (!getOnline()) {
    throw dynaError({
      message: 'Cannot broadcast, you are offline',
      userMessage: 'You are offline.',
    });
  }

  return  apiFetch.request<IApiWorkzoneItemBroadcastPostBodyRequest, IApiWorkzoneItemBroadcastPostResponse>({
    path: API_PATH_ApiWorkzoneItemBroadcastPost,
    method: 'POST',
    body: {workzoneId},
  });
};
