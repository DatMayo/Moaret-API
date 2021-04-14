import { IError } from "../interfaces";

export class User {
  private _errors: IError[] = [];
  private _username: string;

  constructor(username: string) {
    this._username = username;
  }

  register(password: string, passwordConfirmation: string) {}

  private validate(...args: string[]) {
    for (let item of args) {
      if (!item)
        return this._errors.push({ msg: "Required field can not be empty" });
    }
  }
}
