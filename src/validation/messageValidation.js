import expressValidator from "express-validator";
import { transValidation } from "../../lang/vi";

const {body} = expressValidator;

const checkMessageLength = [
  body("messageVal", transValidation.message_text_emoji_incorrect)
    .isLength({ min: 1, max: 400 })
];

export {
  checkMessageLength,
};
