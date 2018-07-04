export interface Handler<T> {
  (): T;
}

export interface Route<T> {
  handler?: Handler<T>;

  method: Methods;

  path: string;
}

export enum Methods {
  delete = "delete",
  get = "get",
  post = "post",
  put = "put",
  options = "options"
}

export class Router {
  add(route: Route<any>) {

  }

  match(method: Methods, url: string) {

  }

  remove(route: Route<any>) {

  }
}