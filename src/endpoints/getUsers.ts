import { UserService } from "../services/UserService";
import { RequestHandler } from "../types";

const getUsers: RequestHandler = async (_, res) => {
  const users = UserService.getInstance().getUsers();

  res.statusCode = 200;
  res.end(JSON.stringify(users));
};

export { getUsers };
