import expressValidator from "express-validator";
import { transValidation } from "../../lang/vi";
import objectid from "objectid";

const { body, param } = expressValidator;

const register = [
  body("email", transValidation.email_incorrect).isEmail().trim(),
  body("gender", transValidation.gender_incorrect).isIn(["male", "female"]),
  body("password", transValidation.password_incorrect)
    .isLength({ min: 8 })
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/
    ),
  body(
    "password_confirmation",
    transValidation.password_confirmation_incorrect
  ).custom((value, { req }) => {
    return value === req.body.password;
  }),
];

const verify2FA = [
  body("otpToken")
    .isNumeric()
    .withMessage(transValidation.otpToken_number_incorrect)
    .isLength({ min: 6, max: 6 })
    .withMessage(transValidation.otpToken_length_incorrect),
  param("userId", transValidation.param_incorrect).custom((param) =>
    objectid.isValid(param)
  ),
];

export { register, verify2FA };
