import * as chai from "chai";

import * as chaiAsPromised from "chai-as-promised";

import * as http from "http";

import * as requestPromiseNative from "request-promise-native";

import { AddressInfo } from "net";

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
  it("if no options are specified, on run, passes without errors", () => {
    const app = new App({});

    testAppInstances.push(app);

    return chai.expect(app.run()).undefined;
  });

  it("if http options are missing, does not create an http server", () => {
    const app = new App({});

    testAppInstances.push(app);

    return chai.expect(app.httpServer).undefined;
  });

  it("if http is not enabled, does not create an http server", () => {
    const options: AppOptions = {
      http: {
        enabled: false
      }
    };

    const app = new App(options);

    testAppInstances.push(app);

    return chai.expect(app.httpServer).undefined;
  });

  it("if http is enabled, creates an http server", () => {
    const options: AppOptions = {
      http: {
        enabled: true
      }
    };

    const app = new App(options);

    testAppInstances.push(app);

    return chai.expect(app.httpServer).instanceof(http.Server);
  });

  it("if http is enabled, on run, triggers the server listening on a random available port", () => {
    const options: AppOptions = {
      http: {
        enabled: true
      }
    };

    const app = new App(options);

    testAppInstances.push(app);

    app.run();

    return chai.expect(app.httpServer.address()).has.property("port");
  });

  it("if http is enabled and a port is specified, on run, triggers the server listening on that port", () => {
    const httpPort = 22880;

    const options: AppOptions = {
      http: {
        enabled: true,
        port: httpPort
      }
    };

    const app = new App(options);

    testAppInstances.push(app);

    app.run();

    return chai.expect(app.httpServer.address()).property("port", httpPort);
  });

  it("if http is enabled, while running, responds to incoming http requests", () => {
    const options: AppOptions = {
      http: {
        enabled: true
      }
    };

    const app = new App(options);

    testAppInstances.push(app);

    app.run();

    let address = <AddressInfo>app.httpServer.address();

    return chai.expect(requestPromiseNative("http://localhost:" + address.port)).eventually.fulfilled;
  });
});