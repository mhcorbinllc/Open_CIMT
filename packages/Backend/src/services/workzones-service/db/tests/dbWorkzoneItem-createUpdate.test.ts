import {testDMDB} from "../../../../../tests/utils/testDMDB";

import {clearDynamicValuesForSnapshots} from "../../../../utils/clearDynamicValuesForSnapshots";

import {
  IWorkzone,
  getDefaultWorkzone,
} from "../../client";

import {dbWorkzoneItemCreate} from "../dbWorkzoneItemCreate";
import {dbWorkzoneItemSearch} from "../dbWorkzoneItemSearch";
import {dbWorkzoneItemUpdate} from "../dbWorkzoneItemUpdate";
import {dbWorkzoneItemLoad} from "../dbWorkzoneItemLoad";
import {dbWorkzoneItemHistorySearch} from "../dbWorkzoneItemHistorySearch";

describe('CIM Items - Create Update', () => {
  const companyId = 'test-company--test-480246';
  const userId = 'test-user-id-23242';

  const c = (data: any): any => clearDynamicValuesForSnapshots(data, 'workzoneId'.split(','));

  const dmdb = testDMDB;
  const clearDb = async () => {
    try {
      await dmdb.dropCollection([companyId, 'workzones-items'].join('---'));
      await dmdb.dropCollection([companyId, 'workzones-items-history'].join('---'));
    }
    catch (e) {
      console.error('clearDb error:', e);
    }
  };

  beforeAll(async () => {
    await clearDb();
  });
  afterAll(async () => {
    await clearDb();
    await dmdb.disconnect();
  });

  test('Create Update Check CIM item the history', async () => {
    const workzone: IWorkzone = {
      ...getDefaultWorkzone(),
      name: 'Demo CIM Hutton street',
      start: new Date("2017-12-25T21:56:22Z"),
      end: new Date("2017-12-31T22:00:00Z"),
      notes: "Should be ready on new year's eve!",
    };

    const workzoneId = await dbWorkzoneItemCreate({
      dmdb,
      companyId,
      userId,
      workzone,
    });

    expect(!!workzoneId).toBe(true);

    const searchWorkzones = await dbWorkzoneItemSearch({
      dmdb,
      companyId,
      searchText: 'new year eve',
      skip: 0,
      limit: 100,
    });

    expect(searchWorkzones.length).toBe(1);
    expect(c(searchWorkzones)).toMatchSnapshot('Search CIMs');

    if (!searchWorkzones.length) return; // Exit, will fail anyway!

    const updateWorkzone = searchWorkzones[0];
    updateWorkzone.notes += '\nAlmost done';
    updateWorkzone.point.lat = 32.2411;
    updateWorkzone.point.lng = 14.1244;

    await dbWorkzoneItemUpdate({
      dmdb,
      companyId,
      userId,
      workzone: updateWorkzone,
    });

    const loadedWorkzone = await dbWorkzoneItemLoad({
      dmdb,
      companyId,
      workzoneId: updateWorkzone.workzoneId,
    });

    expect(loadedWorkzone).not.toBe(null);
    expect(c(loadedWorkzone)).toMatchSnapshot('Load updated CIM');
    if (loadedWorkzone) expect(loadedWorkzone.workzoneId).toBe(updateWorkzone.workzoneId);

    const history = await dbWorkzoneItemHistorySearch({
      dmdb,
      companyId,
      workzoneId: updateWorkzone.workzoneId,
      skip: 0,
      limit: 100,
    });

    expect(history.length).toBe(2);
    expect(history.map(c)).toMatchSnapshot('History');
  });

});
