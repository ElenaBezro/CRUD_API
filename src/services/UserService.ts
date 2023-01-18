import cluster from "cluster";
import { v4 } from "uuid";

import { CreateUserPayload, User } from "../types";
import { isMultiMode } from "../utils/isMultiMode";

const SYNC_USERS_ACTION = "sync_users";

type UserRegistry = Record<User["id"], Omit<User, "id"> | undefined>;

class UserService {
  private static instance = new UserService();

  private users: UserRegistry = {};

  private constructor() {
    if (cluster.isPrimary && isMultiMode()) {
      this.users = {
        [v4()]: { username: "John", age: 30, hobbies: ["video games"] },
        [v4()]: { username: "Alex", age: 25, hobbies: [] },
      };

      cluster.on("message", (worker, message) => {
        if (message.action === SYNC_USERS_ACTION) {
          console.log(`primary process received message: ${JSON.stringify(message)}`);
          if (message.users) {
            UserService.getInstance().users = message.users as UserRegistry;

            Object.values(cluster.workers ?? {}).forEach((worker) => {
              worker?.send({ action: SYNC_USERS_ACTION, users: UserService.getInstance().users });
            });
          } else {
            worker.send({ action: SYNC_USERS_ACTION, users: UserService.getInstance().users });
          }
        }
      });
    }

    if (cluster.isWorker) {
      process.on("message", (message) => {
        if (typeof message === "object" && message && "action" in message && message.action === SYNC_USERS_ACTION && "users" in message) {
          UserService.instance.users = message.users as UserRegistry;
        }
      });

      this.syncWithPrimary();
    }
  }

  static getInstance() {
    return this.instance;
  }

  getUsers() {
    return Object.entries(this.users).map(([id, user]) => ({ id, ...user }));
  }

  getUser(id: User["id"]): User | undefined {
    const userWithoutId = this.users[id];
    return userWithoutId && { ...userWithoutId, id };
  }

  addUser({ username, age, hobbies }: CreateUserPayload): User {
    const id = v4();
    this.users[id] = { username, age, hobbies: [...hobbies] };

    this.syncWithPrimary(this.users);

    return { id, username, age, hobbies: [...hobbies] };
  }

  updateUser(user: User) {
    if (!this.users[user.id]) {
      throw new Error(`user not found: ${user.id}`);
    }
    this.users[user.id] = {
      age: user.age,
      hobbies: user.hobbies,
      username: user.username,
    };

    this.syncWithPrimary(this.users);
  }

  deleteUser(userId: string) {
    if (!this.users[userId]) {
      throw new Error(`user not found: ${userId}`);
    }
    delete this.users[userId];

    this.syncWithPrimary(this.users);
  }

  private syncWithPrimary(users?: UserRegistry) {
    process.send?.({ action: SYNC_USERS_ACTION, users });
  }
}

export { UserService };
