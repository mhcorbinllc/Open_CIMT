import {
  EWorkZonesManagementRights,
} from "mhc-server";

import {IAppRoute} from "../../application/config/IAppRoute";

import {WorkzonesPrepareForOffline} from "../pages/WorkzonesPrepareForOffline/WorkzonesPrepareForOffline";

export const routeWorkzoneOfflinePrepare: IAppRoute = {
  pageTitle: 'Prepare CIMs for offline use',
  routePath: '/cimt/prepare-offline-use',
  getRoutePath: () => routeWorkzoneOfflinePrepare.routePath,
  menuId: 'CIMs-prepare-for-offline-use',
  userHasAllRights: [EWorkZonesManagementRights.WORKZONES_EDIT],
  userHasAnyOfRights: [],
  render: () => <WorkzonesPrepareForOffline/>,
};
