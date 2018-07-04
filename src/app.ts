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
  private assignedHttpServerPort: number;

  private assignedHttpsServerPort: number;

  public httpServer: http.Server;

  public httpsServer: https.Server;

  public router: Router;

  constructor(options: AppOptions) {
    if (options.http
      && options.http.enabled
      || options.https
      && options.https.enabled) {
      const router = new Router();

      this.router = router;

      const handleRequest = function (req: http.ServerRequest, res: http.ServerResponse): void {
        res.setHeader("Content-Type", "application/json");

        res.end();
      }

      if (options.http
        && options.http.enabled) {
        this.httpServer = http.createServer(handleRequest);

        this.assignedHttpServerPort = options.http.port;

        Object.freeze(this.assignedHttpServerPort);
      }
    }
  }

  public run(): void {
    if (this.httpServer) {
      this.httpServer.listen(this.assignedHttpServerPort);
    }
  }
}