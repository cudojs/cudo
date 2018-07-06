import * as chai from "chai";

import * as chaiAsPromised from "chai-as-promised";

import * as pathToRegexp from "path-to-regexp";

import { Methods, Route, Router } from "../src/router";

chai.use(chaiAsPromised);

describe("Router", () => {
  it("on adding a route, adds regex pattern and params and stores the route according to the method", () => {
    interface Cake { }

    // Extend Router class to get access to protected storedRoutes property.
    class TestRouter extends Router {
      public testStoredRoutes = this.storedRoutes;
    }

    const router = new TestRouter();

    const getCakeHandler = () => { return {}; };

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

    return chai.expect(router.testStoredRoutes).property("get").deep.equal([expectedGetCakeRoute]);
  });

  it("on removing a route, if a match is found for the method and path, removes the route from stored routes", () => {
    interface Cake { }

    // Extend Router class to get access to protected storedRoutes property.
    class TestRouter extends Router {
      public testStoredRoutes = this.storedRoutes;
    }

    const router = new TestRouter();

    const getCakeHandler = () => { return {}; };

    const getCakeRoutePath = "/cakes/:cakeId(\\d+)";

    let getCakeRoute: Route<Cake> = {
      handler: getCakeHandler,
      method: Methods.get,
      path: getCakeRoutePath
    }

    router.add(getCakeRoute);

    const postCakeHandler = () => { return {}; };

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

    return chai.expect(router.testStoredRoutes).property("post").deep.equal([expectedPostCakeRoute]);
  });

  it("on removing a route, if a match is not found for the method and path, throws an error", () => {
    interface Cake { }

    const router = new Router();

    let postCakeRouteToRemove: Route<Cake> = {
      method: Methods.post,
      path: "/cakes"
    }

    return chai.expect(router.remove.bind(router, postCakeRouteToRemove)).throws("Cannot remove a route, match not found for method `" + postCakeRouteToRemove.method + "` and path `" + postCakeRouteToRemove.path + "`");
  });

  it("on matching a route, if unsupported method is used, throws an error", () => {
    const router = new Router();

    let unsupportedMethod = "unsupportedMethod";

    return chai.expect(router.match.bind(router, unsupportedMethod, "/cakes")).throws("Method `" + unsupportedMethod + "` is not supported");
  });

  it("on matching a route, if a match has not been found for the path specified, returns an empty match response", () => {
    const router = new Router();

    return chai.expect(router.match("get", "/cakes")).deep.eq({});
  });

  it("on matching a route, if a match has been found for the path specified, but the method does not match, returns a match response with a list of route suggestions grouped by method", () => {
    interface Cake { }

    const router = new Router();

    const getCakesHandler = () => [];

    const getCakesRoutePath = "/cakes";

    let getCakesRoute: Route<Cake[]> = {
      handler: getCakesHandler,
      method: Methods.get,
      path: getCakesRoutePath
    }

    router.add(getCakesRoute);

    const deleteCakesHandler = () => [];

    const deleteCakesRoutePath = "/cakes/:cakeId?";

    let deleteCakesRoute: Route<Cake[]> = {
      handler: deleteCakesHandler,
      method: Methods.delete,
      path: deleteCakesRoutePath
    }

    router.add(deleteCakesRoute);

    return chai.expect(router.match("post", "/cakes")).deep.eq({
      suggestions: {
        delete: [deleteCakesRoute],
        get: [getCakesRoute]
      }
    });
  });

  it("on matching a route, if method is `options`, return a match response with a list of suggested routes grouped by method", () => {
    interface Cake { }

    const router = new Router();

    const getCakesHandler = () => [];

    const getCakesRoutePath = "/cakes";

    let getCakesRoute: Route<Cake[]> = {
      handler: getCakesHandler,
      method: Methods.get,
      path: getCakesRoutePath
    }

    router.add(getCakesRoute);

    const deleteCakesHandler = () => [];

    const deleteCakesRoutePath = "/cakes/:cakeId?";

    let deleteCakesRoute: Route<Cake[]> = {
      handler: deleteCakesHandler,
      method: Methods.delete,
      path: deleteCakesRoutePath
    }

    router.add(deleteCakesRoute);

    return chai.expect(router.match("options", "/cakes")).deep.eq({
      suggestions: {
        delete: [deleteCakesRoute],
        get: [getCakesRoute]
      }
    });
  });

  it("on matching a route, if method is `head` and a corresponding get route does not exist, return a match response with a list of suggested routes grouped by method", () => {
    interface Cake { }

    const router = new Router();

    const deleteCakesHandler = () => [];

    const deleteCakesRoutePath = "/cakes/:cakeId?";

    let deleteCakesRoute: Route<Cake[]> = {
      handler: deleteCakesHandler,
      method: Methods.delete,
      path: deleteCakesRoutePath
    }

    router.add(deleteCakesRoute);

    return chai.expect(router.match("head", "/cakes")).deep.eq({
      suggestions: {
        delete: [deleteCakesRoute]
      }
    });
  });

  it("on matching a route, if method is `head` and a corresponding get route exists, return a match response with the corresponding get route", () => {
    interface Cake { }

    const router = new Router();

    const getCakesHandler = () => [];

    const getCakesRoutePath = "/cakes";

    let getCakesRoute: Route<Cake[]> = {
      handler: getCakesHandler,
      method: Methods.get,
      path: getCakesRoutePath
    }

    router.add(getCakesRoute);

    const deleteCakesHandler = () => [];

    const deleteCakesRoutePath = "/cakes/:cakeId?";

    let deleteCakesRoute: Route<Cake[]> = {
      handler: deleteCakesHandler,
      method: Methods.delete,
      path: deleteCakesRoutePath
    }

    router.add(deleteCakesRoute);

    return chai.expect(router.match("head", "/cakes")).deep.eq({
      route: getCakesRoute
    });
  });

  it("on matching a route, returns a match response with a route if a match has been found", () => {
    interface Cake { }

    const router = new Router();

    const getCakesHandler = () => [];

    const getCakesRoutePath = "/cakes";

    let getCakesRoute: Route<Cake[]> = {
      handler: getCakesHandler,
      method: Methods.get,
      path: getCakesRoutePath
    }

    router.add(getCakesRoute);

    let expectedGetCakesRouteParams = [];

    let expectedGetCakesRoutePattern = pathToRegexp(getCakesRoutePath, expectedGetCakesRouteParams);

    let expectedGetCakesRoute: Route<Cake[]> = {
      handler: getCakesHandler,
      method: Methods.get,
      params: expectedGetCakesRouteParams,
      path: getCakesRoutePath,
      pattern: expectedGetCakesRoutePattern
    }

    return chai.expect(router.match("get", "/cakes")).deep.eq({ route: expectedGetCakesRoute });
  });

  it("on matching a route, if more than one route is matched, returns a match response with the latest added matching route", () => {
    interface Cake { }

    const router = new Router();

    const getCakesHandler = () => [];

    const getCakesRoutePath = "/cakes";

    let getCakesRoute: Route<Cake[]> = {
      handler: getCakesHandler,
      method: Methods.get,
      path: getCakesRoutePath
    }

    router.add(getCakesRoute);

    const getCakesOrCakeHandler = () => [];

    const getCakesOrCakeRoutePath = "/cakes/:cakeId?";

    let getCakesOrCakeRoute: Route<Cake[]> = {
      handler: getCakesOrCakeHandler,
      method: Methods.get,
      path: getCakesOrCakeRoutePath
    }

    router.add(getCakesOrCakeRoute);

    let expectedGetCakesOrCakeRouteParams = [];

    let expectedGetCakesOrCakeRoutePattern = pathToRegexp(getCakesOrCakeRoutePath, expectedGetCakesOrCakeRouteParams);

    let expectedGetCakesOrCakeRoute: Route<Cake[]> = {
      handler: getCakesOrCakeHandler,
      method: Methods.get,
      params: expectedGetCakesOrCakeRouteParams,
      path: getCakesOrCakeRoutePath,
      pattern: expectedGetCakesOrCakeRoutePattern
    }

    return chai.expect(router.match("get", "/cakes")).deep.eq({ route: expectedGetCakesOrCakeRoute });
  });
});