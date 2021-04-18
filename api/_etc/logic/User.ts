import { IError, IResponse } from "../interfaces";
import { compareSync, hashSync } from "bcryptjs";
import UserSchema from "../../_etc/models/User";
import dbConnect from "../util/dbConnect";
import { Token } from "./Token";

export class User {
  private _errors: IError[] = [];
  private _username: string;

  /**
   * Creates a new instance to perform user actions
   * @param {string} username Username for this instance
   */
  constructor(username: string) {
    this._username = username;
  }

  /**
   * Compares two passwords and checks if they match or even exist
   * @param {string} password User typed password
   * @param {string} passwordConfirmation Password to check against "password"
   */
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

  /**
   * Checks if a user exists in our database
   * @param {string} username? If provided, checks if this user exists. Otherwise the instance user will be checked
   */
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

  /**
   * Checks if a user was provided when instance was created
   */
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

  /**
   * Performs all needed tasks to login a user
   * @param {string} password Password to check for the instanciated user
   */
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

  /**
   * Registers a user with the instance user and password
   * @param password User provided password
   * @param passwordConfirmation User provided password confirmations
   */
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
