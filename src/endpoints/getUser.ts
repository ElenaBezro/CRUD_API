import { RequestHandler, User } from "../types";
import { validate } from "uuid";
import { UserService } from "../services/UserService";

const getUser: RequestHandler = async (req, res) => {
  const userId = req.url!.slice("/api/users/".length);
  // console.log(userId);
  if (!validate(userId)) {
    res.statusCode = 400;
    res.end(`Not a valid uuid: ${userId}`);
    return;
  }

  const users = UserService.getInstance().getUsers();
  const user = users.find((user) => user.id === userId);
  if (user) {
    res.statusCode = 200;
    res.end(JSON.stringify(user));
    return;
  }

  res.statusCode = 404;
  res.end("user not found");
  return;
};

export { getUser };
