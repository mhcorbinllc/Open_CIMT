import {BrowserDb} from "mhc-ui-components/dist/BrowserDb";

const browserDbs: { [dbName: string]: BrowserDb } = {};

export const getBrowserDb = (companyId: string, userId: string): BrowserDb => {
  const dbName = [companyId, userId].join('---');
  if (browserDbs[dbName]) return browserDbs[dbName];
  return browserDbs[dbName] = new BrowserDb({
    dbName,
    collectChanges: true,
  });
};
