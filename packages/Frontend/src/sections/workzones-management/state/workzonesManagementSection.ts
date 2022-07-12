import {ICreateStoreAPI} from "dynadux";

import {IAppState} from "../../../state/interfaces";
import {EAppAction} from "../../application/state/appSection";
import {EUserAuthAction} from "../../user-authnentication/state/userAuthSection";

import {getOnline} from "../../../utils/getOnline";
import {getBrowserDb} from "../api/browserDb/db/db/getBrowserDb";
import {apiCIMsManagementOfflineImportPost} from "../api/apiCIMsManagementOfflineImportPost";

// Todo: MHC-00297 dennisat, remove debug code once Offline is fully finished
import {getBrowserDbWorkzonesOfflineUploadLogCollection} from "../api/browserDb/entities/workzoneOfflineUploadLog/getBrowserDbWorkzonesOfflineUploadLogCollection";

export interface IWorkzonesManagementSection {
  offlineUnsavedItems: number;
  uploadingOfflineItems: boolean;
}

const initialState = (): IWorkzonesManagementSection => ({
  offlineUnsavedItems: 0,
  uploadingOfflineItems: false,
});

export enum EWorkzoneManagementAction {
  START_UPLOAD_OFFLINE_CHANGES = "WZM__START_UPLOAD_OFFLINE_CHANGES",     // Payload void
  UPLOAD_OFFLINE_CHANGES = "WZM__UPLOAD_OFFLINE_CHANGES",                 // Payload void
  SET_OFFLINE_ITEMS_COUNT = "WZM__SET_OFFLINE_ITEMS_COUNT",               // Payload number
  REFRESH_OFFLINE_ITEMS_COUNTER = "WZM__REFRESH_OFFLINE_ITEMS_COUNTER",   // Payload?: IREFRESH_OFFLINE_ITEMS_COUNTER_payload
  SET_UPLOADING_OFFLINE_ITEM = "WZM__SET_UPLOADING_OFFLINE_ITEM",         // Payload boolean
}

interface IREFRESH_OFFLINE_ITEMS_COUNTER_payload {
  cbCounter: (offlineChangesCount: number) => void;
}

