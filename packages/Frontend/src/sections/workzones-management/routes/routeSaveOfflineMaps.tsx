import {
  EWorkZonesManagementRights,
} from "mhc-server";

import {IAppRoute} from "../../application/config/IAppRoute";
import {MapsPrepareForOfflineUse} from "../pages/MapsPrepareForOfflineUse/MapsPrepareForOfflineUse";

export const routeSaveOfflineMaps: IAppRoute = {
  pageTitle: 'Save Offline Maps',
  routePath: '/cimt/save-offline-maps',
  getRoutePath: () => routeSaveOfflineMaps.routePath,
  menuId: 'save-offline-maps',
  userHasAllRights: [EWorkZonesManagementRights.WORKZONES_EDIT],
  userHasAnyOfRights: [],
  render: () => <MapsPrepareForOfflineUse/>,
};
