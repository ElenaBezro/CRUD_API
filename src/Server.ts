import { createServer } from "node:http";

import { HTTPMethod, RequestHandler } from "./types";
import cluster, { Worker } from "node:cluster";
import os from "node:os";

import { isMultiMode } from "./utils/isMultiMode";
import { parseRequestBody } from "./utils/parseRequestBody";

class Server {
  private server;
  private currentChildProcessIndex = 0;
  private workers: Worker[] = [];
  private port!: number;

  private endpoints: Record<HTTPMethod, Record<string, RequestHandler>> = {
    GET: {},
    PUT: {},
    POST: {},
    DELETE: {},
  };

  /**
   * Function to register http GET request handler for provided URL
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
    if (isMultiMode() && cluster.isPrimary) {
      this.server = createServer(async (req, res) => {
        const portOffset = (this.currentChildProcessIndex % this.workers.length) + 1;
        this.currentChildProcessIndex++;

        fetch(`http://localhost:${this.port + portOffset}${req.url}`, {
          method: req.method,
          body: req.method === "POST" || req.method === "PUT" ? await parseRequestBody(req) : undefined,
        })
          .then(async (response) => {
            console.log(response.status);
            let message = response.statusText;
            try {
              const json = await response.json();
              message = JSON.stringify(json);
            } catch {
              // no json in response body, do nothing
            }

            res.statusCode = response.status;
            res.end(message);
          })
          .catch((error: unknown) => {
            console.error(error);
            res.statusCode = 500;
            res.end("Ooops, something went wrong");
          });
      });

      return;
    }

    this.server = createServer((req, res) => {
      console.log(`url: http://localhost:${this.port}${req.url}, method: ${req.method}`);

      const endpointsByUrl = this.endpoints[(req.method as HTTPMethod | undefined) ?? "GET"];
      const url = req.url ?? "";

      const originalUrlParts = url.split("/");
      for (const [url, handler] of Object.entries(endpointsByUrl)) {
        const registeredUrlParts = url.split("/");
        if (registeredUrlParts.length !== originalUrlParts.length) {
          continue;
        }

        const pathParams: Record<string, string> = {};
        const isUrlMatchFound = registeredUrlParts.every((part, index) => {
          if (originalUrlParts[index] === part) {
            return true;
          }
          if (part[0] === ":") {
            pathParams[part.slice(1)] = originalUrlParts[index];
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
    this.port = process.env.WORKER_PORT ? +process.env.WORKER_PORT : port;

    if (isMultiMode() && cluster.isPrimary) {
      const workerCount = os.cpus().length;

      this.workers = [...Array(workerCount)].map((_, index) => cluster.fork({ WORKER_PORT: this.port + index + 1 }));

      cluster.on("exit", () => {
        cluster.fork();
      });
    }

    this.server.listen(this.port, () => {
      console.log(`server started on port ${this.port}`);
    });
  }
}

export { Server };
