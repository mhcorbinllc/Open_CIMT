import {
  useState,
  createRef,
} from "react";
import {connect} from "react-dynadux";
import {dynaSwitch} from "dyna-switch";

import {
  FlexContainerVertical,
  FlexItemMin,
  FlexItemMax,
} from "mhc-ui-components/dist/FlexContainer";
import {
  Alert,
  EAlertType,
} from "mhc-ui-components/dist/Alert";
import {
  Button,
  EButtonSize,
  EButtonColor,
  EButtonVariant,
} from "mhc-ui-components/dist/Button";
import {ButtonBar} from "mhc-ui-components/dist/ButtonBar";
import {InputSwitch} from "mhc-ui-components/dist/InputSwitch";
import {FormatDate} from "mhc-ui-components/dist/FormatDate";
import {EColumnAlign} from "mhc-ui-components/dist/Table";
import {
  TableLoadMore,
  ITableLoadMoreRef,
  TTableLoadMoreHandlerLoad,
} from "mhc-ui-components/dist/TableLoadMore";
import {
  ETableFilterValueType,
  ETableFilterComparison,
} from "mhc-ui-components/dist/TableLoadMore";
import {EBreakpointDevice} from "mhc-ui-components/dist/uiInterfaces";

import {
  IWorkzone,
  EWorkZonesManagementRights,
} from "mhc-server";

import {IAppStore} from "../../../../state/IAppStore";

import {routeWorkZonesEditPaths} from "../../routes/routeWorkzoneEdit.paths";
import {routeWorkzoneCreate} from "../../routes/routeWorkzoneCreate";

import {OfflineInfo} from "../../components/OfflineInfo/OfflineInfo";
import {
  IOfflineInfo,
  IDataWithOfflineInfo,
  EOfflineStatus,
} from "../../api/interfaces";
import {apiWorkzonesItemSearchGet} from "../../api/apiWorkzonesItemSearchGet";
import {apiWorkzoneItemDelete} from "../../api/apiWorkzoneItemDelete";
import {apiWorkzoneItemUndelete} from "../../api/apiWorkzoneItemUndelete";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import UndeleteIcon from "@mui/icons-material/RestoreFromTrashOutlined";

export interface IWorkzonesListPageProps {
  store: IAppStore;
  search: string;
}

