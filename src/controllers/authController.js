import expressValidator from "express-validator";
import { transSuccess, transError } from "../../lang/vi";
import { auth } from "../services";
import passport from 'passport';

const { validationResult } = expressValidator;

const getLoginRegister = (req, res) => {
  res.render("auth/master", {
    errors: req.flash("errors"),
    success: req.flash("success"),
  });
};

const getVerifyAccount = async (req, res) => {
  try {
    const verifySuccess = await auth.verifyAccount(req.params.token);
    req.flash("success", verifySuccess);
    res.redirect("/login-register");
  } catch (error) {
    req.flash("errors", error);
    res.redirect("/login-register");
  }
};

const getLogout = (req, res) => {
  req.logout(); // remove session passport user
  req.flash("success", transSuccess.logout_success);
  res.redirect("/login-register");
};

const checkLoggedOut = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
};

const checkLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login-register");
  }
  next();
};

const postRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    req.flash("errors", errorMessages);
    return res.redirect("/login-register");
  }

  try {
    const createUserSuccess = await auth.register(
      req.body.email,
      req.body.gender,
      req.body.password,
      req.protocol,
      req.get("host")
    );
    req.flash("success", createUserSuccess);
    res.redirect("/login-register");
  } catch (error) {
    req.flash("errors", error);
    res.redirect("/login-register");
  }
};

const postLoginLocal = async (req, res) => {
  passport.authenticate('local', (err, user) => {
    if (err) return res.status(500).send(err);
    
    // login fail
    if (!user) return res.redirect('/login-register');
    
    // verify 2fa
    if (user.is2FAEnabled) {
      return res.redirect(`/verify-2fa/${user._id}`);
    }
    
    // login success will save info into req.user
    req.logIn(user, (err) => {
      if (err) return res.status(500).send(err);
      req.flash("success", transSuccess.loginSuccess(user.username));
      return res.redirect('/');
    });

  })(req, res);
};

const postLoginFacebook = async (req, res) => {
  passport.authenticate('facebook', (err, user) => {
    if (err) return res.status(500).send(err);
    
    // login fail
    if (!user) return res.redirect('/login-register');
    
    // verify 2fa
    if (user.is2FAEnabled) {
      return res.redirect(`/verify-2fa/${user._id}`);
    }
    
    // login success will save info into req.user
    req.logIn(user, (err) => {
      if (err) return res.status(500).send(err);
      req.flash("success", transSuccess.loginSuccess(user.username));
      return res.redirect('/');
    });

  })(req, res);
};

const postLoginGoogle = async (req, res) => {
  passport.authenticate('google', (err, user) => {
    if (err) return res.status(500).send(err);
    
    // login fail
    if (!user) return res.redirect('/login-register');
    
    // verify 2fa
    if (user.is2FAEnabled) {
      return res.redirect(`/verify-2fa/${user._id}`);
    }
    
    // login success will save info into req.user
    req.logIn(user, (err) => {
      if (err) return res.status(500).send(err);
      req.flash("success", transSuccess.loginSuccess(user.username));
      return res.redirect('/');
    });

  })(req, res);
};

const getVerify2FAPage = (req, res) => {
  res.render("auth/verify2FA", {
    userId: req.params.userId,
    errors: req.flash("errors"),
  });
};

const postVerify2FA = async (req, res) => {
  const { otpToken } = req.body;
  const { userId } = req.params;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    req.flash("errors", errorMessages);
    return res.redirect(`/verify-2fa/${userId}`);
  }

  try {
    const {user, isValid} = await auth.postVerify2FA(userId, otpToken);

    if (isValid) {
      req.login(user, (err) => {
        if (err) {
          return res.status(500).send(error);
        }
        req.flash("success", transSuccess.loginSuccess(user.username));
        return res.redirect("/");
      });
    } else {
      req.flash("errors", transError.otp_incorrect);
      return res.redirect(`/verify-2fa/${userId}`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

const postEnable2FA = async (req, res) => {
  try {
    const { user } = req;
    const result = await auth.postEnable2FA(user);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const postDisableFA = async (req, res) => {
  try {
    const { user } = req;
    const status = await auth.postDisableFA(user);
    res.status(200).send({ success: status });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const tutorialSettingFacebook = (req, res) => {
  res.render('auth/tutorialSettingFacebook.ejs');
};

export {
  getLoginRegister,
  getVerifyAccount,
  postRegister,
  getLogout,
  checkLoggedIn,
  checkLoggedOut,
  postLoginLocal,
  postLoginFacebook,
  postLoginGoogle,
  getVerify2FAPage,
  postVerify2FA,
  postEnable2FA,
  postDisableFA,
  tutorialSettingFacebook
};
