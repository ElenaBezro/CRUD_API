import { v4, validate } from "uuid";

import { User } from "../types";

class UserService {
  private static instance = new UserService();

  private users: Record<User["id"], Omit<User, "id"> | undefined> = {
    [v4()]: { username: "John", age: 30, hobbies: ["video games"] },
    [v4()]: { username: "Alex", age: 25, hobbies: [] },
  };

  private constructor() {}

  static getInstance() {
    return this.instance;
  }

  getUsers() {
    return Object.entries(this.users).map(([id, user]) => ({ id, ...user }));
  }
}

export { UserService };
