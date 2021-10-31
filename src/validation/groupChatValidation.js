import _ from 'lodash';
import expressValidator from "express-validator";
import { transValidation } from "../../lang/vi";

const {body, query} = expressValidator;

const addNewGroup = [
  body("arrIds", transValidation.add_new_group_users_incorrect)
    .custom((value) => {
      if (!Array.isArray(value)) {
        return false;
      }
      value = _.uniqBy(value, "userId");
      if (value.length < 2) {
        return false;
      }
      return true;
    })
  ,
  body("groupChatName", transValidation.add_new_group_name_incorrect)
    .matches(
      /^[s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/
    )
    .isLength({ min: 5, max: 30 }),
  query("keyword", transValidation)
];

const findUsersToAddGroupChat = [
  query("keyword", transValidation.keyword_find_user_conversations)
    .isLength({ min: 1, max: 16 })
    .matches(/^[s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/)
];

export {
  addNewGroup,
  findUsersToAddGroupChat
};
