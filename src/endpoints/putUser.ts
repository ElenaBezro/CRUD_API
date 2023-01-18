import { validate } from "uuid";
import { UserService } from "../services/UserService";
import { RequestHandler, User } from "../types";
import { isCreateUserPayload } from "../validation";

const putUser: RequestHandler = async (req, res, { userId }) => {
  if (!validate(userId)) {
    res.statusCode = 400;
    res.end(`Not a valid uuid: ${userId}`);
    return;
  }

  if (!UserService.getInstance().getUser(userId)) {
    res.statusCode = 404;
    res.end("User does not exist");
    return;
  }

  const chunks: Buffer[] = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    const payload = JSON.parse(Buffer.concat(chunks).toString());
    if (!isCreateUserPayload(payload)) {
      res.statusCode = 400;
      res.end("User data is invalid");
      return;
    }

    const user: User = {
      username: payload.username,
      age: payload.age,
      hobbies: [...payload.hobbies],
      id: userId,
    };
    UserService.getInstance().updateUser(user);
    res.statusCode = 201;
    res.end(JSON.stringify(user), () => {
      console.log("\n User Info has been updated\n");
    });
  });
};
export { putUser };
