import * as pathToRegexp from "path-to-regexp";

interface RouteMatchResponse {
  suggestions?: { [key: string]: Route<any>[]; };
  route?: Route<any>;
}

interface StoredRoutes {
  delete: Route<any>[];

  get: Route<any>[];

  patch: Route<any>[];

  post: Route<any>[];

  put: Route<any>[];
}

enum MethodsReverse {
  DELETE = "delete",
  GET = "get",
  HEAD = "head",
  OPTIONS = "options",
  PATCH = "patch",
  POST = "post",
  PUT = "put"
}

// TODO: Add params to handler interface.
export interface Handler<T> {
  (): T;
}

// TODO: Add security definition to route interface.
export interface Route<T> {
  handler?: Handler<T>;

  method: Methods;

  params?: pathToRegexp.Key[];

  path: string;

  pattern?: RegExp;
}

export enum Methods {
  delete = "DELETE",
  get = "GET",
  head = "HEAD",
  options = "OPTIONS",
  patch = "PATCH",
  post = "POST",
  put = "PUT"
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

    let storedRoutesKey = MethodsReverse[route.method];

    // Store routes in reverse order, to allow quick matching of latest added route.
    this.storedRoutes[storedRoutesKey].splice(0, 0, route);
  }

  public match(method: string, path: string): RouteMatchResponse {
    if (!MethodsReverse[method]) {
      throw new Error("Method `" + method + "` is not supported");
    }

    // Treat all HEAD requests as GET.
    if (method == Methods.head) {
      method = Methods.get;
    }

    let matchResponse: RouteMatchResponse = {};

    let routes = [];

    // Look for matching route for specified method, unless the method is OPTIONS,
    // which does not have stored routes.
    if (method != Methods.options) {
      routes = this.matchForStoredRoutesKey(this.storedRoutes[MethodsReverse[method]], path);
    }

    if (routes.length > 0) {
      matchResponse.route = routes.pop();
    }
    else {
      // If no matching route was found, look for suggestions of other routes matching 
      // the path, but corresponding to other methods.
      let suggestions = {};

      let suggestionsCount = 0;

      let storedRoutesKeys = Object.keys(this.storedRoutes);

      let requestMethodIndex = storedRoutesKeys.indexOf(Methods[method]);

      storedRoutesKeys.splice(requestMethodIndex, 1);

      for (let storedRoutesKey of storedRoutesKeys) {
        let methodSuggestions = this.matchForStoredRoutesKey(this.storedRoutes[storedRoutesKey], path, true);

        if (methodSuggestions.length > 0) {
          suggestions[storedRoutesKey] = methodSuggestions;

          suggestionsCount++;
        }
      }

      if (suggestionsCount > 0) {
        matchResponse.suggestions = suggestions;
      }
    }

    return matchResponse;
  }

  private matchForStoredRoutesKey(routes: Route<any>[], path: string, continueAfterMatch: boolean = false): Route<any>[] {
    let matchedRoutes = [];

    for (let i = 0; i < routes.length; i++) {
      if (routes[i].pattern.test(path)) {
        matchedRoutes.push(routes[i]);

        if (!continueAfterMatch) {
          break;
        }
      }
    }

    return matchedRoutes;
  }

  public remove(route: Route<any>) {
    let removeFromMethod = null;

    let removeIndex = -1;

    let storedRoutesKey = MethodsReverse[route.method];

    if (this.storedRoutes[storedRoutesKey]) {
      for (let i = 0; i < this.storedRoutes[storedRoutesKey].length; i++) {
        if (this.storedRoutes[storedRoutesKey][i].path == route.path) {
          removeFromMethod = storedRoutesKey;

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
