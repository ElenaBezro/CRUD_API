import * as dotenv from "dotenv";

import { Server } from "./Server";
import { getUsers } from "./endpoints/getUsers";
import { getUser } from "./endpoints/getUser";
import { postUser } from "./endpoints/postUser";
import { putUser } from "./endpoints/putUser";
import { deleteUser } from "./endpoints/deleteUser";

dotenv.config();

const server = new Server();

server.get("/api/users", getUsers);
server.get("/api/users/:userId", getUser);
server.post("/api/users", postUser);
server.put("/api/users/:userId", putUser);
server.delete("/api/users/:userId", deleteUser);

server.start(Number(process.env.PORT));
