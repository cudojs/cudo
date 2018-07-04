import * as chai from "chai";

import * as chaiAsPromised from "chai-as-promised";

import * as pathToRegexp from "path-to-regexp";

import { Methods, Route, Router } from "../src/router";

chai.use(chaiAsPromised);

describe("Router", () => {
  it("On adding a route, adds regex pattern and params and stores the route", () => {
    interface Cake {}

    class TestRouter extends Router {
      public testStoredRoutes = this.storedRoutes;
    }

    const router = new TestRouter();

    const getCakeHandler = () => [];

    const getCakeRoutePath = "/cakes/:cakeId(\\d+)";

    let getCakeRoute: Route<Cake> = {
      handler: getCakeHandler,
      method: Methods.get,
      path: getCakeRoutePath
    }

    router.add(getCakeRoute);

    let expectedGetCakeRouteParams = [];

    let expectedGetCakeRoutePattern = pathToRegexp(getCakeRoutePath, expectedGetCakeRouteParams);

    let expectedGetCakeRoute: Route<Cake> = {
      handler: getCakeHandler,
      method: Methods.get,
      params: expectedGetCakeRouteParams,
      path: getCakeRoutePath,
      pattern: expectedGetCakeRoutePattern
    }

    return chai.expect(router.testStoredRoutes).deep.equal([expectedGetCakeRoute]);
  });

  it("On removing a route, removes the route from stored routes if a match is found for the method and path", () => {
    interface Cake {}

    class TestRouter extends Router {
      public testStoredRoutes = this.storedRoutes;
    }

    const router = new TestRouter();

    const getCakeHandler = () => [];

    const getCakeRoutePath = "/cakes/:cakeId(\\d+)";

    let getCakeRoute: Route<Cake> = {
      handler: getCakeHandler,
      method: Methods.get,
      path: getCakeRoutePath
    }

    router.add(getCakeRoute);

    const postCakeHandler = () => [];

    const postCakeRoutePath = "/cakes";

    let postCakeRoute: Route<Cake> = {
      handler: postCakeHandler,
      method: Methods.post,
      path: postCakeRoutePath
    }

    router.add(postCakeRoute);

    let expectedPostCakeRouteParams = [];

    let expectedPostCakeRoutePattern = pathToRegexp(postCakeRoutePath, expectedPostCakeRouteParams);

    let expectedPostCakeRoute: Route<Cake> = {
      handler: postCakeHandler,
      method: Methods.post,
      params: expectedPostCakeRouteParams,
      path: postCakeRoutePath,
      pattern: expectedPostCakeRoutePattern
    }

    let getCakeRouteToRemove: Route<any> = {
      method: Methods.get,
      path: "/cakes/:cakeId(\\d+)"
    };

    router.remove(getCakeRouteToRemove);

    return chai.expect(router.testStoredRoutes).deep.equal([expectedPostCakeRoute]);
  });

  it("On removing a route, throws an error if a match is not found for the method and path", () => {
    interface Cake {}

    const router  = new Router();

    let postCakeRouteToRemove: Route<Cake> = {
      method: Methods.post,
      path: "/cakes"
    }

    return chai.expect(router.remove.bind(router, postCakeRouteToRemove)).throw("Cannot remove a route, match not found for method `" + postCakeRouteToRemove.method + "` and path `" + postCakeRouteToRemove.path + "`");
  });
});