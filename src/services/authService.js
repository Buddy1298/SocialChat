import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import UserModel from "../models/userModel";
import { transError, transSuccess, transMail } from "../../lang/vi";
import sendMail from "../config/mailer";
import * as twoFA from '../helpers/2fa';

const saltRounds = 10;

const register = (email, gender, password, protocol, host) => {
  return new Promise(async (resolve, reject) => {
    const userByEmail = await UserModel.findByEmail(email);
    if (userByEmail) {
      if (userByEmail.deletedAt) {
        return reject(transError.account_removed);
      }
      if (!userByEmail.local.isActived) {
        return reject(transError.account_not_active);
      }
      return reject(transError.account_in_use);
    }

    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const userItem = {
      username: email.split("@")[0],
      gender,
      local: {
        email,
        password: hashedPassword,
        verifyToken: uuidv4(),
      },
    };

    const user = await UserModel.createNew(userItem);
    // send email
    const linkVerify = `${protocol}://${host}/verify/${user.local.verifyToken}`;
    sendMail(email, transMail.subject, transMail.template(linkVerify))
      .then((success) => {
        resolve(transSuccess.userCreated(user.local.email));
      })
      .catch(async (error) => {
        console.log(error);
        //remove user when send email fail
        await UserModel.deleteById(user._id);
        reject(transMail.send_failed);
      });
  });
};

const verifyAccount = (token) => {
  return new Promise(async (resolve, reject) => {
    const userByToken = await UserModel.findByToken(token);
    if(!userByToken) {
      return reject(transError.token_undefined);
    }

    await UserModel.verify(token);
    resolve(transSuccess.account_actived);
  });
};

const postVerify2FA = (userId, otpToken) => {
  return new Promise(async (resolve, reject) => {
    const user = await UserModel.getSecretToVerify2FA(userId);
    const isValid = twoFA.verifyOTPToken(otpToken, user.secret);
    resolve({user, isValid});
  });
};

const postEnable2FA = (user) => {
  return new Promise(async (resolve, reject) => {
    if(user.is2FAEnabled) {
      return reject(transError.account_enabled_2fa);
    } 

    const username = user.username;
    const serviceName = process.env.OTP_SERVICE_NAME;

    // generate secter
    const secret = twoFA.generateUniqueSecret();

    // generate otp token
    const otpToken = twoFA.generateOTPToken(username, serviceName, secret);

    // generate qrcode image
    const QRCodeImage = await twoFA.generateQRCode(otpToken);

    // Update user secret
    await UserModel.updateUser(user._id, {is2FAEnabled: true, secret});

    resolve(QRCodeImage);
  });
};

const postDisableFA = (user) => {
  return new Promise(async (resolve, reject) => {
    if(!user.is2FAEnabled) {
      return reject(transError.account_disabled_2fa);
    } 

    // Update user secret
    await UserModel.updateUser(user._id, {is2FAEnabled: false, secret: null});
    resolve(true);
  });
};

export {
  register,
  verifyAccount,
  postVerify2FA,
  postEnable2FA,
  postDisableFA
};
