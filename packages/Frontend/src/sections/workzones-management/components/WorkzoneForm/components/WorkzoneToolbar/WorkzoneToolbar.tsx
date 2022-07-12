import {IWorkzonesAppSettings} from "mhc-server";

import {IUIWorkzone} from "../../IUIWorkzone";

import {Box} from "mhc-ui-components/dist/Box";
import {IUseFormApi} from "mhc-ui-components/dist/useForm";
import {
  Alert,
  EAlertType,
} from "mhc-ui-components/dist/Alert";
import {FormatDate} from "mhc-ui-components/dist/FormatDate";
import {BreakpointDeviceContainer} from "mhc-ui-components/dist/BreakpointDeviceContainer";
import {FormToolbar} from "mhc-ui-components/dist/FormToolbar";
import {
  GridContainer,
  GridItem,
} from "mhc-ui-components/dist/Grid";

import {ItisCode} from "./components/ItisCode";

import {useTheme} from "mhc-ui-components/dist/ThemeProvider";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";

export interface IWorkzoneToolbarProps {
  workzoneAppSettings: IWorkzonesAppSettings;
  useFormApi: IUseFormApi<IUIWorkzone>;
}

export const WorkzoneToolbar = (props: IWorkzoneToolbarProps): JSX.Element => {
  const {
    workzoneAppSettings,
    useFormApi,
    useFormApi: {data: workzone},
  } = props;
  const theme = useTheme();

  const sxStartEndInfo: React.CSSProperties = {color: theme.palette.text.primary};
  const sxCreateUpdateInfo: React.CSSProperties = {color: theme.palette.text.secondary};
  const sxCreateUpdateLabel: React.CSSProperties = {color: theme.palette.text.secondary};

  return (
    <Box dataComponentName="WorkzoneToolbar">
      <Alert
        show={!!workzone.deletedAt}
        type={EAlertType.WARNING}
        title="Deleted at"
      >
        <FormatDate date={workzone.deletedAt}/>
      </Alert>

      <GridContainer spacingVertical={1}>

        <GridItem mobile={12} tablet={6}>
          <Box
            sx={{
              fontSize: theme.typography.fontSize * 1.3,
              fontWeight: 'bold',
              minHeight: 22,
            }}
          >
            {workzone.name}
          </Box>
          <BreakpointDeviceContainer allExcept mobile>
            <Box sx={{fontSize: theme.typography.fontSize}}>
              {workzone.itisCodes.map((itisCode, index) => (
                <ItisCode
                  key={index}
                  itisCode={itisCode}
                  itisCodes={workzoneAppSettings.itisCodes}
                />
              ))}
            </Box>
          </BreakpointDeviceContainer>
        </GridItem>

        <GridItem mobile={12} tablet={6}>
          <FormToolbar useFormApi={useFormApi}/>
        </GridItem>

        <GridItem>
          <BreakpointDeviceContainer laptop desktop wide>
            <Box
              sx={{
                fontSize: theme.typography.fontSize,
                color: theme.palette.text.secondary,
              }}
            >
              id: <code>{workzone.workzoneId}</code>
            </Box>
            <Box
              sx={{
                fontSize: theme.typography.fontSize,
                color: theme.palette.text.secondary,
              }}
            >
              kapsch-id: <code>{workzone.kapschId > -1 ? workzone.kapschId : '---'}</code>
            </Box>
          </BreakpointDeviceContainer>
        </GridItem>

        <GridItem>
          <BreakpointDeviceContainer laptop desktop wide>
            <Box
              sx={{
                fontSize: theme.typography.fontSize,
                '& svg': {
                  width: 18,
                  height: 18,
                  position: 'relative',
                  top: 2,
                },
              }}
            >
              <table>
                <tbody>
                  <tr>
                    <td style={sxStartEndInfo}><PlayArrowIcon/></td>
                    <td style={sxStartEndInfo}>Start</td>
                    <td style={sxStartEndInfo}><FormatDate date={workzone.start}/></td>
                    <td style={sxCreateUpdateInfo}><AddCircleIcon/></td>
                    <BreakpointDeviceContainer allExcept mobile>
                      <td style={sxCreateUpdateLabel}>Created</td>
                    </BreakpointDeviceContainer>
                    <td style={sxCreateUpdateInfo}><FormatDate date={workzone.createdAt} showDate/></td>
                  </tr>
                  <tr>
                    <td style={sxStartEndInfo}><StopIcon/></td>
                    <td style={sxStartEndInfo}>End</td>
                    <td style={sxStartEndInfo}><FormatDate date={workzone.end}/></td>
                    <td style={sxCreateUpdateInfo}><EditIcon/></td>
                    <BreakpointDeviceContainer allExcept mobile>
                      <td style={sxCreateUpdateLabel}>Changed</td>
                    </BreakpointDeviceContainer>
                    <td style={sxCreateUpdateInfo}><FormatDate date={workzone.updatedAt} showDate/></td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </BreakpointDeviceContainer>
        </GridItem>

      </GridContainer>
    </Box>
  );
};
