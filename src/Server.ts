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

  /**
   * Function to register GET http request handler for provided URL
   * @param url url to handle
   * @param handler a function to process request for provided URL
   */
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

      const originalUrlParts = url.split("/"); // [ "api", "users", "123", "projects", "proj1"]
      for (const [url, handler] of Object.entries(endpointsByUrl)) {
        const registeredUrlParts = url.split("/"); // ["api", "users", ":userId", "projects", ":projectId"]
        if (registeredUrlParts.length !== originalUrlParts.length) {
          continue;
        }

        const pathParams: Record<string, string> = {};
        const isUrlMatchFound = registeredUrlParts.every((part, index) => {
          if (originalUrlParts[index] === part) {
            return true;
          }
          if (part[0] === ":") {
            pathParams[part.slice(1)] = originalUrlParts[index]; // pathParams["userId"] = "123";
            return true;
          }
        });

        if (isUrlMatchFound) {
          handler(req, res, pathParams).catch(() => {
            res.statusCode = 500;
            res.end("Oops, something went wrong :)");
          });

          return;
        }
      }

      res.statusCode = 404;
      res.end("Unknown request url");
    });
  }

  start(port: number) {
    this._server.listen(port, () => {
      console.log(`server started on port ${port}`);
    });
  }
}

export { Server };
