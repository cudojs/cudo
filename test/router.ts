import * as chai from "chai";

import * as chaiAsPromised from "chai-as-promised";

import * as pathToRegexp from "path-to-regexp";

import { Methods, Route, Router } from "../src/router";

chai.use(chaiAsPromised);

describe("Router", () => {
  it("On adding a route, adds regex pattern and params and stores the route", () => {
    interface Cake {};

    class TestRouter extends Router {
      public testStoredRoutes = this.storedRoutes;
    }

    let router = new TestRouter();

    let handler = () => [];

    let routePath = "/cakes/:cakeId(\\d+)/ingredients/:ingredientName";

    let getCakeRoute: Route<Cake> = {
      handler: handler,
      method: Methods.get,
      path: routePath
    }

    router.add(getCakeRoute);

    let expectedRouteParams = [];

    let expectedRoutePattern = pathToRegexp(routePath, expectedRouteParams);

    let expectedGetCakeRoute: Route<Cake> = {
      handler: handler,
      method: Methods.get,
      params: expectedRouteParams,
      path: routePath,
      pattern: expectedRoutePattern
    }

    return chai.expect(router.testStoredRoutes).deep.equal([expectedGetCakeRoute]);
  });
});