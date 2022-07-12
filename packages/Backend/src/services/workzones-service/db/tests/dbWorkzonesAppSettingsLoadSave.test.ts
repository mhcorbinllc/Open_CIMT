import {testDMDB} from "../../../../../tests/utils/testDMDB";
import {dbWorkzonesAppSettingsSave} from "../dbWorkzonesAppSettingsSave";
import {EWZTXMode} from "../../interfaces/IWorkzonesAppSettings";
import {dbWorkzonesAppSettingsLoad} from "../dbWorkzonesAppSettingsLoad";
import {clearDynamicValuesForSnapshots} from "../../../../utils/clearDynamicValuesForSnapshots";

describe('CIMT - App Settings', () => {
  const companyId = 'test-company--test-85739524';

  const c = (data: any): any => clearDynamicValuesForSnapshots(data);

  const dmdb = testDMDB;
  const clearDb = async () => {
    try {
      await dmdb.dropCollection([companyId, 'workzones-app-settings'].join('---'));
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

  test('Load default', async () => {
    const settings = await dbWorkzonesAppSettingsLoad(dmdb, companyId);
    expect(c(settings)).toMatchSnapshot();
  });

  test('Load default, edit, save load 1', async () => {
    const workzoneAppSettings = await dbWorkzonesAppSettingsLoad(dmdb, companyId);
    workzoneAppSettings.itisCodes.push({
      code: 13,
      label: 'Fab',
    });
    await dbWorkzonesAppSettingsSave({
      dmdb,
      companyId,
      workzoneAppSettings,
    });
    const loadedSettings = await dbWorkzonesAppSettingsLoad(dmdb, companyId);
    expect(c(loadedSettings)).toMatchSnapshot();
  });

  test('Load default, edit, save load 2', async () => {
    const settings = await dbWorkzonesAppSettingsLoad(dmdb, companyId);
    await dbWorkzonesAppSettingsSave({
      dmdb,
      companyId,
      workzoneAppSettings: {
        ...settings,
        serviceChannel: "200",
        psid: 'PSID-2423',
        txmode: EWZTXMode.CONT,
        intervalInMs: 1200,
        priority: 12,
        useSignature: true,
        useEncryption: true,
        itisCodes: [
          ...settings.itisCodes,
          {
            code: 14,
            label: 'Conform',
          },
        ],
      },
    });
    const loadedSettings = await dbWorkzonesAppSettingsLoad(dmdb, companyId);
    expect(c(loadedSettings)).toMatchSnapshot();
  });
});
