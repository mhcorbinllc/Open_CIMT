import {IAppRoute} from "../../application/config/IAppRoute";
import {routeWorkZonesEditPaths} from "./routeWorkzoneEdit.paths";
import {WorkzoneCRUDPage} from "../pages/WorkzoneCRUDPage/WorkzoneCRUDPage";

export const routeWorkZonesEdit: IAppRoute<{
  workzoneId: string;
  tabLevel1?: string;
  tabLevel2?: string;
}> = {
  ...routeWorkZonesEditPaths,
  render: ({
    params: {
      workzoneId, tabLevel1, tabLevel2,
    },
  }) =>
    <WorkzoneCRUDPage
      workzoneId={workzoneId}
      tabLevel1={tabLevel1}
      tabLevel2={tabLevel2}
    />,
};
