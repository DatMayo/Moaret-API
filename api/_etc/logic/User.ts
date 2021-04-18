import { IError, IResponse } from "../interfaces";
import { compareSync, hashSync } from "bcryptjs";
import UserSchema from "../../_etc/models/User";
import dbConnect from "../util/dbConnect";
import { Token } from "./Token";

export class User {
  private _errors: IError[] = [];
  private _username: string;

  constructor(username: string) {
    this._username = username;
  }

  comparePasswords(password: string, passwordConfirmation: string): IResponse {
    if (!password || !passwordConfirmation) {
      this._errors.push({
        msg: "You need to provide a password and a password confirmation!",
      });
      return {
        code: 400,
        error: this._errors,
      };
    }
    if (password.length < 8) {
      this._errors.push({
        msg: "The password needs to be at least 8 characters long!",
      });
      return {
        code: 400,
        error: this._errors,
      };
    }
    if (password !== passwordConfirmation) {
      this._errors.push({
        msg: "The given passwords dont match!",
      });
      return {
        code: 400,
        error: this._errors,
      };
    }
    return {
      code: 200,
    };
  }

  async doesUserExist(username?: string): Promise<IResponse> {
    let user = username || this._username;
    const userHandle = await UserSchema.findOne({
      username: user,
    });
    if (!userHandle) {
      return {
        code: 404,
      };
    } else {
      return {
        code: 200,
        data: { accountInfo: userHandle },
      };
    }
  }

  isUsernameInRequest(): IResponse {
    if (!this._username) {
      this._errors.push({ msg: "Missing username in request" });
      return {
        code: 403,
        error: this._errors,
      };
    }
    return { code: 200 };
  }

  async login(password: string = ""): Promise<IResponse> {
    const userCheck = this.isUsernameInRequest();
    if (userCheck.code !== 200) return userCheck;

    await dbConnect();

    const userData = await this.doesUserExist();
    if (userData.code !== 200) {
      this._errors.push({
        msg: "The given username does not exist in our records",
      });
      return {
        code: 403,
        error: this._errors,
      };
    }

    const dbPassword = userData.data.accountInfo.password;
    const matches = await compareSync(password, dbPassword);

    if (!matches) {
      this._errors.push({
        msg: "The password does not match with our records",
      });
      return {
        code: 403,
        error: this._errors,
      };
    }

    const tokenHandle = new Token();
    const tokenData = await tokenHandle.create(userData.data.accountInfo._id);

    return {
      code: 200,
      data: {
        accountInfo: userData.data.accountInfo,
        tokenInfo: tokenData.data.tokenInfo,
      },
    };
  }

  async register(
    password: string,
    passwordConfirmation: string
  ): Promise<IResponse> {
    const userCheck = this.isUsernameInRequest();
    if (userCheck.code !== 200) return userCheck;

    await dbConnect();

    const passwordCheck = this.comparePasswords(password, passwordConfirmation);
    if (passwordCheck.code !== 200) return passwordCheck;

    await dbConnect();

    const doesUserExist = await this.doesUserExist();
    if (doesUserExist.code !== 404) {
      this._errors.push({
        msg: "There is already an account registered with this username",
      });
      return {
        code: 400,
        error: this._errors,
      };
    }

    const hashedPassword = hashSync(password);

    const schemaResult = await new UserSchema({
      username: this._username,
      password: hashedPassword,
    }).save();

    return {
      code: 200,
      data: { accountInfo: schemaResult },
    };
  }
}
