export interface IConnectResponse {
    status: "Success" | any;
    messageID: number;
    userError?: string;
    updatedRSUs: number;
  }
