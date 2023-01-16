import { UserService } from "../services/UserService";
import { RequestHandler } from "../types";
import { parseRequestBody } from "../utils/parseRequestBody";
import { isCreateUserPayload } from "../validation";

const postUser: RequestHandler = async (req, res, params) =>
  new Promise(async (resolve, reject) => {
    try {
      const userData = JSON.parse(await parseRequestBody(req));
      if (!isCreateUserPayload(userData)) {
        res.statusCode = 400;
        res.end();
        console.log("User data is invalid");
        resolve();
      }

      const newUser = UserService.getInstance().addUser({
        username: userData.username,
        age: userData.age,
        hobbies: userData.hobbies,
      });

      res.statusCode = 201;
      res.end(JSON.stringify(newUser), () => {
        console.log("\n New User has been added\n");
      });
    } catch (e: unknown) {
      reject(e);
    }
  });

export { postUser };
