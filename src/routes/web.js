import express from 'express';
import passport from 'passport';
import { auth, home, user, contact, notification, message, groupChat } from '../controllers';
import { authValid, userValid, contactValid, messageValid, groupChatValid } from '../validation';
import initPassportLocal from '../controllers/passportController/local';
import initPassportFacebook from '../controllers/passportController/facebook';
import initPassportGoogle from '../controllers/passportController/google';

// Init all passport
initPassportLocal();
initPassportFacebook();
initPassportGoogle();

const router = express.Router();

/**
 * Init all routes
 * @params app from exactly express
 */
const initRoutes = (app) => {
  router.get("/", auth.checkLoggedIn,  home.getHome);
  router.get("/logout", auth.checkLoggedIn, auth.getLogout);

  router.get("/contact/find-users/:keyword", auth.checkLoggedIn, contactValid.findUsersContact ,contact.findUsersContact);
  router.get("/contact/search-friends/:keyword", auth.checkLoggedIn, contactValid.searchFriends ,contact.searchFriends);
  router.get("/contact/find-name-conversations", auth.checkLoggedIn, contactValid.findNameConversations, contact.findNameConversations);
  router.get("/contact/read-more-contacts", auth.checkLoggedIn, contact.readMoreContacts);
  router.get("/contact/read-more-contacts-sent", auth.checkLoggedIn, contact.readMoreContactsSent);
  router.get("/contact/read-more-contacts-received", auth.checkLoggedIn, contact.readMoreContactsReceived);
  router.get("/contact/talk-contact/:contactId", auth.checkLoggedIn, contact.talkContact);
  router.get("/contact/talk-group/:groupId", auth.checkLoggedIn, contact.talkGroup);
  router.post("/contact/add-new", auth.checkLoggedIn, contact.addNew);
  router.delete("/contact/remove-contact", auth.checkLoggedIn, contact.removeContact);
  router.delete("/contact/remove-request-contact-sent", auth.checkLoggedIn, contact.removeRequestContactSent);
  router.delete("/contact/remove-request-contact-received", auth.checkLoggedIn, contact.removeRequestContactReceived);
  router.put("/contact/approve-request-contact-received", auth.checkLoggedIn, contact.approveRequestContactReceived);
  
  router.get("/notification/read-more", auth.checkLoggedIn, notification.readMore);
  router.put("/notification/mark-all-as-read", auth.checkLoggedIn, notification.markAllAsRead);

  router.put("/user/update-avatar", auth.checkLoggedIn, user.updateAvatar);
  router.put("/user/update-info", auth.checkLoggedIn, userValid.updateInfo, user.updateInfo);
  router.put("/user/update-password", auth.checkLoggedIn, userValid.updatePassword , user.updatePassword);

  router.get("/message/read-more-all-chat", auth.checkLoggedIn, message.readMoreAllChat);
  router.get("/message/read-more", auth.checkLoggedIn, message.readMore);
  router.post("/message/add-new-text-emoji", auth.checkLoggedIn, messageValid.checkMessageLength, message.addNewTextEmoji)
  router.post("/message/add-new-image", auth.checkLoggedIn, message.addNewImage);
  router.post("/message/add-new-attachment", auth.checkLoggedIn, message.addNewAttachment);

  router.post("/group-chat/add-new", auth.checkLoggedIn, groupChatValid.addNewGroup, groupChat.addNewGroup);
  router.put("/group-chat/leave-group-chat", auth.checkLoggedIn, groupChat.leaveGroupChat);
  router.get("/group-chat/find-user-to-add-group-chat", auth.checkLoggedIn, groupChatValid.findUsersToAddGroupChat, groupChat.findUsersToAddGroupChat);
  router.put("/group-chat/add-member-to-group-chat", auth.checkLoggedIn, groupChat.addMemberToGroupChat);

  router.get("/login-register", auth.checkLoggedOut, auth.getLoginRegister);
  router.get("/verify/:token", auth.checkLoggedOut, auth.getVerifyAccount);

  router.get("/auth/facebook", auth.checkLoggedOut, passport.authenticate("facebook", {scope: ["email"] }));
  router.get("/auth/facebook/callback", auth.checkLoggedOut, auth.postLoginFacebook);

  router.get("/auth/google", auth.checkLoggedOut, passport.authenticate("google", { scope: ["email", "profile"] }));
  router.get("/auth/google/callback", auth.checkLoggedOut, auth.postLoginGoogle);

  router.post("/register", auth.checkLoggedOut, authValid.register , auth.postRegister);
  router.post("/login", auth.checkLoggedOut, auth.postLoginLocal);

  router.get('/verify-2fa/:userId', auth.checkLoggedOut, auth.getVerify2FAPage);
  router.post('/verify-2fa/:userId', auth.checkLoggedOut, authValid.verify2FA, auth.postVerify2FA);

  router.post('/enable-2fa', auth.checkLoggedIn, auth.postEnable2FA);
  router.post('/disable-2fa', auth.checkLoggedIn, auth.postDisableFA);

  router.get('/tutorial-setting-facebook', auth.checkLoggedOut, auth.tutorialSettingFacebook);

  return app.use("/", router);
}

export default initRoutes;
