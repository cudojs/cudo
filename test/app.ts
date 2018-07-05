import * as chai from "chai";

import * as chaiAsPromised from "chai-as-promised";

import * as http from "http";

import { Socket } from "net";

import { App, AppOptions } from "../src/app";

import { Methods, Route } from "../src/router";

chai.use(chaiAsPromised);

let testRunningAppInstances = [];

after(() => {
  // Close collected test app instances, so the process can exit.
  testRunningAppInstances.map((appInstance) => {
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
  it("if http options are missing, does not create an http server", () => {
    const app = new App({});

    return chai.expect(app.httpServer).undefined;
  });

  it("if http is not enabled, does not create an http server", () => {
    const options: AppOptions = {
      http: {
        enabled: false
      }
    };

    const app = new App(options);

    return chai.expect(app.httpServer).undefined;
  });

  it("if http is enabled, creates an http server", () => {
    const options: AppOptions = {
      http: {
        enabled: true
      }
    };

    const app = new App(options);

    return chai.expect(app.httpServer).instanceof(http.Server);
  });

  it("on run, if no options are specified, passes without errors", () => {
    const app = new App({});

    testRunningAppInstances.push(app);

    return chai.expect(app.run()).undefined;
  });

  it("on run, if http is enabled, triggers the server listening on a random available port", () => {
    const options: AppOptions = {
      http: {
        enabled: true
      }
    };

    const app = new App(options);

    testRunningAppInstances.push(app);

    app.run();

    return chai.expect(app.httpServer.address()).has.property("port");
  });

  it("on run, if http is enabled and a port is specified, triggers the server listening on that port", () => {
    const httpPort = 22880;

    const options: AppOptions = {
      http: {
        enabled: true,
        port: httpPort
      }
    };

    const app = new App(options);

    testRunningAppInstances.push(app);

    app.run();

    return chai.expect(app.httpServer.address()).property("port", httpPort);
  });
  
  it("on handling a request, if a route was matched and no errors were thrown, set response code to 200", () => {
    interface Cake {};

    const options: AppOptions = {
      http: {
        enabled: true
      }
    };

    // Extend App class to get access to protected handleRequest method.
    class TestApp extends App {
      public testHandleRequest = this.handleRequest;
    }

    const app = new TestApp(options);

    const postCakeHandler = () => { return {}; };

    const postCakeRoutePath = "/cakes";

    let postCakeRoute: Route<Cake> = {
      handler: postCakeHandler,
      method: Methods.post,
      path: postCakeRoutePath
    }

    app.router.add(postCakeRoute);

    let mockRequest = new http.IncomingMessage(new Socket());

    mockRequest.method = "POST";

    mockRequest.url = "/cakes";

    let mockResponse = new http.ServerResponse(new http.IncomingMessage(new Socket()));

    app.testHandleRequest(mockRequest, mockResponse);

    return chai.expect(mockResponse.statusCode).eq(200);
  });

  it("on handling a request, if a route is not matched, return 404", () => {
    const options: AppOptions = {
      http: {
        enabled: true
      }
    };

    // Extend App class to get access to protected handleRequest method.
    class TestApp extends App {
      public testHandleRequest = this.handleRequest;
    }

    const app = new TestApp(options);

    let mockRequest = new http.IncomingMessage(new Socket());

    mockRequest.method = "POST";

    mockRequest.url = "/cakes";

    let mockResponse = new http.ServerResponse(new http.IncomingMessage(new Socket()));

    app.testHandleRequest(mockRequest, mockResponse);

    return chai.expect(mockResponse.statusCode).eq(404);
  });
});