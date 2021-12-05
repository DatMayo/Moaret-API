import { VercelRequest, VercelResponse } from "@vercel/node";
import { Project } from "../_etc/logic/Project";

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  const username: string = req.headers.user as string;
  const token: string = req.headers.token as string;

  const projectListHandle = new Project(username);
  projectListHandle.setQueryToken(token);

  const response = await projectListHandle.list();
  res.status(response.code).send(response);
};
