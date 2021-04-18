import { IError } from "./index";

export class IResponse {
  code: number;
  error?: IError[];
  data?: {
    accountInfo?: {
      _id: string;
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
