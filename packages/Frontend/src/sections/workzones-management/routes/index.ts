import {IAppRoute} from "../../application/config/IAppRoute";

import {routeWorkZonesManagement} from "./routeWorkZonesManagement";
import {routeWorkZonesList} from "./routeWorkZonesList";
import {routeWorkzoneCreate} from "./routeWorkzoneCreate";
import {routeWorkZonesEdit} from "./routeWorkzoneEdit";
import {routeWorkzonesAppSettings} from "./routeWorkzonesAppSettings";

import {routeWorkzoneOffline} from "./routeWorkzoneOffline";
import {routeWorkzoneOfflinePrepare} from "./routeWorkzoneOfflinePrepare";
import {routeSaveOfflineMaps} from "./routeSaveOfflineMaps";

export const routesWorkZonesManagement: IAppRoute<any>[] = [
  routeWorkZonesList,
  routeWorkzoneCreate,
  routeWorkZonesEdit,
  routeWorkzoneOfflinePrepare,
  routeWorkzoneOffline,
  routeSaveOfflineMaps,
  routeWorkzonesAppSettings,
  routeWorkZonesManagement,
];
