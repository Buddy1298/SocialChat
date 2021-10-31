import bcrypt from 'bcrypt';
import UserModel from '../models/userModel';
import { transError } from '../../lang/vi';

const saltRounds = 10;

/**
 * Update userInfo
 * @param {userId} id 
 * @param {data update} item 
 */
const updateUser = (id, item) => {
  return UserModel.updateUser(id, item);
}
/**
 * Update password for user
 * @param {userId} id 
 * @param {data update} dataUpdate 
 */
const updatePassword = (id, dataUpdate) => {
  return new Promise(async (resolve, reject) => {
    const currentUser = await UserModel.findUserById(id);
    if (!currentUser) {
      reject(transError.account_undefined)
    }

    const checkCurrentPassword = await currentUser.comparePassword(dataUpdate.currentPassword);
    if (!checkCurrentPassword) {
      return reject(transError.user_current_password_failed)
    }

    const hashedPassword = bcrypt.hashSync(dataUpdate.newPassword, saltRounds);
    await UserModel.updatePassword(id, hashedPassword);
    resolve(true);
  })
}

export {
  updateUser,
  updatePassword
}