export const WorkzonesListPage = connect((props: IWorkzonesListPageProps): JSX.Element => {
  const {
    store: {
      userAuth: {
        state: {
          user: {
            userId,
            companyId,
          },
        },
        utils: {
          userHasAllRights,
          userHasAnyOfRights,
        },
      },
      app: {
        state: {online},
        actions: {navigateTo},
      },
    },
  } = props;

  const [offlineInfo, setOfflineInfo] = useState<IOfflineInfo>({
    status: EOfflineStatus.ACTUAL_VERSION,
    userMessage: '',
  });

  const refTable = createRef<ITableLoadMoreRef<IDataWithOfflineInfo<IWorkzone>>>();

  const handleTableLoad: TTableLoadMoreHandlerLoad<IDataWithOfflineInfo<IWorkzone>> = async (
    {
      filters,
      sort: {
        fieldName: sortByFieldName,
        direction: sortDirection,
      },
      pagination: {
        skip,
        limit,
      },
    },
  ) => {
    let search: string = '';
    let deleted: boolean = false;
    let forEver: boolean | 'both' = 'both';

    filters.forEach(filter => {
      if (filter.filterName === 'filter--searchBar') search = filter.value;
      if (filter.filterName === 'filter--deleted') deleted = filter.value;
      if (filter.filterName === 'filter--forEver') {
        forEver =
        dynaSwitch<boolean | 'both', string>(
          filter.value,
          'both',
          {
            "both": 'both',
            "forever": true,
            "non-forever": false,
          },
        );
      }
    });

    const result = await apiWorkzonesItemSearchGet({
      companyId,
      userId,
      search,
      forEver,
      deleted,
      skip,
      limit,
      sortByFieldName: sortByFieldName.split('.')[1] || '', // Remove the "data." property name. This is because the item is IDataWithOfflineInfo<IWorkzone>
      sortDirection,
    });

    setOfflineInfo(result.offlineInfo);

    return result.data;
  };

  const userCanAccess  = userHasAnyOfRights([
    EWorkZonesManagementRights.WORKZONES_VIEW,
    EWorkZonesManagementRights.WORKZONES_EDIT,
  ]);

  const userCanModify = userHasAllRights([EWorkZonesManagementRights.WORKZONES_EDIT]);

  const handleWorkZoneClick = ({data: {workzoneId}}: IDataWithOfflineInfo<IWorkzone>): void => {
    navigateTo({url: routeWorkZonesEditPaths.getRoutePath({workzoneId})});
  };

  const handleAddWorkZoneClick = (): void => navigateTo({url: routeWorkzoneCreate.getRoutePath()});

  const handleDeleteWorkzoneClick = async (event: any, workzoneId: string): Promise<void> => {
    event.stopPropagation();
    const result = await apiWorkzoneItemDelete(companyId, userId, workzoneId);
    if (result) {
      const current = refTable.current!.getItems();
      refTable.current!.setItems(current.filter(item => item.data.workzoneId !== result.data.workzoneId));
    }
  };

  const handleUndeleteWorkzoneClick = async (event: any, workzoneId: string): Promise<void> => {
    event.stopPropagation();
    const result = await apiWorkzoneItemUndelete(companyId, userId, workzoneId);
    if (result) {
      const current = refTable.current!.getItems();
      refTable.current!.setItems(current.filter(item => item.data.workzoneId !== result.data.workzoneId));
    }
  };

  return (
    <FlexContainerVertical
      fullHeight
      sx={{
        margin: "auto",
        maxWidth: 1000,
      }}
    >

      <FlexItemMin>
        <ButtonBar>
          <Button
            size={EButtonSize.LARGE}
            icon={<AddCircleIcon/>}
            hidden={!userCanModify}
            onClick={handleAddWorkZoneClick}
          >Create CIM</Button>
        </ButtonBar>
        <Alert
          show={offlineInfo.status !== EOfflineStatus.ACTUAL_VERSION}
          title="Offline warning"
          type={EAlertType.WARNING}
        >
          {offlineInfo.userMessage}
        </Alert>
      </FlexItemMin>

      <FlexItemMax overFlowY>

        <TableLoadMore
          ref={refTable}
          ariaLabel="CIMs list"
          loadItemsCount={20}
          columns={[
            {
              fieldName: 'data.active',
              headerLabel: 'Active',
              sortable: true,
              cellRender: active => <InputSwitch ariaLabel="Active" value={active}/>,
            },
            {
              fieldName: 'data.name',
              headerLabel: 'Name',
              sortable: true,
              cellRender: (name, {offlineInfo}: IDataWithOfflineInfo<IWorkzone>) =>
                <span>
                  {name}
                  <OfflineInfo
                    offlineInfo={offlineInfo}
                    showOnlineActual={!online}
                  />
                </span>,
            },
            {
              fieldName: 'data.updatedAt',
              headerLabel: 'Updated',
              sortable: true,
              cellRender: (updatedAt) => (
                <FormatDate date={updatedAt}/>
              ),
            },
            {
              fieldName: 'data.custom--startEnd',
              headerLabel: 'Start/End',
              sortable: false,
              align: EColumnAlign.LEFT,
              breakpoints: ["allExclude", EBreakpointDevice.MOBILE],
              cellRender: (v: undefined, {data: workzone}: IDataWithOfflineInfo<IWorkzone>): JSX.Element => {
                v; // 4TS
                return (
                  <>
                    <FormatDate date={workzone.start}/><br/>
                    {workzone.forEver
                      ? 'Forever'
                      : <FormatDate date={workzone.end}/>
                    }
                  </>
                );
              },
            },
            {
              fieldName: 'data.workzoneId',
              headerLabel: 'Delete/Undelete',
              align: EColumnAlign.CENTER,
              breakpoints: ["allExclude", EBreakpointDevice.MOBILE],
              hidden: !userCanModify,
              cellRender: (v: undefined, {
                data: {
                  workzoneId, deletedAt,
                },
              }): JSX.Element => {
                v;
                return (
                  !deletedAt
                    ? (
                      <Button
                        key={workzoneId}
                        variant={EButtonVariant.OUTLINED}
                        icon={<DeleteIcon/>}
                        size={EButtonSize.SMALL}
                        color={EButtonColor.ERROR}
                        hidden={!userCanModify}
                        onClick={e => handleDeleteWorkzoneClick(e, workzoneId)}
                      >
                        Delete
                      </Button>
                    )
                    : (
                      <Button
                        key={workzoneId}
                        variant={EButtonVariant.OUTLINED}
                        icon={<UndeleteIcon/>}
                        size={EButtonSize.SMALL}
                        color={EButtonColor.WHITE}
                        hidden={!userCanModify}
                        onClick={e => handleUndeleteWorkzoneClick(e, workzoneId)}
                      >
                        Undelete
                      </Button>
                    )
                );
              },
            },
          ]}
          filters={[
            {
              filterName: 'filter--searchBar',
              label: 'Search',
              type: ETableFilterValueType.TEXT,
              comparison: ETableFilterComparison.CONTAINS,
              value: '',
            },
            {
              filterName: 'filter--forEver',
              label: 'Start / End',
              options: [
                {
                  label: 'All',
                  value: 'both',
                },
                {
                  label: 'Unlimited duration',
                  value: 'forever',
                },
                {
                  label: 'Limited duration',
                  value: 'non-forever',
                },
              ],
              type: ETableFilterValueType.OPTION,
              comparison: ETableFilterComparison.EQUAL,
              value: false,
            },
            {
              filterName: 'filter--deleted',
              label: 'Show deleted only',
              type: ETableFilterValueType.BOOLEAN,
              comparison: ETableFilterComparison.EQUAL,
              value: false,
            },
          ]}
          sort={{
            fieldName: '',
            direction: 0,
          }}
          onLoad={handleTableLoad}
          onRowClick={userCanAccess ? handleWorkZoneClick : undefined}
        />
      </FlexItemMax>

    </FlexContainerVertical>
  );
});
