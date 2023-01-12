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

  getUser(id: User["id"]): User | undefined {
    const userWithoutId = this.users[id];
    return userWithoutId && { ...userWithoutId, id };
  }

  addUser({ id, username, age, hobbies }: User) {
    this.users = { ...this.users, [id]: { username, age, hobbies: [...hobbies] } };
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
  }
}

export { UserService };
