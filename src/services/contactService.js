import _ from "lodash";
import ContactModel from "../models/contactModel";
import UserModel from "../models/userModel";
import * as NotificationModel from "../models/notificationModel";
import * as MessageModel from "../models/messageModel";
import ChatGroupModel from "../models/chatGroupModel";

const LIMIT_NUMBER_TAKEN = 10;
const LIMIT_MESSAGES_TAKEN = 30;

const findUsersContact = (currentUserId, keyword) => {
  return new Promise(async (resolve, reject) => {
    let deprecatedUserIds = [currentUserId];
    let contactsByUser = await ContactModel.findAllByUser(currentUserId);
    contactsByUser.forEach((contact) => {
      deprecatedUserIds.push(contact.userId);
      deprecatedUserIds.push(contact.contactId);
    });

    deprecatedUserIds = _.uniqBy(deprecatedUserIds); // remove duplicate item
    let users = await UserModel.findAllForAddContact(deprecatedUserIds, keyword);
    resolve(users);
  });
};

const searchFriends = (currentUserId, keyword) => {
  return new Promise(async (resolve, reject) => {
    let friendIds = [];
    let friends = await ContactModel.getFriends(currentUserId);

    friends.forEach(item => {
      friendIds.push(item.userId);
      friendIds.push(item.contactId);
    });

    // Remove duplicate
    friendIds = [...new Set(friendIds)];
    
    friendIds = friendIds.filter(userId => userId != currentUserId);
    let users = await UserModel.findAllToAddGroupChat(friendIds, keyword);

    resolve(users);
  });
};

const findNameConversations = (currentUserId, keyword) => {
  return new Promise(async (resolve, reject) => {
    try {
      let friendIds = [];
      let friends = await ContactModel.getFriends(currentUserId);
  
      friends.forEach(item => {
        friendIds.push(item.userId);
        friendIds.push(item.contactId);
      });
  
      // Remove duplicate
      friendIds = [...new Set(friendIds)];
      
      friendIds = friendIds.filter(userId => userId != currentUserId);
      let users = await UserModel.findAllUserConversations(friendIds, keyword);

      let groups = await ChatGroupModel.findAllGroupConversations(currentUserId, keyword);
      let conversations = [...users, ...groups];      
      resolve(conversations);
    } catch (error) {
      reject(error);
    }
  });
};

const addNew = (currentUserId, contactId) => {
  return new Promise(async (resolve, reject) => {
    const contactExist = await ContactModel.checkExist(
      currentUserId,
      contactId
    );
    if (contactExist) {
      return reject(false);
    }

    // Create contact
    const newContactItem = {
      userId: currentUserId,
      contactId,
    };
    const newContact = await ContactModel.createNew(newContactItem);

    // Create notification
    const notificationItem = {
      senderId: currentUserId,
      receiverId: contactId,
      type: NotificationModel.types.ADD_CONTACT,
    };
    await NotificationModel.model.createNew(notificationItem);

    resolve(newContact);
  });
};

const removeContact = (currentUserId, contactId) => {
  return new Promise(async (resolve, reject) => {
    const removeContact = await ContactModel.removeContact(currentUserId, contactId);
    if (removeContact.n === 0) {
      return reject(false);
    }

    resolve(true);
  });
};

const removeRequestContactSent = (currentUserId, contactId) => {
  return new Promise(async (resolve, reject) => {
    const removeReq = await ContactModel.removeRequestContactSent(
      currentUserId,
      contactId
    );
    if (removeReq.n === 0) {
      return reject(false);
    }

    // Remove notification
    const notifType = NotificationModel.types.ADD_CONTACT;
    await NotificationModel.model.removeRequestContactSentNotification(currentUserId, contactId, notifType);

    resolve(true);
  });
};

const removeRequestContactReceived = (currentUserId, contactId) => {
  return new Promise(async (resolve, reject) => {
    const removeReq = await ContactModel.removeRequestContactReceived(
      currentUserId,
      contactId
    );
    if (removeReq.n === 0) {
      return reject(false);
    }

    // Remove notification (chức năng này chưa làm)
    // const notifType = NotificationModel.types.ADD_CONTACT;
    // await NotificationModel.model.removeRequestContactReceivedNotification(currentUserId, contactId, notifType);

    resolve(true);
  });
};

