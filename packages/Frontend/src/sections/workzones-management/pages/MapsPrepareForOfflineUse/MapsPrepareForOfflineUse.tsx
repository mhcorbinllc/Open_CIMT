import {useEffect} from "react";
import {connect} from "react-dynadux";

import {
  FlexContainerVertical,
  FlexItemMin,
  FlexItemMax,
} from "mhc-ui-components/dist/FlexContainer";
import {BreakpointDeviceContainer} from "mhc-ui-components/dist/BreakpointDeviceContainer";

import {GeoMapLeafletOfflineManager} from "mhc-ui-components/dist/GeoMapLeafletOfflineManager";

import {Title} from "../../../../components/Title";

import {IAppStore} from "../../../../state/IAppStore";

import {useTheme} from "mhc-ui-components/dist/ThemeProvider";

export interface IMapsPrepareForOfflineUseProps {
  store: IAppStore;
}

export const MapsPrepareForOfflineUse = connect((props: IMapsPrepareForOfflineUseProps): JSX.Element => {
  const theme = useTheme();
  const {store} = props;

  useEffect(() => {
    store.app.actions.disableThemeChange(true);
    store.userAuth.actions.refreshToken(2);
    return () => store.app.actions.disableThemeChange(false);
  }, []);

  return (
    <FlexContainerVertical
      dataComponentName="MapsPrepareForOfflineUse"
      fullHeight
    >
      <FlexItemMin
        sx={{
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
        }}
      >
        <BreakpointDeviceContainer allExcept mobile>
          <Title>Save maps for offline use</Title>
        </BreakpointDeviceContainer>
        <ul>
          <li>Zoom at the area you want to save</li>
          <li>Press the <i className="fa fa-save"/> button</li>
        </ul>
      </FlexItemMin>
      <FlexItemMax>
        <GeoMapLeafletOfflineManager
          id="save-offline"
          gestureZoom
          delayStart={2500} // Needs more then 1sec when is loaded as 1st page!
        />
      </FlexItemMax>
    </FlexContainerVertical>
  );
});
