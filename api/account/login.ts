import { User } from "../_etc/logic/User";

module.exports = async (req, res) => {
  const userHandle = new User(req.body.username);
  const response = await userHandle.login(req.body.password);

  res.status(response.code).send(response);
};
