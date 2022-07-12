import {EWZBroadcastSelectionMode} from "mhc-server";

import {IUIWorkzone} from "../../../IUIWorkzone";

import {IUseFormApi} from "mhc-ui-components/dist/useForm";

import {dynaSwitch} from "dyna-switch";
import {WorkzoneFormBroadcastAreaSelectionByPolygon} from "./components/WorkzoneFormBroadcastAreaSelectionByPolygon";
import {WorkzoneFormBroadcastAreaSelectionByRadius} from "./components/WorkzoneFormBroadcastAreaSelectionByRadius";

export interface IWorkzoneFormBroadcastAreaSelectionProps {
  useFormApi: IUseFormApi<IUIWorkzone>;
  onGoToReferencePointTab: () => void;
}

export const WorkzoneFormBroadcastAreaSelection = (props: IWorkzoneFormBroadcastAreaSelectionProps): JSX.Element => {
  const {
    useFormApi,
    useFormApi: {
      change,
      data: {
        broadcast,
        broadcast: {selectionMode},
      },
    },
    onGoToReferencePointTab,
  } = props;

  return dynaSwitch(
    selectionMode,
    () => {
      // Backend unknown selection mode, switch it to Polygon
      change({
        broadcast: {
          ...broadcast,
          selectionMode: EWZBroadcastSelectionMode.REGION,
        },
      });
      return <div>Loading...</div>;
    },
    {
      [EWZBroadcastSelectionMode.REGION]:
        <WorkzoneFormBroadcastAreaSelectionByPolygon
          useFormApi={useFormApi}
        />,
      [EWZBroadcastSelectionMode.RADIUS]:
        <WorkzoneFormBroadcastAreaSelectionByRadius
          useFormApi={useFormApi}
          onGoToReferencePointTab={onGoToReferencePointTab}
        />,
    },
  );
};
