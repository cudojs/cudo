import * as http from "http";

import * as https from "https";

import { Router } from "./router";

interface AppHttpOptions {
  enabled: boolean;

  port?: number;
}

interface AppHttpsOptions {
  enabled: boolean;

  port?: number;
}

export interface AppOptions {
  http?: AppHttpOptions;

  https?: AppHttpsOptions;
}

export class App {
  assignedHttpServerPort: number;

  assignedHttpsServerPort: number;

  httpServer: http.Server;

  httpsServer: https.Server;

  constructor(options: AppOptions) {
    if (options.http
      && options.http.enabled
      || options.https
      && options.https.enabled) {
      const router = new Router();

      const handleRequest = function (req: http.ServerRequest, res: http.ServerResponse): void {
        res.setHeader("Content-Type", "application/json");

        res.end();
      }

      if (options.http
        && options.http.enabled) {
        this.httpServer = http.createServer(handleRequest);

        this.assignedHttpServerPort = options.http.port;
      }
    }
  }

  run(): void {
    if (this.httpServer) {
      this.httpServer.listen(this.assignedHttpServerPort);
    }
  }
}