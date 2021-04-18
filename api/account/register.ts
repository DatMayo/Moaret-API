import { User } from "../_etc/logic/User";

module.exports = async (req, res) => {
  const userHandle = new User(req.body.username);
  const response = await userHandle.register(
    req.body.password,
    req.body.passwordConfirmation
  );

  res.status(response.code).send(response);
};
