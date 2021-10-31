import passport from "passport";
import passportGoogle from "passport-google-oauth";
import { transError, transSuccess } from "../../../lang/vi";
import UserModel from "../../models/userModel";

const GoogleStrategy = passportGoogle.OAuth2Strategy;

const ggAppId = process.env.GG_ID;
const ggAppSecrect = process.env.GG_SECRECT;
const ggAppCallbackUrl = process.env.GG_CALLBACK_URL;

/**
 * Valid user account type: google
 */
const initPassportGoogle = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: ggAppId,
        clientSecret: ggAppSecrect,
        callbackURL: ggAppCallbackUrl,
        passReqToCallback: true,
        profileFields: ["emails", "gender", "displayName"],
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // Check user in database
          const user = await UserModel.findByGoogleId(profile.id);
          if (user) {
            return done(null, user);
          }
          
          // Create a new user
          const newUserItem = {
            username: profile.displayName,
            gender: profile.gender,
            local: {
              isActived: true,
            },
            google: {
              uid: profile.id,
              token: accessToken,
              email: profile.emails[0].value,
            },
          };
          const newUser = await UserModel.createNew(newUserItem);
          done(
            null,
            newUser,
            req.flash("success", transSuccess.loginSuccess(newUser.username))
          );
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
      let getChatGroupIds = await ChatGroupModel.getChatGroupIdsByUser(
        user._id
      );

      user = user.toObject();
      user.chatGroupIds = getChatGroupIds;

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  });
};

export default initPassportGoogle;
