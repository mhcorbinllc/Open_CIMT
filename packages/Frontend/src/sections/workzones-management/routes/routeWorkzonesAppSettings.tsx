import {
  EWorkZonesManagementRights,
} from "mhc-server";

import {IAppRoute} from "../../application/config/IAppRoute";
import {WorkzonesAppSettings} from "../pages/WorkzonesAppSettings/WorkzonesAppSettings";

export const routeWorkzonesAppSettings: IAppRoute = {
  pageTitle: 'CIMT App Settings',
  routePath: '/cimt/settings',
  getRoutePath: () => routeWorkzonesAppSettings.routePath,
  menuId: 'cimt-settings',
  userHasAllRights: [EWorkZonesManagementRights.WORKZONES_EDIT],
  userHasAnyOfRights: [],
  render: () => <WorkzonesAppSettings/>,
};
