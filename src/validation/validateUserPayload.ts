import { CreateUserPayload } from "../types/user.types";

const validateUserFields = (value: Partial<Record<string, unknown>>): boolean[] => {
  const isUsernameValid = "username" in value && typeof value.username === "string";
  const isAgeValid = "age" in value && typeof value.age === "number";
  const isHobbiesValid = "hobbies" in value && Array.isArray(value.hobbies) && value.hobbies.every((hobby) => typeof hobby === "string");
  return [isUsernameValid, isAgeValid, isHobbiesValid];
};

const isCreateUserPayload = (value: unknown): value is CreateUserPayload => {
  if (typeof value === "object" && !!value) {
    const [isUsernameValid, isAgeValid, isHobbiesValid] = validateUserFields(value);
    return isUsernameValid && isAgeValid && isHobbiesValid;
  }
  return false;
};

export { isCreateUserPayload };
