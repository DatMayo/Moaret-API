import { VercelRequest, VercelResponse } from "@vercel/node";
import { User } from "../_etc/logic/User";

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  const username: string = req.headers.user as string;
  const token: string = req.headers.token as string;

  const userHandle = new User(username);
  userHandle.setQueryToken(token);
  const response = await userHandle.listUser();
  res.status(response.code).send(response);
};
