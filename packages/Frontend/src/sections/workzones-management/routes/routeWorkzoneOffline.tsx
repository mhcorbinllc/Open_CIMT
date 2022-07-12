import {IAppRoute} from "../../application/config/IAppRoute";

import {ViewMenuItems} from "../../application/pages/ViewMenuItems";
import {routeWorkzoneOfflinePaths} from "./routeWorkzoneOffline.paths";

export const routeWorkzoneOffline: IAppRoute = {
  ...routeWorkzoneOfflinePaths,
  render: () => <ViewMenuItems menuId="INT-CIMs-offline"/>,
};
