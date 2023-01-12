// import cluster from "node:cluster";
// import os from "node:os";
import * as dotenv from "dotenv";

import { Server } from "./Server";
import { getUsers } from "./endpoints/getUsers";
import { getUser } from "./endpoints/getUser";
import { postUser } from "./endpoints/postUser";

dotenv.config();

const server = new Server();

server.get("/api/users", getUsers);
server.get("/api/users/:userId", getUser);
// server.get("/api/users/:userId/projects", getUserProjects);
// server.get("/api/users/:userId/projects/:projectId", async (_req, res, params) => {
//   console.log("url params", JSON.stringify(params, undefined, 2));

//   res.statusCode = 200;
//   res.end("Yay");
// });
// server.put("/api/users/:userId", putUser);
server.post("/api/users", postUser);
//server.delete("/api/users/:userId", deleteUser);

server.start(Number(process.env.PORT));
