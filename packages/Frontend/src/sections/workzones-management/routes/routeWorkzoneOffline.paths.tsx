import {
  EWorkZonesManagementRights,
} from "mhc-server";

import {IAppRoute} from "../../application/config/IAppRoute";

export const routeWorkzoneOfflinePaths: IAppRoute = {
  pageTitle: 'Offline',
  routePath: '/cimt/offline',
  getRoutePath: () => routeWorkzoneOfflinePaths.routePath,
  menuId: 'CIMs-offline',
  userHasAllRights: [EWorkZonesManagementRights.WORKZONES_EDIT],
  userHasAnyOfRights: [],
  render: () => null,
};
