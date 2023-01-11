// import cluster from "node:cluster";
// import os from "node:os";
import * as dotenv from "dotenv";

import { Server } from "./Server";
import { getUsers } from "./endpoints/getUsers";
import { getUser } from "./endpoints/getUser";

dotenv.config();

const server = new Server();

server.get("/api/users", getUsers);
server.get("/api/users/:userId", getUser);
//server.put("/api/users/:userId", putUser);
//server.post("/api/users", postUser);
//server.delete("/api/users/:userId", deleteUser);

server.start(Number(process.env.PORT));
