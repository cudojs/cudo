import * as pathToRegexp from "path-to-regexp";

interface StoredRoutes {
  delete: Route<any>[];

  get: Route<any>[];

  patch: Route<any>[];

  post: Route<any>[];

  put: Route<any>[];
}

class RouteMatchingError extends Error {
  public httpStatusCode: number;

  public headers?: { [key: string]: string; };

  constructor(message, httpStatusCode, headers?) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RouteMatchingError);
    }

    this.httpStatusCode = httpStatusCode;

    this.headers = headers;
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
  head = "head",
  options = "options",
  patch = "patch",
  post = "post",
  put = "put"
}

export class Router {
  protected storedRoutes: StoredRoutes = {
    delete: [],
    get: [],
    patch: [],
    post: [],
    put: [],
  };

  public add(route: Route<any>) {
    route.params = [];

    route.pattern = pathToRegexp(route.path, route.params);

    // Store routes in reverse order, to allow quick matching of latest added route.
    this.storedRoutes[route.method].splice(0, 0, route);
  }

  // FIXME: Add correct return values for HEAD and OPTIONS.
  // FIXME: Adjust return values for authentication.
  public match(method: string, path: string): Route<any> {
    if (!Methods[method]) {
      throw new RouteMatchingError("Not implemented", 501);
    }

    let route;

    route = this.matchInMethodArray(this.storedRoutes[method], path);

    // If no match is found, check if path is matched for other methods.
    let matchedOtherMethods = [];

    if (!route) {
      let otherMethods = Object.keys(this.storedRoutes);

      let requestMethodIndex = otherMethods.indexOf(method);

      otherMethods.splice(requestMethodIndex, 1);

      for (let otherMethod of otherMethods) {
        if (this.matchInMethodArray(this.storedRoutes[otherMethod], path)) {
          matchedOtherMethods.push(otherMethod);
        }
      }

      if (matchedOtherMethods.length > 0) {
        // Add OPTIONS by default.
        matchedOtherMethods.push("options");

        // Add HEAD if GET is present.
        if (matchedOtherMethods.indexOf("get") > -1) {
          matchedOtherMethods.push("head");
        }

        let allowedMethods = matchedOtherMethods.sort().join(", ").toUpperCase();

        throw new RouteMatchingError("Method not allowed", 405, {
          allow: allowedMethods
        });
      }
      else {
        throw new RouteMatchingError("Not found", 404);
      }
    }

    return route;
  }

  private matchInMethodArray(routes: Route<any>[], path: string) {
    let route;

    for (let i = 0; i < routes.length; i++) {
      if (routes[i].pattern.test(path)) {
        route = routes[i];

        break;
      }
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
