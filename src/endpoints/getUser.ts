import { RequestHandler, User } from "../types";
import { validate } from "uuid";
import { UserService } from "../services/UserService";

const getUser: RequestHandler = async (_req, res, pathParams) => {
  const { userId } = pathParams;
  if (!validate(userId)) {
    res.statusCode = 400;
    res.end(`Not a valid uuid: ${userId}`);
    return;
  }

  const user = UserService.getInstance().getUser(userId);
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
