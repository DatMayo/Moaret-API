import { IResponse } from "../interfaces";
import { User } from "./User";
import dbConnect from "../util/dbConnect";
import ProjectSchema from "../../_etc/models/Project";
import token from "../models/Token";

export class Project {
  private _queryToken: string;
  private readonly _username: string;

  private _userHandle: User;

  /**
   * Creates a new instance to perform project actions
   * @param {string} username Username for this instance
   */
  constructor(username: string) {
    this._username = username;
    this._userHandle = new User(this._username);
  }

  async create(name: string): Promise<IResponse> {
    if (!this._queryToken) {
      return {
        code: 403,
        error: [{ msg: "Missing token in request body" }],
      };
    }

    await dbConnect();

    const tokenResponse = await this._userHandle.checkUserToken();
    if (tokenResponse.code !== 200) {
      return {
        code: tokenResponse.code,
        error: tokenResponse.error,
      };
    }

    const projectCreateResult = ProjectSchema.create();
  }

  async list(): Promise<IResponse> {
    if (!this._queryToken) {
      return {
        code: 403,
        error: [{ msg: "Missing token in request body" }],
      };
    }

    await dbConnect();

    const userExistsResponse = await this._userHandle.doesUserExist();
    if (userExistsResponse.code !== 200) {
      return {
        code: userExistsResponse.code,
        error: userExistsResponse.error,
      };
    }

    const tokenResponse = await this._userHandle.checkUserToken();
    if (tokenResponse.code !== 200) {
      return {
        code: tokenResponse.code,
        error: tokenResponse.error,
      };
    }

    const isAdmin: boolean = tokenResponse.data.accountInfo.isAdmin as boolean;

    if (!isAdmin)
      return this.getProjectList({ owner: tokenResponse.data.accountInfo._id });

    return await this.getProjectList();
  }

  /**
   * Sets the token for further requests
   * @param {string} token Token to use for further queries
   */
  setQueryToken(token: string): void {
    this._queryToken = token;
    this._userHandle.setQueryToken(this._queryToken);
  }

  private async getProjectList(filter?: any): Promise<IResponse> {
    const projectList = await ProjectSchema.find(filter);
    if (!projectList)
      return {
        code: 500,
        error: [
          { msg: "There was an error on our site, please try again later" },
        ],
      };
    return {
      code: 200,
      data: {
        projectList: projectList,
      },
    };
  }
}
