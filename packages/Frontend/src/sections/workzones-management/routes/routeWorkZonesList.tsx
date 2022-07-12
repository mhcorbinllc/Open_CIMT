import {
  EWorkZonesManagementRights,
} from "mhc-server";

import {IAppRoute} from "../../application/config/IAppRoute";
import {WorkzonesListPage} from "../pages/WorkzonesListPage/WorkzonesListPage";

export const routeWorkZonesList: IAppRoute<{search?: string}> = {
  pageTitle: 'CIMs',
  routePath: '/cims/list/:search?/',
  getRoutePath: () => routeWorkZonesList.routePath,
  menuId: 'cims-list',
  userHasAllRights: [],
  userHasAnyOfRights: [
    EWorkZonesManagementRights.WORKZONES_VIEW,
    EWorkZonesManagementRights.WORKZONES_EDIT,
  ],
  render: ({params: {search = ""}}) =>
    <WorkzonesListPage
      search={search}
    />,
};
