import { createServer, IncomingMessage, request, ServerResponse } from "node:http";
import { v4, validate } from "uuid";
import cluster from "node:cluster";
import os from "node:os";
import * as dotenv from "dotenv";
import { json } from "stream/consumers";
import { V4MAPPED } from "node:dns";

dotenv.config();
let port = +process.env.PORT!;

type User = {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
};

type CreateUserPayload = Omit<User, "id">;

const USERS: Record<User["id"], Omit<User, "id"> | undefined> = {
  [v4()]: { username: "John", age: 30, hobbies: ["video games"] },
  [v4()]: { username: "Alex", age: 25, hobbies: [] },
};

const isCreateUserPayload = (value: unknown): value is CreateUserPayload => {
  if (typeof value === "object" && !!value) {
    const isUsernameValid = "username" in value && typeof value.username === "string";
    const isAgeValid = "age" in value && typeof value.age === "number";
    const isHobbiesValid = "hobbies" in value && Array.isArray(value.hobbies) && value.hobbies.every((hobby) => typeof hobby === "string");
    return isUsernameValid && isAgeValid && isHobbiesValid;
  }
  return false;
};
const handleError = (res: ServerResponse<IncomingMessage>, statusCode: number, message: string) => {
  res.statusCode = statusCode;
  res.end();
  console.log(message);
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
      if (req.method === "POST") {
        if (req.url === "/api/users") {
          let body: Buffer[] = [];
          req.on("data", (chunk) => body.push(chunk));
          req.on("end", () => {
            const userData = JSON.parse(Buffer.concat(body).toString());
            try {
              if (!isCreateUserPayload(userData)) {
                res.statusCode = 400;
                res.end;
                throw new Error("User data is invalid");
              }
              const newUser = {
                ...userData,
                id: v4(),
              };
              USERS[newUser.id] = userData;
              res.statusCode = 201;
              res.end(JSON.stringify(newUser));
            } catch (e: unknown) {
              e instanceof Error && console.log(e.message);
            }
          });
          return;
        }
        throw new Error();
      }
      res.statusCode = 404;
      res.end("Unknown request url");
    } catch {
      handleError(res, 500, "Ooops, something went wrong");
    }
  });

  server.listen(port, () => {
    console.log(`server started on port ${port}`);
  });
};

// if (cluster.isPrimary) {
//   for (let i = 0; i < os.cpus().length; i++) {
//     cluster.fork({ WORKER_PORT: port! + i + 1 });
//   }

//   cluster.on("exit", () => {
//     cluster.fork();
//   });
// } else {
//   port = +process.env.WORKER_PORT!;
// watch 26.25 in review 3 task
startServer();
// }
// для хранения и совместного использования воркерами инфы о юзерах использовать дочерний процесс. В Видео 36.40
