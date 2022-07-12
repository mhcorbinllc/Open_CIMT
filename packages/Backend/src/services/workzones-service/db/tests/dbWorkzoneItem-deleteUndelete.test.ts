import {syncPromises} from "dyna-sync";
import {testDMDB} from "../../../../../tests/utils/testDMDB";

import {clearDynamicValuesForSnapshots} from "../../../../utils/clearDynamicValuesForSnapshots";

import {testWorkzones} from "./data/testWorkzones";

import {dbWorkzoneItemCreate} from "../dbWorkzoneItemCreate";
import {dbWorkzoneItemSearch} from "../dbWorkzoneItemSearch";
import {dbWorkzoneItemLoad} from "../dbWorkzoneItemLoad";
import {dbWorkzoneItemDeleteUndelete} from "../dbWorkzoneItemDeleteUndelete";
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
    await syncPromises(
      ...testWorkzones
        .map(workzone => () => dbWorkzoneItemCreate({
          dmdb,
          companyId,
          userId,
          workzone,
        })),
    );

    const loadWorkzones = await dbWorkzoneItemSearch({
      dmdb,
      companyId,
      skip: 0,
      limit: 100,
    });

    expect(loadWorkzones.length).toBe(8);

    const searchWorkzoneWoods204 = await dbWorkzoneItemSearch({
      dmdb,
      companyId,
      searchText: "Woods 204",
      skip: 0,
      limit: 100,
    });

    expect(searchWorkzoneWoods204.length).toBe(1);

    const workzoneWoods204 = searchWorkzoneWoods204[0];

    await dbWorkzoneItemDeleteUndelete({
      dmdb,
      companyId,
      userId,
      workzoneId: workzoneWoods204.workzoneId,
      operation: 'delete',
    });

    const searchForWorkzoneWoods204 = await dbWorkzoneItemSearch({
      dmdb,
      companyId,
      searchText: "Woods 204",
      skip: 0,
      limit: 100,
    });

    expect(searchForWorkzoneWoods204.length).toBe(0);

    const loadDeletedWoods204 = await dbWorkzoneItemLoad({
      dmdb,
      companyId,
      workzoneId: workzoneWoods204.workzoneId,
    });

    expect(loadDeletedWoods204).not.toBe(null);
    expect(c(loadDeletedWoods204)).toMatchSnapshot('Deleted CIM');

    const searchForWorkzoneWoods204WhereIsDeleted = await dbWorkzoneItemSearch({
      dmdb,
      companyId,
      searchText: "Woods 204",
      skip: 0,
      limit: 100,
    });

    expect(searchForWorkzoneWoods204WhereIsDeleted.length).toBe(0);

    const searchForWorkzoneWoods204AsDeleted = await dbWorkzoneItemSearch({
      dmdb,
      companyId,
      searchText: "Woods 204",
      deleted: true,
      skip: 0,
      limit: 100,
    });

    expect(searchForWorkzoneWoods204AsDeleted.length).toBe(1);

    await dbWorkzoneItemDeleteUndelete({
      dmdb,
      companyId,
      userId,
      workzoneId: workzoneWoods204.workzoneId,
      operation: 'undelete',
    });

    const searchForWorkzoneTheUndeletedWoods204 = await dbWorkzoneItemSearch({
      dmdb,
      companyId,
      searchText: "Woods 204",
      deleted: false,
      skip: 0,
      limit: 100,
    });

    expect(searchForWorkzoneTheUndeletedWoods204.length).toBe(1);
    expect(c(searchForWorkzoneTheUndeletedWoods204[0])).toMatchSnapshot('The undeleted CIM');

    const woods204History = await dbWorkzoneItemHistorySearch({
      dmdb,
      companyId,
      workzoneId: workzoneWoods204.workzoneId,
      skip: 0,
      limit: 100,
    });

    expect(woods204History.length).toBe(3);
    expect(c(woods204History)).toMatchSnapshot('History');
  });
});
