/* eslint-disable @typescript-eslint/no-empty-function */
import * as express from "express";

import {IService} from "../IService";

import {upgradeWorkzonesCollections} from "./db/upgradeWorkzonesCollections";

import {dmdb} from "../../db/getDBs";

import {addEndpoints} from "./endpoints";

export interface IWorkzonesServiceConfig {
  expressApp: express.Application;
}

export class WorkzonesService implements IService {
  constructor(private readonly config: IWorkzonesServiceConfig) {
  }

  public serviceName = 'UserAuthentication';

  public async init(): Promise<void> {
    const {expressApp} = this.config;

    dmdb.addCollectionsUpgrades(upgradeWorkzonesCollections);

    addEndpoints({expressApp});
  }

  public async start(): Promise<void> {
  }

  public async stop(): Promise<void> {
  }
}
