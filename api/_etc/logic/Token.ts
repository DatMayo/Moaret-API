import { IResponse } from "../interfaces";
import TokenSchema from "../../_etc/models/Token";

export class Token {
  async create(guid: string): Promise<IResponse> {
    try {
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
        const currentToken = Math.random().toString(36).substring(7); // 5874311
        const tokenResult = await new TokenSchema({
          token: currentToken,
          userId: guid,
        }).save();
        return {
          code: 200,
          data: { tokenInfo: tokenResult },
        };
      }
    } catch (err) {
      return {
        code: 500,
        error: [{ msg: err }],
      };
    }
  }
}
