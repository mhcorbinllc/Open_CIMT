import {
  EWorkZonesManagementRights,
} from "mhc-server";

import {IAppRoute} from "../../application/config/IAppRoute";
import {WorkzoneCRUDPage} from "../pages/WorkzoneCRUDPage/WorkzoneCRUDPage";

export const routeWorkzoneCreate: IAppRoute = {
  pageTitle: 'Create CIM',
  routePath: '/cim/create',
  getRoutePath: () => routeWorkzoneCreate.routePath,
  userHasAllRights: [EWorkZonesManagementRights.WORKZONES_EDIT],
  userHasAnyOfRights: [],
  render: () => <WorkzoneCRUDPage/>,
};

