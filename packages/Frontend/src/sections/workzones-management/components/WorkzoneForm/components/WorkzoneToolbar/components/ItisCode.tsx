import {IItisCode} from "mhc-server";

import {Box} from "mhc-ui-components/dist/Box";

import {useTheme} from "mhc-ui-components/dist/ThemeProvider";

export interface IItisCodeProps {
  itisCode: number;
  itisCodes: IItisCode[];
}

export const ItisCode = (props: IItisCodeProps): JSX.Element | null => {
  const {
    itisCode,
    itisCodes,
  } = props;
  const theme = useTheme();

  const itisCodeInfo = itisCodes.find(ic => ic.code === itisCode);
  if (!itisCodeInfo) return null; // Hide the ITIS codes that doesn't exist!

  return (
    <Box
      inline
      sx={{
        whiteSpace: "nowrap",
        color: theme.palette.common.white,
        backgroundColor: '#00579d',
        borderRadius: 14,
        paddingRight: 1,
        marginRight: 1,
        marginBottom: 0.5,
      }}
    >
      <span
        style={{
          backgroundColor: '#1976d2',
          borderRadius: 14,
          paddingLeft: 4,
          paddingRight: 4,
          marginRight: 4,
        }}
      >
        {itisCodeInfo.code}
      </span>
      <span>{itisCodeInfo.label}</span>
    </Box>
  );
};
