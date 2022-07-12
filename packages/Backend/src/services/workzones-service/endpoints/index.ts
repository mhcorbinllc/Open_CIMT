import * as express from "express";

import {apiWorkzonesAppSettingGet} from "./apiWorkzonesAppSettingGet";
import {apiWorkzonesAppSettingPost} from "./apiWorkzonesAppSettingPost";

import {apiWorkzoneItemPost} from "./apiWorkzoneItemPost";
import {apiWorkzoneItemGet} from "./apiWorkzoneItemGet";
import {apiWorkzoneItemPut} from "./apiWorkzoneItemPut";
import {apiWorkzoneItemSearchGet} from "./apiWorkzoneItemSearchGet";
import {apiWorkzoneItemDelete} from "./apiWorkzoneItemDelete";
import {apiWorkzoneItemUndelete} from "./apiWorkzoneItemUndelete";
import {apiWorkzoneItemHistorySearchGet} from "./apiWorkzoneItemHistorySearchGet";
import {apiWorkzoneItemBroadcastPost} from "./apiWorkzoneItemBroadcastPost";
import {apiWorkzoneItisCodesGet} from "./apiWorkzoneItisCodesGet";
import {apiWorkzonesManagementOfflineImportPost} from "./apiWorkzonesManagementOfflineImportPost";
import {apiWorkzonesForOfflineUseGet} from "./apiWorkzonesForOfflineUseGet";
import {apiGeoPointElevationGet} from "./apiGeoPointElevationGet";

export const addEndpoints = (
  {expressApp}: {
    expressApp: express.Application;

  },
): void => {
  apiWorkzonesAppSettingGet({expressApp});
  apiWorkzonesAppSettingPost({expressApp});

  apiWorkzoneItemPost({expressApp});
  apiWorkzoneItemGet({expressApp});
  apiWorkzoneItemPut({expressApp});
  apiWorkzoneItemSearchGet({expressApp});
  apiWorkzoneItemDelete({expressApp});
  apiWorkzoneItemUndelete({expressApp});
  apiWorkzoneItemHistorySearchGet({expressApp});
  apiWorkzoneItemBroadcastPost({expressApp});
  apiWorkzoneItisCodesGet({expressApp});
  apiWorkzonesManagementOfflineImportPost({expressApp});
  apiWorkzonesForOfflineUseGet({expressApp});
  apiGeoPointElevationGet({expressApp});
};
