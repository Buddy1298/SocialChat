import expressValidator from "express-validator";
import { transValidation } from "../../lang/vi";

const {body} = expressValidator;

const updateInfo = [
  // key in req.body
  body("username", transValidation.update_username)
    .optional() // Dùng cho khi trường đó ko update
    .isLength({ min: 3, max: 16 })
    .matches(
      /^[\s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/
    ),
  body("gender", transValidation.update_gender)
    .optional()
    .isIn(["male", "female"]),
  body("address", transValidation.update_address)
    .optional()
    .isLength({ min: 3, max: 30 }),
  body("phone", transValidation.update_phone)
    .optional()
    .matches(/^(0)[0-9]{9,10}$/),
];

const updatePassword = [
  body("currentPassword", transValidation.password_incorrect)
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/),
  body("newPassword", transValidation.password_incorrect)
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/),
  body("confirmNewPassword", transValidation.password_confirmation_incorrect)
    .custom((value, { req }) => value === req.body.newPassword ),
];

export {
  updateInfo,
  updatePassword
};
