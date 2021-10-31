import Axios from 'axios';
import { bufferToBase64, convertTimestampHumanTime, lastItemFromArr } from "../helpers/clientHelper";
import { contact, message, notification, groupChat } from "../services";
import * as twoFA from '../helpers/2fa';

const getICETurnServer = () => {
  return new Promise(async (resolve, reject) => {
    // Node Get ICE STUN and TURN list
    // let o = {
    //   format: "urls"
    // };
  
    // let bodyString = JSON.stringify(o);
    // let options = {
    //   url: "https://global.xirsys.net/_turn/awesome-chat",
    //   method: "PUT",
    //   data: {},
    //   headers: {
    //       Authorization: "Basic " + Buffer.from("hoanggaphan007:e8b3814e-c82f-11ea-9daf-0242ac150003").toString("base64"),
    //       "Content-Type": "application/json",
    //       "Content-Length": bodyString.length
    //   }
    // };

    // try {
    //   let response = await Axios(options);
    //   resolve(response.data.v.iceServers);
    // } catch (error) {
    //   console.error("Error when get ICE list: " + error);
    //   reject(error);
    // }
    resolve([]);
  });
};

const getHome = async (req, res) => {
  // only (10 items one time)
  let notifications = await notification.getNotification(req.user._id);
  // get amount notifications unread
  let countNotifUnread = await notification.countNotifUnread(req.user._id);

  // get contacts (10 item one time)
  let contacts = await contact.getContacts(req.user._id);
  // get contacts sent (10 item one time)
  let contactsSent = await contact.getContactsSent(req.user._id);
  // get contacts received (10 item one time)
  let contactsReceived = await contact.getContactsReceived(req.user._id);

  // count contact
  let countAllContacts = await contact.countAllContacts(req.user._id);
  let countAllContactsSent = await contact.countAllContactsSent(req.user._id);
  let countAllContactsReceived = await contact.countAllContactsReceived(req.user._id);

  // count chatGroup 
  let countAllChatGroups = await groupChat.countAllGroupChats(req.user._id);

  // count all conversations
  let countAllConversations = countAllChatGroups + countAllContacts;

  // all messages with conversation, max 30 item
  let allConversationWithMessages = await message.getAllConversationItems(req.user._id);
  
  // get ICE list from xirsys turn server
  let iceServerList = await getICETurnServer();

  // if user enable 2fa, generate qrcode image
  let QRCodeImage = "";
  if(req.user.is2FAEnabled) {
    const username = req.user.username;
    const serviceName = process.env.OTP_SERVICE_NAME;

    // generate secter
    const secret = twoFA.generateUniqueSecret();

    // generate otp token
    const otpToken = twoFA.generateOTPToken(username, serviceName, secret);

    // generate qrcode image
    QRCodeImage = await twoFA.generateQRCode(otpToken);
  } 

  res.render("main/home/home", {
    success: req.flash("success"),
    errors: req.flash("error"),
    user: req.user,
    QRCodeImage,
    notifications,
    countNotifUnread,
    contacts,
    contactsSent,
    contactsReceived,
    countAllContacts,
    countAllContactsSent,
    countAllContactsReceived,
    countAllConversations,
    allConversationWithMessages,
    bufferToBase64,
    lastItemFromArr,
    convertTimestampHumanTime,
    iceServerList: JSON.stringify(iceServerList),
  });
};

export {
  getHome,
};
