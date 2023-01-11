import { createServer } from "node:http";

import { HTTPMethod, RequestHandler } from "./types";

class Server {
  private _server;

  private endpoints: Record<HTTPMethod, Record<string, RequestHandler>> = {
    GET: {},
    PUT: {},
    POST: {},
    DELETE: {},
  };

  get(url: string, handler: RequestHandler) {
    this.endpoints.GET[url] = handler;
  }

  put(url: string, handler: RequestHandler) {
    this.endpoints.PUT[url] = handler;
  }

  post(url: string, handler: RequestHandler) {
    this.endpoints.POST[url] = handler;
  }

  delete(url: string, handler: RequestHandler) {
    this.endpoints.DELETE[url] = handler;
  }

  constructor() {
    this._server = createServer((req, res) => {
      console.log(`url: ${req.url}, method: ${req.method}`);

      const endpointsByUrl = this.endpoints[(req.method as HTTPMethod | undefined) ?? "GET"];
      const url = req.url ?? "";

      // TODO: find best matching handler
      const handler = endpointsByUrl[url];

      if (!handler) {
        res.statusCode = 404;
        res.end("Unknown request url");
        return;
      }

      handler(req, res).catch(() => {
        res.statusCode = 500;
        res.end("Oops, something went wrong :)");
      });
    });
  }

  start(port: number) {
    this._server.listen(port, () => {
      console.log(`server started on port ${port}`);
    });
  }
}

export { Server };
