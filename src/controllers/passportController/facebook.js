import passport from "passport";
import passportFacebook from "passport-facebook";
import { transError, transSuccess } from "../../../lang/vi";
import UserModel from "../../models/userModel";

const FacebookStrategy = passportFacebook.Strategy;

const fbAppId = process.env.FB_ID;
const fbAppSecrect = process.env.FB_SECRECT;
const fbAppCallbackUrl = process.env.FB_CALLBACK_URL;

/**
 * Valid user account type: facebook
 */
const initPassportFacebook = () => {
  passport.use(
    new FacebookStrategy(
      {
        clientID: fbAppId,
        clientSecret: fbAppSecrect,
        callbackURL: fbAppCallbackUrl,
        passReqToCallback: true,
        profileFields: ["emails", "gender", "displayName"]
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // Check user in database
          const user = await UserModel.findByFacebookId(profile.id);
          if (user) {
            return done(null, user);
          }

          // Check email in profile of user
          if (!profile.hasOwnProperty("emails")) {
            return done(null, false, req.flash("errors", transError.facebook_not_add_email));
          }

          // Create a new user
          const newUserItem = {
            username: profile.displayName,
            gender: profile.gender,
            local: {
              isActived: true,
            },
            facebook: {
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

export default initPassportFacebook;
