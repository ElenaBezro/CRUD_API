import { UserService } from "../services/UserService";
import { RequestHandler } from "../types";
import { isCreateUserPayload } from "../validation";

const postUser: RequestHandler = async (req, res, params) =>
  new Promise((resolve, reject) => {
    let body: Buffer[] = [];

    req.on("data", (chunk) => body.push(chunk));

    req.on("end", () => {
      try {
        const userData = JSON.parse(Buffer.concat(body).toString());
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

    resolve();
  });

export { postUser };
