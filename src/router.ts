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

  public match(method: string, path: string): RouteMatchResponse {
    if (!Methods[method]) {
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
      routes = this.matchInMethodArray(this.storedRoutes[method], path);
    }

    if (routes.length > 0) {
      matchResponse.route = routes.pop();
    }
    else {
      // If no matching route was found, look for suggestions of other routes matching 
      // the path, but corresponding to other methods.
      let suggestions = {};

      let suggestionsCount = 0;

      let methodKeys = Object.keys(this.storedRoutes);

      let requestMethodIndex = methodKeys.indexOf(method);

      methodKeys.splice(requestMethodIndex, 1);

      for (let methodKey of methodKeys) {
        let methodSuggestions = this.matchInMethodArray(this.storedRoutes[methodKey], path, true);

        if (methodSuggestions.length > 0) {
          suggestions[methodKey] = methodSuggestions;

          suggestionsCount++;
        }
      }

      if (suggestionsCount > 0) {
        matchResponse.suggestions = suggestions;
      }
    }

    return matchResponse;
  }

  private matchInMethodArray(routes: Route<any>[], path: string, continueAfterMatch: boolean = false): Route<any>[] {
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
