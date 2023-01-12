import { v4 } from "uuid";
import { UserService } from "../services/UserService";
import { RequestHandler } from "../types";
import { isCreateUserPayload } from "../validation";

const postUser: RequestHandler = async (req, res, params) => {
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
        UserService.getInstance().addUser(newUser);
        // USERS[newUser.id] = userData;
        res.statusCode = 201;
        res.end(JSON.stringify(newUser));
      } catch (e: unknown) {
        e instanceof Error && console.log(e.message);
      }
    });
    return;
  }
  throw new Error();
};
export { postUser };
