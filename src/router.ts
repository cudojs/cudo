import * as pathToRegexp from "path-to-regexp";

interface StoredRoutes {
  delete: Route<any>[];

  get: Route<any>[];

  post: Route<any>[];

  put: Route<any>[];
}

class RouteMatchingError extends Error {
  public httpStatusCode: number;

  constructor(message, httpStatusCode) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RouteMatchingError);
    }

    this.httpStatusCode = httpStatusCode;
  }
}

export interface Handler<T> {
  (): T;
}

export interface Route<T> {
  handler?: Handler<T>;

  method: Methods;

  params?: pathToRegexp.Key[];

  path: string;

  pattern?: RegExp;
}

export enum Methods {
  delete = "delete",
  get = "get",
  post = "post",
  put = "put"
}

export class Router {
  protected storedRoutes: StoredRoutes = {
    delete: [],
    get: [],
    post: [],
    put: [],
  };

  public add(route: Route<any>) {
    route.params = [];

    route.pattern = pathToRegexp(route.path, route.params);

    // Store routes in reverse order, to allow quick matching of latest added route.
    this.storedRoutes[route.method].splice(0, 0, route);
  }

  public match(method: string, path: string): Route<any> {
    if (!Methods[method]) {
      throw new RouteMatchingError("Method not allowed", 405);
    }

    let route;

    for (let i = 0; i < this.storedRoutes[method].length; i++) {
      if (this.storedRoutes[method][i].pattern.test(path)) {
        route = this.storedRoutes[method][i];

        break;
      }
    }

    if (!route) {
      throw new RouteMatchingError("Not found", 404);
    }

    return route;
  }

  public remove(route: Route<any>) {
    let removeFromMethod = null;

    let removeIndex = -1;

    if (this.storedRoutes[route.method]) {
      for (let i = 0; i < this.storedRoutes[route.method].length; i++) {
        if (this.storedRoutes[route.method][i].path == route.path) {
          removeFromMethod = route.method;

          removeIndex = i;

          break;
        }
      }
    }

    if (removeFromMethod
      && removeIndex > -1) {
      this.storedRoutes[removeFromMethod].splice(removeIndex, 1);
    }
    else {
      throw new Error("Cannot remove a route, match not found for method `" + route.method + "` and path `" + route.path + "`");
    }
  }
}
