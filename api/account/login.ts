import dbConnect from "../_etc/util/dbConnect";
import { IError, IResponse } from "../_etc/interfaces";
import User from "../_etc/models/User";

module.exports = async (req, res) => {
  let errorObject: IError[] = [];
  let responseObject: IResponse;
  if (!req.body.username || !req.body.password) {
    errorObject.push({ msg: "Required field can not be empty" });
    responseObject = {
      code: 400,
      error: errorObject,
    };
    return res.status(responseObject.code).send(responseObject);
  }

  try {
    if (req.method !== "POST")
      throw new Error("Unsupported method call detected");

    await dbConnect();
    const { username, password } = req.body;
    const result = await User.findOne({
      username,
    });
    if (!result) {
      errorObject.push({
        msg: "The given username does not exist",
      });
      responseObject = {
        code: 403,
        error: errorObject,
      };
      return res.status(responseObject.code).send(responseObject);
    } else {
      //ToDo
    }
  } catch (err) {
    errorObject.push({ msg: err.message });
    responseObject = {
      code: 500,
      error: errorObject,
    };
    return res.status(responseObject.code).send(responseObject);
  }
};
