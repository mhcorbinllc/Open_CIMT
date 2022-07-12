import {EWZBroadcastSelectionMode} from "mhc-server";

import {IUIWorkzone} from "../../../../IUIWorkzone";

import {Box} from "mhc-ui-components/dist/Box";
import {Button} from "mhc-ui-components/dist/Button";
import {
  IUseFormApi,
  EViewMode,
} from "mhc-ui-components/dist/useForm";

import {
  useTheme,
  SxProps,
} from "mhc-ui-components/dist/ThemeProvider";
import CheckedIcon from "@mui/icons-material/CheckCircle";
import UncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

export interface IBroadcastAreaSelectionModeButtonProps {
  useFormApi: IUseFormApi<IUIWorkzone>;
}

export const BroadcastAreaSelectionModeButton = (props: IBroadcastAreaSelectionModeButtonProps): JSX.Element => {
  const {
    useFormApi: {
      viewMode,
      data: {
        broadcast,
        broadcast: {selectionMode},
      },
      change,
    },
  } = props;
  const theme = useTheme();

  const handleClick = (): void => {
    change({
      broadcast: {
        ...broadcast,
        selectionMode: selectionMode === EWZBroadcastSelectionMode.REGION
          ? EWZBroadcastSelectionMode.RADIUS
          : EWZBroadcastSelectionMode.REGION,

      },
    });
  };

  const sxIcon: SxProps = {
    width: 15,
    height: 15,
    position: 'relative',
    top: 2,
  };

  const renderCheckIcon = (checkSelectionMode: EWZBroadcastSelectionMode): JSX.Element => {
    return selectionMode === checkSelectionMode
      ? <CheckedIcon sx={sxIcon}/>
      : <UncheckedIcon sx={sxIcon}/>;
  };

  return (
    <Button
      sx={{fontSize: theme.typography.fontSize}}
      disabled={viewMode === EViewMode.VIEW}
      onClick={handleClick}
    >
      <Box
        sx={{
          textAlign: 'left',
          whiteSpace: 'nowrap',
        }}
      >
        <div>{renderCheckIcon(EWZBroadcastSelectionMode.RADIUS)} Radius</div>
        <div>{renderCheckIcon(EWZBroadcastSelectionMode.REGION)} Polygon</div>
      </Box>
    </Button>
  );
};
