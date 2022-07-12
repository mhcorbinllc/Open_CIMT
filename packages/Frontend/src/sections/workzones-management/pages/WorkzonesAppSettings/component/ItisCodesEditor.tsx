import {
  IItisCode,
  IValidationErrorItisRemoveBlockedByWorkzone,
} from "mhc-server";

import {Box} from "mhc-ui-components/dist/Box";
import {
  LabelContainer,
  ELabelContainerVariant,
} from "mhc-ui-components/dist/LabelContainer";
import {EViewMode} from "mhc-ui-components/dist/useForm";
import {
  Button,
  EButtonVariant,
} from "mhc-ui-components/dist/Button";
import {HelperText} from "mhc-ui-components/dist/HelperText";
import {RouterLink} from "mhc-ui-components/dist/RouterLink";

import {ItisCodeItem} from "./components/ItisCodeItem";
import {routeWorkZonesEditPaths} from "../../../routes/routeWorkzoneEdit.paths";

import {useTheme} from "mhc-ui-components/dist/ThemeProvider";
import AddIcon from "@mui/icons-material/AddCircleOutlineOutlined";

export interface IItisCodesEditorProps {
  viewMode: EViewMode;
  itisCodes: IItisCode[];
  validationError: {
    mainError?: string;
    removeErrorsByWorkzones?: IValidationErrorItisRemoveBlockedByWorkzone[];
  };
  onChange: (itisCodes: IItisCode[]) => void;
}

export const ItisCodesEditor = (props: IItisCodesEditorProps): JSX.Element => {
  const theme = useTheme();
  const {
    viewMode,
    itisCodes,
    validationError: {
      mainError = "",
      removeErrorsByWorkzones = [],
    },
    onChange,
  } = props;

  const readOnly = viewMode === EViewMode.VIEW;

  const renderItisValidationErrors = (): JSX.Element => (
    <HelperText error>
      {mainError
        .split("\n")
        .map((message, index) => (
          <div key={index}>{message}</div>
        ))
      }
      {removeErrorsByWorkzones
        .slice(0, 5)
        .map((blocked: IValidationErrorItisRemoveBlockedByWorkzone, index: number) => {
          const {
            workzone: {
              workzoneId,
              name,
            },
            removedItisCodes,
          } = blocked;
          const editHref = routeWorkZonesEditPaths.getRoutePath({workzoneId});
          return (
            <Box
              key={index}
              sx={{"& > a": {color: theme.palette.text.secondary}}}
            >
              {`${name} uses ${removedItisCodes.length > 1 ? "ITIS codes" : "ITIS code"} ${removedItisCodes.join(", ")} `}
              <RouterLink to={editHref}>Edit</RouterLink>
            </Box>
          );
        })
        .concat(removeErrorsByWorkzones.length > 5 ? [<div>...and more</div>] : [])
      }
    </HelperText>
  );

  const handleItisCodeChange = (index: number, itisCode: IItisCode): void => {
    onChange(itisCodes.map((scanItisCode, scanIndex) => {
      if (index === scanIndex) return itisCode;
      return scanItisCode;
    }));
  };

  const handleItisCodeDelete = (index: number): void => {
    onChange(itisCodes.filter((scanItisCode, scanIndex) => {
      scanItisCode; // 4TS
      return scanIndex !== index;
    }));
  };

  const handleItisCodeAdd = (): void => {
    onChange(itisCodes.concat({
      code: 0,
      label: "",
    }));
  };

  return (
    <LabelContainer
      dataComponentName="ItisCodesEditor"
      sx={{
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
      }}
      label="ITIS codes"
      ariaLabel="ITIS codes"
      variant={ELabelContainerVariant.OUTLINED}
    >

      {itisCodes.map((itisCode, index) => (
        <ItisCodeItem
          key={index}
          viewMode={viewMode}
          itisCode={itisCode}
          onChange={itisCode => handleItisCodeChange(index, itisCode)}
          onDelete={() => handleItisCodeDelete(index)}
        />
      ))}

      <Button
        variant={EButtonVariant.OUTLINED}
        disabled={readOnly}
        icon={<AddIcon/>}
        onClick={handleItisCodeAdd}
      />

      {renderItisValidationErrors()}

    </LabelContainer>
  );
};
