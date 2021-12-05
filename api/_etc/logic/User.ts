import { IError, IResponse } from "../interfaces";
import { compareSync, hashSync } from "bcryptjs";
import UserSchema from "../../_etc/models/User";
import TokenSchema from "../../_etc/models/Token";
import dbConnect from "../util/dbConnect";
import { Token } from "./Token";
import { FilterQuery } from "mongoose";

export class User {
  private _errors: IError[] = [];
  private _queryToken: string;
  private readonly _username: string;

  /**
   * Creates a new instance to perform user actions
   * @param {string} username Username for this instance
   */
  constructor(username: string) {
    this._username = username;
  }

  async checkUserToken(): Promise<IResponse> {
    if (!this._queryToken) {
      this._errors.push({ msg: "Missing token in request body" });
      return {
        code: 403,
        error: this._errors,
      };
    }

    const result = await this.doesUserExist();

    if (result.code !== 200) {
      return {
        code: 403,
        error: result.error,
      };
    }

    const userHandle = result.data.accountInfo;

    const tokenHandle = await TokenSchema.findOne({
      userId: userHandle._id,
      token: this._queryToken,
    });

    if (!tokenHandle) {
      this._errors.push({ msg: "The given token is invalid for this user" });
      return {
        code: 403,
        error: this._errors,
      };
    }

    tokenHandle.updatedAt = new Date();
    tokenHandle.save();

    return {
      code: 200,
      data: {
        accountInfo: userHandle,
      },
    };
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

  async listUser(params?: FilterQuery<any>): Promise<IResponse> {
    if (!this._queryToken) {
      this._errors.push({ msg: "Missing token in request header" });
      return {
        code: 403,
        error: this._errors,
      };
    }

    await dbConnect();

    const tokenResponse = await this.checkUserToken();
    if (tokenResponse.code !== 200) {
      return {
        code: tokenResponse.code,
        error: tokenResponse.error,
      };
    }

    const isAdmin: boolean = tokenResponse.data.accountInfo.isAdmin as boolean;
    if (!isAdmin) {
      this._errors.push({
        msg: "The given user does not have the permission to view the userlist",
      });
      return { code: 403, error: this._errors };
    }

    const userList = await UserSchema.find(params, { password: false }).sort({
      username: 0,
    });

    return {
      code: 200,
      data: { userList },
    };
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
    const matches = compareSync(password, dbPassword);

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

  /**
   * Sets the token for further requests
   * @param {string} token Token to use for further queries
   */
  setQueryToken(token: string): void {
    this._queryToken = token;
  }
}
