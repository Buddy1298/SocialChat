import expressValidator from "express-validator";
import ejs from 'ejs';
import { promisify } from 'util';
import { bufferToBase64, convertTimestampHumanTime, lastItemFromArr } from '../helpers/clientHelper';
import { contact } from "../services";

const {validationResult} = expressValidator;
// Make ejs function renderFile avaiable with async await
const renderFile = promisify(ejs.renderFile).bind(ejs);

const findUsersContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(500).send(errorMessages);
  }

  try {
    const currentUserId = req.user._id;
    const keyword = req.params.keyword;

    const users = await contact.findUsersContact(currentUserId, keyword);
    return res.render("main/contact/sections/_findUsersContact", { users });
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

const searchFriends = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(500).send(errorMessages);
  }

  try {
    const currentUserId = req.user._id;
    const keyword = req.params.keyword;

    const users = await contact.searchFriends(currentUserId, keyword);
    return res.render("main/groupChat/sections/_searchFriends", { users });
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

const addNew = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const contactId = req.body.uid;

    const newContact = await contact.addNew(currentUserId, contactId)
    const response = { success: !!newContact };
    return res.status(200).send(response);
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

const removeContact = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const contactId = req.body.uid;

    const removeContact = await contact.removeContact(currentUserId, contactId)
    return res.status(200).send({ success: !!removeContact });
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

const removeRequestContactSent = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const contactId = req.body.uid;

    const removeReq = await contact.removeRequestContactSent(currentUserId, contactId)
    return res.status(200).send({ success: !!removeReq });
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

const removeRequestContactReceived = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const contactId = req.body.uid;

    const removeReq = await contact.removeRequestContactReceived(currentUserId, contactId)
    res.status(200).send({ success: !!removeReq });
  } catch (error) {
    console.error(error)
    res.status(500).send(error);
  }
};

const approveRequestContactReceived = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const contactId = req.body.uid;

    const messages = await contact.approveRequestContactReceived(currentUserId, contactId)

    res.status(200).send({ messages });
  } catch (error) {
    console.error(error)
    res.status(500).send(error);
  }
};

const readMoreContacts = async (req, res) => {
  try {
    // get skip number from query param
    let skipNumberContacts = +req.query.skipNumber;
    // get more item
    let newContactUsers = await contact.readMoreContacts(req.user._id, skipNumberContacts);

    // count all contacts
    let countAllContacts = await contact.countAllContacts(req.user._id);

    return res.status(200).send({newContactUsers, countAllContacts});
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

const readMoreContactsSent = async (req, res) => {
  try {
    // get skip number from query param
    let skipNumberContacts = +req.query.skipNumber;
    // get more item
    let newContactUsers = await contact.readMoreContactsSent(
      req.user._id,
      skipNumberContacts
    );

    // count all contacts sent
    let countAllContactsSent = await contact.countAllContactsSent(req.user._id);

    return res.status(200).send({newContactUsers, countAllContactsSent});
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

const readMoreContactsReceived = async (req, res) => {
  try {
    // get skip number from query param
    let skipNumberContacts = +req.query.skipNumber;
    // get more item
    let newContactUsers = await contact.readMoreContactsReceived(
      req.user._id,
      skipNumberContacts
    );

    // count all contacts received
    let countAllContactsReceived = await contact.countAllContactsReceived(req.user._id);

    return res.status(200).send({newContactUsers, countAllContactsReceived});
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

const talkContact = async (req, res) => {
  try {
    let currentUserId = req.user._id;
    let contactId = req.params.contactId;
    let contactConversation = await contact.talkContact(currentUserId, contactId);

    let dataToRender = {
      user: req.user,
      contactConversation,
      convertTimestampHumanTime,
      lastItemFromArr,
      bufferToBase64,
    };

    let leftSideData = await renderFile("src/views/main/talkContact/_leftSide.ejs", dataToRender);
    let rightSideData = await renderFile("src/views/main/talkContact/_rightSide.ejs", dataToRender);
    let imageModalData = await renderFile("src/views/main/talkContact/_imageModal.ejs", dataToRender);
    let attachmentModalData = await renderFile("src/views/main/talkContact/_attachmentModal.ejs", dataToRender);

    return res.status(200).send({
      leftSideData,
      rightSideData,
      imageModalData,
      attachmentModalData
    });
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

const talkGroup = async (req, res) => {
  try {
    let groupId = req.params.groupId;
    let groupConversation = await contact.talkGroup(groupId);

    let dataToRender = {
      user: req.user,
      groupConversation,
      convertTimestampHumanTime,
      lastItemFromArr,
      bufferToBase64,
    };

    let leftSideData = await renderFile("src/views/main/talkGroup/_leftSide.ejs", dataToRender);
    let rightSideData = await renderFile("src/views/main/talkGroup/_rightSide.ejs", dataToRender);
    let imageModalData = await renderFile("src/views/main/talkGroup/_imageModal.ejs", dataToRender);
    let attachmentModalData = await renderFile("src/views/main/talkGroup/_attachmentModal.ejs", dataToRender);
    let membersModalData = await renderFile("src/views/main/talkGroup/_membersModal.ejs", dataToRender);
    let addMemberModalData = await renderFile("src/views/main/talkGroup/_addMemberModal.ejs", dataToRender);
    
    return res.status(200).send({
      leftSideData,
      rightSideData,
      imageModalData,
      attachmentModalData,
      membersModalData,
      addMemberModalData
    });
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

const findNameConversations = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(500).send(errorMessages);
  }
  
  try {
    let keyword = req.query.keyword;
    let currentUserId = req.user._id;
    let conversations = await contact.findNameConversations(currentUserId, keyword);
    res.render("main/findNameConversations/_findNameConversations.ejs", { conversations });
  } catch (error) {
    console.error(error)
    res.status(500).send(error);
  }

};

export {
  findUsersContact,
  addNew,
  removeRequestContactSent,
  readMoreContacts,
  readMoreContactsSent,
  readMoreContactsReceived,
  removeRequestContactReceived,
  approveRequestContactReceived,
  removeContact,
  searchFriends,
  findNameConversations,
  talkContact,
  talkGroup,
};
