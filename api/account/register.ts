import dbConnect from "../_etc/util/dbConnect";
import { IError, IResponse } from "../_etc/interfaces";
import UserSchema from "../_etc/models/User";

module.exports = async (req, res) => {
  let errorObject: IError[] = [];
  let responseObject: IResponse;
  if (
    !req.body.username ||
    !req.body.password ||
    !req.body.passwordConfirmation
  ) {
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
    const { username, password, passwordConfirmation } = req.body;
    const result = await UserSchema.findOne({
      username,
    });
    if (result) {
      errorObject.push({
        msg: "The given username already exists",
      });
      responseObject = {
        code: 400,
        error: errorObject,
      };
      return res.status(responseObject.code).send(responseObject);
    }
    if (password !== passwordConfirmation) {
      errorObject.push({
        msg: "The given passwords dont match",
      });
      responseObject = {
        code: 400,
        error: errorObject,
      };
      return res.status(responseObject.code).send(responseObject);
    }
    if (password.length < 8) {
      errorObject.push({
        msg: "The given passwords needs do be at least 8 characters long",
      });
      responseObject = {
        code: 400,
        error: errorObject,
      };
      return res.status(responseObject.code).send(responseObject);
    }
    const user = {
      username,
      password,
    };

    const exist = await UserSchema.findOne({
      username,
    });

    if (exist) {
      errorObject.push({
        msg: "The given username already exists",
      });
      responseObject = {
        code: 400,
        error: errorObject,
      };
      return res.status(responseObject.code).send(responseObject);
    }

    const schemaResult = await new UserSchema(user).save();
    responseObject = {
      code: 200,
      data: schemaResult,
    };
    res.status(responseObject.code).send(responseObject);
  } catch (err) {
    errorObject.push({ msg: err.message });
    responseObject = {
      code: 500,
      error: errorObject,
    };
    return res.status(responseObject.code).send(responseObject);
  }
};