export const createWorkzonesManagementSection = (store: ICreateStoreAPI<IAppState>) => {
  const section = store.createSection<IWorkzonesManagementSection>({
    section: 'CIMsManagement',
    initialState: initialState(),
    reducers: {
      [EAppAction.SET_ONLINE]: ({dispatch}): void => {
        dispatch(EWorkzoneManagementAction.START_UPLOAD_OFFLINE_CHANGES);
      },
      [EUserAuthAction.SIGNED_IN]: ({dispatch}): void => {
        dispatch(EWorkzoneManagementAction.START_UPLOAD_OFFLINE_CHANGES);
      },
      [EWorkzoneManagementAction.START_UPLOAD_OFFLINE_CHANGES]: ({dispatch}): void => {
        (async () => {
          _debug_updateDebugReferences(store.state.userAuth.user.companyId, store.state.userAuth.user.userId);

          dispatch(EWorkzoneManagementAction.REFRESH_OFFLINE_ITEMS_COUNTER);

          const {
            userAuth: {
              user: {
                userId,
                companyId,
              },
            },
          } = store.state;

          (window as any)._debug_browserDb_offlineLog = "Sign in to get the _debug_browserDb_offlineLog";

          if (!userId) return;        // Exit, not signed in

          (window as any)._debug_browserDb_offlineLog = getBrowserDb(companyId, userId);

          if (!getOnline()) return;   // Exit, it is offline

          await new Promise(r => setTimeout(r, 2000));

          dispatch<void>(EWorkzoneManagementAction.UPLOAD_OFFLINE_CHANGES);
        })();
      },
      [EWorkzoneManagementAction.UPLOAD_OFFLINE_CHANGES]: ({
        dispatch, state,
      }): void => {
        if (state.uploadingOfflineItems) return;  // Exit is already uploading.
        // This could happen is the the online status switched too fast and more that one upload is going to start.

        const upload = async (): Promise<void> => {
          try {
            const {
              userAuth: {
                user: {
                  userId, companyId,
                },
              },
            } = store.state;
            if (!getOnline()) return;   // Currently not online
            if (!userId) return;        // Currently not signed in

            dispatch<boolean>(EWorkzoneManagementAction.SET_UPLOADING_OFFLINE_ITEM, true);

            const browserDb = getBrowserDb(companyId, userId);
            const offlineItems = await browserDb.getDbChangesByCount();
            const offlineItem = offlineItems[0];
            if (!offlineItem) return; // Exit. There is nothing at the moment.

            await apiCIMsManagementOfflineImportPost({
              companyId,
              userId,
              collectionName: offlineItem.collectionName as any, // Is validated on the backend anyway
              doc: offlineItem.doc,
              offlineAction: offlineItem.offlineAction,
            });

            // Delete this DB Changes from the browserDb
            await browserDb.deleteDbChanges([offlineItem.collectionChangeId]);

            dispatch<IREFRESH_OFFLINE_ITEMS_COUNTER_payload>(
              EWorkzoneManagementAction.REFRESH_OFFLINE_ITEMS_COUNTER,
              {
                cbCounter: count => {
                  if (
                    count === 0
                    && getOnline()
                    && window.confirm('Offline upload completed. Refresh now?')
                  ) {
                    window.location.reload();
                  }
                },
              },
            );

            upload(); // Try to send the next
          }
          catch (e) {
            console.warn("Action UPLOAD_OFFLINE_CHANGES: Couldn't send one. That's normal if the reason is the network layer (and not the frontend/backend).", e);
            // Try to start again after 20sec
            setTimeout(() => upload(), 20000);
          }
          finally {
            dispatch<boolean>(EWorkzoneManagementAction.SET_UPLOADING_OFFLINE_ITEM, false);
          }
        };
        upload(); // Start
      },
      [EWorkzoneManagementAction.REFRESH_OFFLINE_ITEMS_COUNTER]: ({
        dispatch, payload,
      }): void => {
        (async () => {
          const {cbCounter}: IREFRESH_OFFLINE_ITEMS_COUNTER_payload = payload || {};
          const {
            userAuth: {
              user: {
                companyId,
                userId,
              },
            },
          } = store.state;
          if (!userId) {
            dispatch<number>(EWorkzoneManagementAction.SET_OFFLINE_ITEMS_COUNT, 0);
            return;        // Exit. Currently not signed in
          }
          const browserDb = getBrowserDb(companyId, userId);
          const offlineItemsCount = await browserDb.getDbChangesCount();
          dispatch<number>(EWorkzoneManagementAction.SET_OFFLINE_ITEMS_COUNT, offlineItemsCount);
          cbCounter && cbCounter(offlineItemsCount);
        })();
      },
      [EWorkzoneManagementAction.SET_OFFLINE_ITEMS_COUNT]: ({payload}): Partial<IWorkzonesManagementSection> => {
        const offlineUnsavedItems: number = payload;
        return {offlineUnsavedItems};
      },
      [EWorkzoneManagementAction.SET_UPLOADING_OFFLINE_ITEM]: ({payload}): Partial<IWorkzonesManagementSection> => {
        const uploadingOfflineItems: boolean = payload;
        return {uploadingOfflineItems};
      },
    },
  });

  return {
    get state(): IWorkzonesManagementSection {
      return section.state;
    },
    actions: {
      refreshOfflineItemsCounter: (): void => section.dispatch(EWorkzoneManagementAction.REFRESH_OFFLINE_ITEMS_COUNTER),
      uploadOfflineChanges: (): void => section.dispatch(EWorkzoneManagementAction.START_UPLOAD_OFFLINE_CHANGES),
    },
  };
};
const _debug_updateDebugReferences = (companyId: string, userId: string): void => {
  (window as any)._debug_browserDb = getBrowserDb(companyId, userId);
  (window as any)._debug_logCollection = getBrowserDbWorkzonesOfflineUploadLogCollection(companyId, userId);
};
// _debug_logCollection.getAll().then(l => console.debug('DEBUG-OFFLINE: Offline logs', l));
// _debug_browserDb.getDbChangesByCount(999).then(unsentItems => console.debug('DEBUG-OFFLINE: Unsent items', unsentItems));
