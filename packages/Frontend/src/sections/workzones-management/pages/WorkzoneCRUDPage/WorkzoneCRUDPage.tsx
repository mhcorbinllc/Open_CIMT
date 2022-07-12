import {connect} from "react-dynadux";

import {
  EWorkZonesManagementRights,
} from "mhc-server";

import {IAppStore} from "../../../../state/IAppStore";
import {WorkzoneForm} from "../../components/WorkzoneForm/WorkzoneForm";

export interface IWorkzoneCRUDPageProps {
  store: IAppStore;
  workzoneId?: string;
  tabLevel1?: string;
  tabLevel2?: string;
}

export const WorkzoneCRUDPage = connect((props: IWorkzoneCRUDPageProps): JSX.Element => {
  const {
    store: {userAuth: {utils: {userHasAllRights}}},
    workzoneId,
    tabLevel1,
    tabLevel2,
  } = props;

  return (
    <WorkzoneForm
      workzoneId={workzoneId}
      allowBroadcast={userHasAllRights([
        EWorkZonesManagementRights.WORKZONES_EDIT,
      ])}
      tabLevel1={tabLevel1}
      tabLevel2={tabLevel2}
    />
  );
});
