import { IError } from "./index";

export class IResponse {
  code: number;
  error?: IError[];
  data?: {
    accountInfo?: {
      username: string;
      password: string;
      [propName: string]: unknown;
    };
    [propName: string]: unknown;
  };
}
