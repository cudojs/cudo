import * as chai from "chai";

import * as chaiAsPromised from "chai-as-promised";

import * as http from "http";

import { App, AppOptions } from "../src/app";

chai.use(chaiAsPromised);

let testAppInstances = [];

after(() => {
  testAppInstances.map((appInstance) => {
    if (appInstance.httpServer
      && appInstance.httpServer.close) {
      appInstance.httpServer.close();
    }

    if (appInstance.httpsServer
      && appInstance.httpsServer.close) {
      appInstance.httpsServer.close();
    }
  });
});

describe("App", () => {
  it("Creates an http server if `options.http` exists", () => {
    const httpPort = 8080;

    const options: AppOptions = {
      http: {
        port: httpPort
      }
    };

    const app = new App(options);

    testAppInstances.push(app);

    return chai.expect(app.httpServer).instanceof(http.Server);
  });

  it("Does not create an http server when `options.http` is missing", () => {
    const options: AppOptions = {};

    const app = new App(options);

    testAppInstances.push(app);

    return chai.expect(app.httpServer).undefined;
  });

  it("On run, makes the http server listen at a specified port if `options.http` exists", () => {
    const httpPort = 8080;

    const options: AppOptions = {
      http: {
        port: httpPort
      }
    };

    const app = new App(options);

    testAppInstances.push(app);

    app.run();

    return chai.expect(app.httpServer.address()).property("port", httpPort);
  });
});