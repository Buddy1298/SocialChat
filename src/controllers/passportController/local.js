import passport from "passport";
import passportLocal from "passport-local";
import { transError } from '../../../lang/vi';
import ChatGroupModel from '../../models/chatGroupModel';
import UserModel from '../../models/userModel.js';

const LocalStrategy = passportLocal.Strategy;

/**
 * Valid user account type: local
 */
const initPassportLocal = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        try {
          const user = await UserModel.findByEmail(email);
          if(!user) { // check email
            return done(null, false, req.flash("errors", transError.login_failed));
          }
          if(!user.local.isActived) { //check actived
            return done(null, false, req.flash("errors", transError.account_not_active));
          }

          const checkPassword = await user.comparePassword(password);
          if(!checkPassword) { // check password
            return done(null, false, req.flash("errors", transError.login_failed));
          }

          done(null, user);
        } catch (error) {
          console.error(error);
          done(null, false, req.flash("errors", transError.server_error));
        }
      }
    )
  );

  // Save userId to session
  passport.serializeUser((user, done) => done(null, user._id));

  // This is called by passport.session()
  // return userInfo to req.user
  passport.deserializeUser(async (id, done) => {
    try {
      let user = await UserModel.findUserByIdForSessionToUse(id);
      let getChatGroupIds = await ChatGroupModel.getChatGroupIdsByUser(user._id);

      user = user.toObject();
      user.chatGroupIds = getChatGroupIds;

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  });
};

export default initPassportLocal;
