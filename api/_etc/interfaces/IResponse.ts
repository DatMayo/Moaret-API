import { IError } from "./index";

export class IResponse {
  code: number;
  error?: IError[];
  data?: {
    [propName: string]: unknown;
  };
}
