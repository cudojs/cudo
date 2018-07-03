import * as http from "http";

import * as https from "https";

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
      && options.http.enabled) {
      this.httpServer = http.createServer(this.handleRequest);

      this.assignedHttpServerPort = options.http.port;
    }
  }

  handleRequest(req: http.ServerRequest, res: http.ServerResponse): void {
    res.setHeader("Content-Type", "application/json");

    res.end();
  }

  run(): void {
    if (this.httpServer) {
      this.httpServer.listen(this.assignedHttpServerPort);
    }
  }
}