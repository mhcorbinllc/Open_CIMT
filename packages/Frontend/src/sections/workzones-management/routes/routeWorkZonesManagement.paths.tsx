import {
  EWorkZonesManagementRights,
} from "mhc-server";
import {IAppRoute} from "../../application/config/IAppRoute";

export const routeWorkZonesManagementPaths: IAppRoute = {
  pageTitle: 'CIMs Management',
  routePath: '/cims-management',
  getRoutePath: () => routeWorkZonesManagementPaths.routePath,
  menuId: 'cims-management',
  userHasAllRights: [],
  userHasAnyOfRights: [
    EWorkZonesManagementRights.WORKZONES_VIEW,
    EWorkZonesManagementRights.WORKZONES_EDIT,
  ],
  render: () => null,
};
