import * as pathToRegexp from "path-to-regexp";

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
  put = "put",
  options = "options"
}

export class Router {
  protected storedRoutes: Route<any>[] = [];

  public add(route: Route<any>) {
    route.params = [];

    route.pattern = pathToRegexp(route.path, route.params);

    this.storedRoutes.push(route);
  }

  public match(method: Methods, url: string) {

  }

  public remove(route: Route<any>) {

  }
}
