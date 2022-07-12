import {ICollectionsUpgrades} from "dyna-mongo-db";
import {syncPromises} from "dyna-sync";

import {
  IWorkzonesAppSettings,
  IItisCode,
  EWZClosureSelectionMode,
} from "../interfaces/IWorkzonesAppSettings";
import {IDBWorkzone} from "../interfaces/IDBWorkzone";
import {EWZClosureType} from "../interfaces/IWorkzone";
import {IDBWorkzoneHistory} from "../interfaces/IWorkzoneHistory";

import {mergeUpdatedDefaultItisCodes} from "./utils/mergeUpdatedDefaultItisCodes";

export const upgradeWorkzonesCollections: ICollectionsUpgrades = {
  'workzones-app-settings': {
    upgrades: [
      {
        version: 0,
        title: 'Creation of collection',
        method: async ({
          collectionName, db,
        }) => {
          await db.createCollection<IWorkzonesAppSettings>(collectionName);
        },
      },
      {
        version: 1,
        title: 'Creation index for deviceId',
        method: async ({
          collectionName, db,
        }) => {
          await db
            .collection<IWorkzonesAppSettings>(collectionName)
            .createIndex(
              {deviceId: 1},
              {
                unique: true,
                name: 'Index deviceId',
              },
            );
        },
      },
      {
        version: 11,
        title: 'Creation itis codes',
        method: async ({
          collectionName, db,
        }) => {
          const collection = db.collection<IWorkzonesAppSettings>(collectionName);
          const newItisCodes = [
            {
              code: 769,
              label: 'Closed to traffic',
            },
            {
              code: 771,
              label: 'Closed ahead',
            },
            {
              code: 7451,
              label: 'Merge',
            },
            {
              code: 8195,
              label: 'Left lane',
            },
            {
              code: 8196,
              label: 'Right lane',
            },
            {
              code: 8208,
              label: 'Right shoulder',
            },
            {
              code: 8209,
              label: 'Left shoulder',
            },
            {
              code: 12545,
              label: 'One',
            },
            {
              code: 12546,
              label: 'Two',
            },
            {
              code: 12547,
              label: 'Three',
            },
            {
              code: 12548,
              label: 'Four',
            },
            {
              code: 12549,
              label: 'Five',
            },
            {
              code: 13579,
              label: 'Right',
            },
            {
              code: 13580,
              label: 'Left',
            },
          ];

          const appsSettings = await collection.find().toArray();

          await syncPromises(
            ...appsSettings.map(appSettings => {

              const applyItisCodes: IItisCode[] = appSettings.itisCodes.concat();
              newItisCodes.forEach(({
                code, label,
              }) => {
                const current = applyItisCodes.find(existedItisCode => existedItisCode.code === code);
                applyItisCodes.push({
                  code,
                  label: current?.label || label,
                });
              });

              return async () => {
                await collection.updateOne(
                  {deviceId: appSettings.deviceId},
                  {$set: {itisCodes: applyItisCodes}},
                );
              };

            }),
          );
        },
      },
      {
        version: 12,
        title: 'Update the default closureSelectionMode',
        method: async ({
          collectionName, db,
        }) => {
          const collection = db.collection<IWorkzonesAppSettings>(collectionName);
          const appsSettings = await collection.find().toArray();

          await syncPromises(
            ...appsSettings.map(appSettings => {

              if (appSettings.closureSelectionMode !== undefined) return () => Promise.resolve();

              return async () => {
                await collection.updateOne(
                  {deviceId: appSettings.deviceId},
                  {$set: {closureSelectionMode: EWZClosureSelectionMode.CUSTOM}},
                );
              };

            }),
          );
        },
      },
      {
        version: 21,
        title: 'Update the itis codes to match new defaults list',
        method: async ({
          collectionName, db,
        }) => {
          await mergeUpdatedDefaultItisCodes({
            db,
            collectionName,
          });
        },
      },
      {
        version: 22,
        title: 'Update the itis codes to match new defaults list with right and left curve',
        method: async ({
          collectionName, db,
        }) => {
          await mergeUpdatedDefaultItisCodes({
            db,
            collectionName,
          });
        },
      },
      {
        version: 23,
        title: 'Update the itis codes to match new defaults list with height limit preset',
        method: async ({
          collectionName, db,
        }) => {
          await mergeUpdatedDefaultItisCodes({
            db,
            collectionName,
          });
        },
      },
      {
        version: 24,
        title: 'Change the serviceChannel to string',
        method: async ({
          collectionName, db,
        }) => {
          const collection = db.collection<IWorkzonesAppSettings>(collectionName);
          const appsSettings = await collection.find().toArray();

          await syncPromises(
            ...appsSettings.map(appSettings => {

              return async () => {
                await collection.updateOne(
                  {deviceId: appSettings.deviceId},
                  {$set: {serviceChannel: appSettings.serviceChannel.toString()}},
                );
              };

            }),
          );
        },
      },
      {
        version: 25,
        title: 'Remove the unused messageType property',
        method: async ({
          collectionName, db,
        }) => {
          const collection = db.collection<IWorkzonesAppSettings>(collectionName);
          const appsSettings = await collection.find().toArray();

          await syncPromises(
            ...appsSettings.map(appSettings => {

              return async () => {
                await collection.updateOne(
                  {deviceId: appSettings.deviceId},
                  {$unset: {messageType: ""}},
                );
              };

            }),
          );
        },
      },
    ],
  },

  'workzones-items': {
    upgrades: [
      {
        version: 0,
        title: 'Creation of collection',
        method: async ({
          collectionName, db,
        }) => {
          await db.createCollection<IDBWorkzone>(collectionName);
        },
      },
      {
        version: 1,
        title: 'Creation index workzoneId',
        method: async ({
          collectionName, db,
        }) => {
          await db
            .collection<IDBWorkzone>(collectionName)
            .createIndex(
              {workzoneId: 1},
              {
                unique: true,
                name: 'Index workzoneId',
              },
            );
        },
      },
      {
        version: 2,
        title: 'Creation index for dbSearchText',
        method: async ({
          collectionName, db,
        }) => {
          await db
            .collection<IDBWorkzone>(collectionName)
            .createIndex(
              {dbSearchText: 1},
              {name: 'Index dbSearchText'},
            );
        },
      },
      {
        version: 10,
        title: 'Update the default closureType',
        method: async ({
          collectionName, db,
        }) => {
          const collection = db.collection<IDBWorkzone>(collectionName);
          const workzones = await collection.find({}).toArray();

          await syncPromises(
            ...workzones.map(workzone => {
              if (workzone.closureType !== undefined) return () => Promise.resolve();

              return async () => {
                await collection.updateOne(
                  {workzoneId: workzone.workzoneId},
                  {$set: {closureType: EWZClosureType.NONE}},
                );
              };
            }),
          );
        },
      },
      {
        version: 15,
        title: 'Update the default closureSelectionMode',
        method: async ({
          collectionName, db,
        }) => {
          const collection = db.collection<IDBWorkzone>(collectionName);
          const workzones = await collection.find({}).toArray();

          await syncPromises(
            ...workzones.map(workzone => {
              if (workzone.closureSelectionMode !== undefined) return () => Promise.resolve();

              return async () => {
                await collection.updateOne(
                  {workzoneId: workzone.workzoneId},
                  {$set: {closureSelectionMode: EWZClosureSelectionMode.CUSTOM}},
                );
              };
            }),
          );
        },
      },
      {
        version: 16,
        title: 'Creation index for createdAt',
        method: async ({
          collectionName, db,
        }) => {
          await db
            .collection<IDBWorkzone>(collectionName)
            .createIndex(
              {createdAt: 1},
              {name: 'Index createdAt'},
            );
        },
      },
      {
        version: 18,
        title: 'Add default Heading',
        method: async ({
          collectionName, db,
        }) => {
          const collection = db.collection<IDBWorkzone>(collectionName);
          const workzones = await collection.find({}).toArray();

          await syncPromises(
            ...workzones.map(workzone => {
              if (workzone.heading !== undefined) return () => Promise.resolve();

              return async () => {
                await collection.updateOne(
                  {workzoneId: workzone.workzoneId},
                  {$set: {heading: []}},
                );
              };
            }),
          );
        },
      },

      {
        version: 19,
        title: 'Update the forever nre field',
        method: async ({
          collectionName, db,
        }) => {
          const collection = db.collection<IDBWorkzone>(collectionName);
          const workzones = await collection.find({}).toArray();

          await syncPromises(
            ...workzones.map(workzone => {
              return async () => {
                await collection.updateOne(
                  {workzoneId: workzone.workzoneId},
                  {$set: {forEver: false}},
                );
              };
            }),
          );
        },
      },

      {
        version: 20,
        title: 'Creation index for Forever field',
        method: async ({
          collectionName, db,
        }) => {
          await db
            .collection<IDBWorkzone>(collectionName)
            .createIndex(
              {forEver: 1},
              {name: 'Index For Ever'},
            );
        },
      },

      {
        version: 21,
        title: 'Creation index for itis codes',
        method: async ({
          collectionName, db,
        }) => {
          await db
            .collection<IDBWorkzone>(collectionName)
            .createIndex(
              {itisCodes: 1},
              {name: 'Index itisCodes'},
            );
        },
      },

      // Dev note: Do you change the schema of the IWorkzone?
      //           You have to upgrade the saved history items of the IDBWorkzoneHistory!

    ],
  },

  'workzones-items-history': {
    upgrades: [
      {
        version: 0,
        title: 'Creation of collection',
        method: async ({
          collectionName, db,
        }) => {
          await db.createCollection<IDBWorkzoneHistory>(collectionName);
        },
      },
      {
        version: 1,
        title: 'Creation index date/workzoneId/dbSearchText',
        method: async ({
          collectionName, db,
        }) => {
          await db
            .collection<IDBWorkzoneHistory>(collectionName)
            .createIndex(
              {
                date: 1,
                "workzone.workzoneId": 1,
                dbSearchText: 1,
              },
              {name: 'Index date/workzoneId/dbSearchText'},
            );
        },
      },
      {
        version: 10,
        title: 'Update forEver',
        method: async ({
          collectionName, db,
        }) => {
          const collection = db.collection<IDBWorkzoneHistory>(collectionName);

          await collection.updateMany(
            {},
            {$set: {"workzone.forEver": false}},
          );
        },
      },
    ],
  },
};
