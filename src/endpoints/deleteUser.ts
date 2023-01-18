import { validate } from "uuid";
import { UserService } from "../services/UserService";
import { RequestHandler } from "../types";

const deleteUser: RequestHandler = async (req, res, { userId }) => {
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

  UserService.getInstance().deleteUser(userId);
  res.statusCode = 204;
  console.log("User has been successfully deleted");
  res.end();
};

export { deleteUser };
