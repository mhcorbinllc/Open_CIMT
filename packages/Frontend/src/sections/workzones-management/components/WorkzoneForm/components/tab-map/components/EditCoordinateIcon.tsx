import {FlexContainer} from "mhc-ui-components/dist/FlexContainer";

import {Box} from "mhc-ui-components/dist/Box";

import CreateIcon from "@mui/icons-material/Create";

// New note: Why not use useTheme() to get the colours?
//   For some reason, the component is rendered by react-leaflet out of the context of the App.
//   As result, the useTheme() returns null.
//   As a quick fix, we pick the colours from the package.
import orange from "@mui/material/colors/orange";
import gray from "@mui/material/colors/grey";

export const EditCoordinateIcon = () => {
  const markerColor = orange[500];

  return (
    <FlexContainer
      sx={{
        background: markerColor,
        position: 'relative',
        width: 24,
        height: 24,
        right: "12px", // Marker calibration
        bottom: "42px", // Marker calibration
        borderRadius: "50%",
        borderWidth: 1.75,
        borderStyle: "solid",
        borderColor: gray[800],
        textAlign: "center",
        lineHeight: 100,
        verticalAlign: "middle",
      }}
      justifyCenter
      alignCenter
    >
      <CreateIcon
        htmlColor="#fff"
        sx={{
          width: 18.6,
          height: 18.6,
        }}
      />
      <Box
        sx={{
          bottom: -20,
          borderLeft: "11px solid transparent",
          borderRight: "11px solid transparent",
          borderTop: "25px solid " + gray[800],
          position: "absolute",
          '&:after': {
            content: '""',
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "24px solid " + markerColor,
            position: "absolute",
            top: -26, // Overlay onto background triangle that serves as border layer
            left: -10,
          },

        }}
      />
    </FlexContainer>
  );
};
