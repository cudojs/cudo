import * as http from "http";

import * as https from "https";

interface AppHttpOptions {
  port: number;
}

interface AppHttpsOptions {
  port: number;
}

export interface AppOptions {
  http?: AppHttpOptions;

  https?: AppHttpsOptions;
}

export class App {
  httpServer: http.Server;

  httpServerPort: number;

  httpsServer: https.Server;

  httpsServerPort: number;

  constructor(options: AppOptions) {
    if (options.http) {
      this.httpServer = http.createServer();

      this.httpServerPort = options.http.port;
    }
  }

  run() {
    if (this.httpServer
      && this.httpServerPort) {
      this.httpServer.listen(this.httpServerPort);
    }
  }
}