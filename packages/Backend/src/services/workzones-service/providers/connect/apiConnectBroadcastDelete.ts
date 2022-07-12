import axios, {AxiosError} from 'axios';
import {
  dynaError,
  IDynaError,
} from "dyna-error";

import {IConnectWorkzone} from "../../interfaces/IConnectWorkzone";
import {IConnectResponse} from "./IConnectResponse";

export const apiConnectBroadcastDelete = async (connectWorkzone: IConnectWorkzone): Promise<IConnectResponse> => {
  try {
    const axiosResponse = await axios.request({
      url: process.env.BROADCAST_API_URL,
      method: "DELETE",
      data: connectWorkzone,
      withCredentials: true,
      headers: {'content-type': 'application/json; charset=utf-8'},
      auth: {
        username: process.env.BROADCAST_API_LOGIN_NAME || '',
        password: process.env.BROADCAST_API_PASSWORD || '',
      },
    });
    return axiosResponse.data;
  }
  catch (e) {
    const axiosError: AxiosError = e;
    const error = dynaError({
      code: 202105051835,
      status: 503,
      message: `Broadcast Backend API responded with error status: [${axiosError.response?.status}]. (Check server logs for more)`,
      userMessage: 'There was an error processing your request.',
    });
    console.error('apiWorkzoneItemBroadcastPost', {
      ...error,
      message: `Broadcast Backend API responded with error: [${axiosError.message}] status: [${axiosError.response?.status}]`,
      data: {response: axiosError.response},
    } as IDynaError);
    throw error;
  }
};
