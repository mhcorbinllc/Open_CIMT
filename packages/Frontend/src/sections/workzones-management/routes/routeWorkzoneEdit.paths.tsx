import {
  EWorkZonesManagementRights,
} from "mhc-server";

import {IAppRoute} from "../../application/config/IAppRoute";

export const routeWorkZonesEditPaths: IAppRoute<{
  workzoneId: string;
  tabLevel1?: string;
  tabLevel2?: string;
}> = {
  pageTitle: 'Edit CIM',
  routePath: '/cim/edit/:workzoneId/:tabLevel1?/:tabLevel2?',
  getRoutePath: ({
    workzoneId, tabLevel1 = "", tabLevel2 = "",
  }) =>
    '/' +
    routeWorkZonesEditPaths.routePath
      .replace(':workzoneId', workzoneId)
      .replace(':tabLevel1?', tabLevel1)
      .replace(':tabLevel2?', tabLevel2)
      .split('/')
      .filter(Boolean)
      .join('/')
  ,
  menuId: 'edit-CIM',
  exact: true,
  userHasAllRights: [],
  userHasAnyOfRights: [
    EWorkZonesManagementRights.WORKZONES_VIEW,
    EWorkZonesManagementRights.WORKZONES_EDIT,
  ],
  render: () => null,
};
