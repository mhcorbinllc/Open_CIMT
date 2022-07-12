import {IAppRoute} from "../../application/config/IAppRoute";
import {ViewMenuItems} from "../../application/pages/ViewMenuItems";
import {routeWorkZonesManagementPaths} from "./routeWorkZonesManagement.paths";

export const routeWorkZonesManagement: IAppRoute = {
  ...routeWorkZonesManagementPaths,
  render: () =>
    <ViewMenuItems
      menuId="INT-CIMs-management-main-menu"
    />,
};
