import expressValidator from "express-validator";
import ejs from 'ejs';
import fsExtra from 'fs-extra';
import multer from "multer";
import {promisify} from 'util';
import {transError} from "../../lang/vi";
import {app} from "../config/app";
import {message, contact, groupChat} from '../services';
import {convertTimestampHumanTime, lastItemFromArr, bufferToBase64} from '../helpers/clientHelper';

const {validationResult} = expressValidator;
// Make ejs function renderFile avaiable with async await
const renderFile = promisify(ejs.renderFile).bind(ejs);

// Handle emoji chat
const addNewTextEmoji = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(500).send(errorMessages);
  }

  try {
    let sender = {
      id: req.user._id,
      name: req.user.username,
      avatar: req.user.avatar
    };
    let { uid: receiverId, messageVal, isChatGroup } = req.body;

    let data = await message.addNewTextEmoji(sender, receiverId, messageVal, isChatGroup);
    data.sender = sender;
    
    return res.status(200).send(data);
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

// Handle images chat
const storageImageChat = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, app.image_message_directory);
  },
  filename: (req, file, cb) => {
    // Kiểm tra type của hình upload
    const math = app.image_message_type;
    if (math.indexOf(file.mimetype) === -1) {
      return cb(transError.image_message_type, null);
    }

    const imageName = file.originalname;
    cb(null, imageName);
  },
});

const imgMessageUploadFile = multer({
  storage: storageImageChat,
  limits: { fileSize: app.image_message_limit_size },
}).single("my-image-chat");

const addNewImage =  (req, res) => {
  imgMessageUploadFile(req, res, async (error) => {
    if (error) {
      if(error.message) {
        return res.status(500).send(transError.image_message_size);
      }
      return res.status(500).send(error);
    }

    try {
      let sender = {
        id: req.user._id,
        name: req.user.username,
        avatar: req.user.avatar
      };
      let receiverId = req.body.uid;
      let messageVal = req.file;
      let isChatGroup = req.body.isChatGroup;
      
      let data = await message.addNewImage(sender, receiverId, messageVal, isChatGroup);
      data.sender = sender;

      // Remove image, because this image is saved to mongodb
      await fsExtra.remove(`${app.image_message_directory}/${data.newMessage.file.fileName}`)

      return res.status(200).send(data);
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  });

};

// Handle attachment chat
const storageAttachmentChat = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, app.attachment_message_directory);
  },
  filename: (req, file, cb) => {
    const attachmentName = file.originalname;
    cb(null, attachmentName);
  },
});

const attachmentMessageUploadFile = multer({
  storage: storageAttachmentChat,
  limits: { fileSize: app.attachment_message_limit_size },
}).single("my-attachment-chat");

const addNewAttachment =  (req, res) => {
  attachmentMessageUploadFile(req, res, async (error) => {
    if (error) {
      if(error.message) {
        return res.status(500).send(transError.image_message_size);
      }
      return res.status(500).send(error);
    }

    try {
      let sender = {
        id: req.user._id,
        name: req.user.username,
        avatar: req.user.avatar
      };
      let receiverId = req.body.uid;
      let messageVal = req.file;
      let isChatGroup = req.body.isChatGroup;
      
      let data = await message.addNewAttachment(sender, receiverId, messageVal, isChatGroup);
      data.sender = sender;
  
      // Remove attachment, because this attachment is saved to mongodb
      await fsExtra.remove(`${app.attachment_message_directory}/${data.newMessage.file.fileName}`)

      return res.status(200).send(data);
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  });

};

const readMoreAllChat = async (req, res) => {
  try {
    // get skip number from query param
    let skipPersonal = +req.query.skipPersonal;
    let skipGroup = +req.query.skipGroup;

    let personalIds = req.query.personalIds;
    let groupIds = req.query.groupIds;
    personalIds = personalIds[0].split(",");
    groupIds = groupIds[0].split(",");

    // get more item
    let newAllConversations = await message.readMoreAllChat(req.user._id, skipPersonal, skipGroup, personalIds, groupIds);

    // count contact
    let countAllContacts = await contact.countAllContacts(req.user._id);
    // count chatGroup 
    let countAllChatGroups = await groupChat.countAllGroupChats(req.user._id);
    // count all conversations
    let countAllConversations = countAllChatGroups + countAllContacts;

    let dataToRender = {
      user: req.user,
      newAllConversations,
      convertTimestampHumanTime,
      lastItemFromArr,
      bufferToBase64,
    };

    let leftSideData = await renderFile("src/views/main/readMoreConversations/_leftSide.ejs", dataToRender);
    let rightSideData = await renderFile("src/views/main/readMoreConversations/_rightSide.ejs", dataToRender);
    let imageModalData = await renderFile("src/views/main/readMoreConversations/_imageModal.ejs", dataToRender);
    let attachmentModalData = await renderFile("src/views/main/readMoreConversations/_attachmentModal.ejs", dataToRender);
    let membersModalData = await renderFile("src/views/main/readMoreConversations/_membersModal.ejs", dataToRender);
    let addMemberModalData = await renderFile("src/views/main/readMoreConversations/_addMemberModal.ejs", dataToRender);

    return res.status(200).send({
      leftSideData,
      rightSideData,
      imageModalData,
      attachmentModalData,
      countAllConversations,
      membersModalData,
      addMemberModalData
    });
    
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

const readMore = async (req, res) => {
  try {
    // get skip number from query param
    let skipMessage = +req.query.skipMessage;
    let targetId = req.query.targetId;
    let chatInGroup = req.query.chatInGroup === "true";

    // get more item
    let newMessages = await message.readMore(req.user._id, skipMessage, targetId, chatInGroup);
    
    let dataToRender = {
      user: req.user,
      newMessages,
      bufferToBase64,
    };

    let rightSideData = await renderFile("src/views/main/readMoreMessages/_rightSide.ejs", dataToRender);
    let imageModalData = await renderFile("src/views/main/readMoreMessages/_imageModal.ejs", dataToRender);
    let attachmentModalData = await renderFile("src/views/main/readMoreMessages/_attachmentModal.ejs", dataToRender);

    return res.status(200).send({
      rightSideData,
      imageModalData,
      attachmentModalData,
    });
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

export {
  addNewTextEmoji,
  addNewImage,
  addNewAttachment,
  readMoreAllChat,
  readMore,
};
