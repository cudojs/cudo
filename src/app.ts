import * as http from "http";

import * as https from "https";

import * as url from "url";

import { Router, Route } from "./router";

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

  protected handleRequest: (req: http.IncomingMessage, res: http.ServerResponse) => void;

  constructor(options: AppOptions) {
    if (options.http
      && options.http.enabled
      || options.https
      && options.https.enabled) {
      const router = new Router();

      this.router = router;

      this.handleRequest = function (req, res) {
        res.setHeader("Content-Type", "application/json");

        let requestUrl = url.parse(req.url);

        let route: Route<any>;

        try {
          route = router.match(req.method.toLowerCase(), requestUrl.pathname);
        }
        catch (ex) {
          res.statusCode = ex.httpStatusCode;
        }

        // TODO: Return 501 Not implemented if handler is not set.

        res.end();
      }

      if (options.http
        && options.http.enabled) {
        this.httpServer = http.createServer(this.handleRequest);

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