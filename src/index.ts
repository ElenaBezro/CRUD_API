import { createServer } from "node:http";
import { v4, validate } from "uuid";
import cluster from "node:cluster";
import os from "node:os";
import * as dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT;

type User = {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
};

const USERS: Record<User["id"], Omit<User, "id"> | undefined> = {
  [v4()]: { username: "John", age: 30, hobbies: ["video games"] },
  [v4()]: { username: "Alex", age: 25, hobbies: [] },
};

const startServer = () => {
  const server = createServer((req, res) => {
    console.log(`url: ${req.url}\nmethod:${req.method}\nheaders:${JSON.stringify(req.headers)}`);

    try {
      if (req.method === "GET") {
        if (req.url === "/api/users") {
          res.end(JSON.stringify(Object.entries(USERS).map(([id, user]) => ({ id, ...user }))));
          return;
        }

        if (req.url?.startsWith("/api/users/")) {
          const userId = req.url.substring("/api/users/".length);
          if (!validate(userId)) {
            res.statusCode = 400;
            res.end(`Not a valid uuid: ${userId}`);
            return;
          }

          const user = USERS[userId];
          if (user) {
            res.statusCode = 200;
            res.end(JSON.stringify({ ...user, id: userId }));
            return;
          }

          res.statusCode = 404;
          res.end("user not found");
          return;
        }
      }
    } catch {
      res.statusCode = 500;
      res.end("Ooops, something went wrong");
    }

    // if catch{} above executed, then code below wouldn't run?
    res.statusCode = 404;
    res.end("Unknown request url");
  });

  server.listen(port);
};

if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }

  cluster.on("exit", () => {
    cluster.fork();
  });
} else {
  startServer();
}
