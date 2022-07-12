import {dynaSwitch} from "dyna-switch";

import {IOfflineInfo} from "../../api/interfaces";
import {EOfflineStatus} from "../../api/interfaces";

import {
  FlexContainerHorizontal,
  FlexItemMin,
  FlexItemMax,
} from "mhc-ui-components/dist/FlexContainer";

import UnknownIcon from "@mui/icons-material/Help";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SettingsSystemDaydreamIcon from "@mui/icons-material/SettingsSystemDaydream";
import {Box} from "mhc-ui-components/dist/Box";

export interface IOfflineInfoProps {
  offlineInfo: IOfflineInfo;

  showOnlineActual?: boolean; // Default is true
  showLabel?: boolean;        // Default is true
}

export const OfflineInfo = (props: IOfflineInfoProps): JSX.Element | null => {
  const {
    offlineInfo: {
      status,
      userMessage,
    },
    showOnlineActual = true,
    showLabel = true,
  } = props;

  if (status === EOfflineStatus.ACTUAL_VERSION && !showOnlineActual) return null;

  const icon = dynaSwitch<JSX.Element>(
    status,
    <UnknownIcon/>,
    {
      [EOfflineStatus.ACTUAL_VERSION]: <CloudDoneIcon/>,
      [EOfflineStatus.OFFLINE_VERSION]: <CloudDownloadIcon/>,
      [EOfflineStatus.CREATED_OFFLINE]: <CloudUploadIcon/>,
      [EOfflineStatus.UPDATED_OFFLINE]: <CloudUploadIcon/>,
      [EOfflineStatus.DELETED_OFFLINE]: <CloudUploadIcon/>,
      [EOfflineStatus.UNDELETED_OFFLINE]: <CloudUploadIcon/>,
      [EOfflineStatus.MIXED_LIST_CONTENT]: <SettingsSystemDaydreamIcon/>,
    },
  );

  return (
    <Box
      dataComponentName="OfflineInfo"
      sx={{opacity: 0.7}}
    >
      <FlexContainerHorizontal alignVertical="middle" fullHeight>
        <FlexItemMin>
          {icon}
        </FlexItemMin>
        <FlexItemMax
          sx={{
            marginTop: (theme) => theme.spacing(0.25),
            marginLeft: (theme) => theme.spacing(0.5),
            fontStyle: 'italic',
          }}
          show={showLabel && !!userMessage}
        >
          {userMessage}
        </FlexItemMax>
      </FlexContainerHorizontal>
    </Box>
  );
};