const approveRequestContactReceived = (currentUserId, contactId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let messages = await MessageModel.model.getMessagesInPersonal(currentUserId, contactId, LIMIT_MESSAGES_TAKEN);
      messages = _.reverse(messages);
      // Create new contact
      let approveReq = await ContactModel.approveRequestContactReceived(currentUserId, contactId);
      if (approveReq.nModified === 0) {
        return reject(false);
      }

      // Create notification
      let notificationItem = {
        senderId: currentUserId,
        receiverId: contactId,
        type: NotificationModel.types.APPROVE_CONTACT,
      };
      await NotificationModel.model.createNew(notificationItem);

      resolve(messages);
    } catch (error) {
      reject(error);
    }
    
  });
};

const getContacts = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const contacts = await ContactModel.getContacts(currentUserId, LIMIT_NUMBER_TAKEN)

      const users = contacts.map(async (contact) => {
        if (currentUserId == contact.userId) {
          return await UserModel.getNormalUserDataById(contact.contactId);
        } else {
          return await UserModel.getNormalUserDataById(contact.userId);
        }
      });
      
      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

const getContactsSent = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const contacts = await ContactModel.getContactsSent(currentUserId, LIMIT_NUMBER_TAKEN)

      const users = contacts.map(async (contact) => {
        return await UserModel.getNormalUserDataById(contact.contactId);
      });
      
      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

const getContactsReceived = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const contacts = await ContactModel.getContactsReceived(currentUserId, LIMIT_NUMBER_TAKEN)

      const users = contacts.map(async (contact) => {
        return await UserModel.getNormalUserDataById(contact.userId);
      });
      
      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

const countAllContacts = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let count = await ContactModel.countAllContacts(currentUserId);
      resolve(count);
    } catch (error) {
      reject(error);
    }
  });
};

const countAllContactsSent = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let count = await ContactModel.countAllContactsSent(currentUserId);
      resolve(count);
    } catch (error) {
      reject(error);
    }
  });
};

const countAllContactsReceived = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let count = await ContactModel.countAllContactsReceived(currentUserId);
      resolve(count);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Read more contacts (max 10 item one time)
 * @param {string} currentUserId 
 * @param {number} skipNumberContacts 
 */
const readMoreContacts = (currentUserId, skipNumberContacts) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newContacts = await ContactModel.readMoreContacts(currentUserId, skipNumberContacts, LIMIT_NUMBER_TAKEN);

      const users = newContacts.map(async (contact) => {
        if (currentUserId == contact.userId) {
          return await UserModel.getNormalUserDataById(contact.contactId);
        } else {
          return await UserModel.getNormalUserDataById(contact.userId);
        }
      });
      
      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};


/**
 * Read more contacts sent (max 10 item one time)
 * @param {string} currentUserId 
 * @param {number} skipNumberContacts 
 */
const readMoreContactsSent = (currentUserId, skipNumberContacts) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newContacts = await ContactModel.readMoreContactsSent(currentUserId, skipNumberContacts, LIMIT_NUMBER_TAKEN);

      const users = newContacts.map(async (contact) => {
        return await UserModel.getNormalUserDataById(contact.contactId);

      });
      
      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Read more contacts received (max 10 item one time)
 * @param {string} currentUserId 
 * @param {number} skipNumberContacts 
 */
const readMoreContactsReceived = (currentUserId, skipNumberContacts) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newContacts = await ContactModel.readMoreContactsReceived(currentUserId, skipNumberContacts, LIMIT_NUMBER_TAKEN);

      const users = newContacts.map(async (contact) => {
        return await UserModel.getNormalUserDataById(contact.userId);
      });
      
      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

const talkContact = (currentUserId, contactId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let contactConversation = await UserModel.getNormalUserDataById(contactId);
      
      contactConversation = contactConversation.toObject();
      let messages = await MessageModel.model.getMessagesInPersonal(currentUserId, contactConversation._id, LIMIT_MESSAGES_TAKEN);
      contactConversation.messages = _.reverse(messages);

      resolve(contactConversation);
    } catch (error) {
      reject(error);
    }
  });
};

const talkGroup = (groupId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let groupConversation = await ChatGroupModel.getChatGroupById(groupId);
      
      groupConversation = groupConversation.toObject();
      let messages = await MessageModel.model.getMessagesInGroup(groupConversation._id, LIMIT_MESSAGES_TAKEN);
      groupConversation.messages = _.reverse(messages);

      // get user info
      groupConversation.membersInfo = []; 
      for (const member of groupConversation.members) {
        let userInfo = await UserModel.getNormalUserDataById(member.userId);
        groupConversation.membersInfo.push(userInfo); 
      }

      resolve(groupConversation);
    } catch (error) {
      reject(error);
    }
  });
};

export {
  findUsersContact,
  addNew,
  removeRequestContactSent,
  getContacts,
  getContactsSent,
  getContactsReceived,
  countAllContacts,
  countAllContactsSent,
  countAllContactsReceived,
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
