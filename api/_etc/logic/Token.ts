import { IError, IResponse } from "../interfaces";
import TokenSchema from "../../_etc/models/Token";

export class Token {
  private _errors: IError[] = [];

  async create(guid: string): Promise<IResponse> {
    const tokenHandle = await TokenSchema.findOne({
      userId: guid,
    });
    if (tokenHandle) {
      tokenHandle.updatedAt = new Date();
      await tokenHandle.save();
      return {
        code: 200,
        data: { tokenInfo: tokenHandle },
      };
    } else {
      const currentToken = Math.random().toString(36).substring(7);
      const tokenResult = await new TokenSchema({
        token: currentToken,
        userId: guid,
      }).save();
      return {
        code: 200,
        data: { tokenInfo: tokenResult },
      };
    }
  }
}
