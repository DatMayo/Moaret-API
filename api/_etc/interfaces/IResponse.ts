import { IError } from "./index";
import * as mongoose from "mongoose";

export class IResponse {
  code: number;
  error?: IError[];
  data?: {
    accountInfo?: {
      _id: mongoose.Schema.Types.ObjectId;
      username: string;
      password: string;
      [propName: string]: unknown;
    };
    tokenInfo?: {
      _id: string;
      token: string;
      userId: string;
    };
    [propName: string]: unknown;
  };
}
