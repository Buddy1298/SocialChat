import _ from 'lodash';
import ChatGroupModel from '../models/chatGroupModel';
import UserModel from '../models/userModel';
import * as MessageModel from "../models/messageModel";
import ContactModel from '../models/contactModel';

const LIMIT_MESSAGES_TAKEN = 30;

let addNewGroup = (currentUserId, arrayMemberIds, groupChatName) => {
  return new Promise(async (resolse, reject) => {
    try {
      // add current user to array members
      arrayMemberIds.unshift({ userId: currentUserId.toString() });
      arrayMemberIds = _.uniqBy(arrayMemberIds, "userId");

      let newGroupItem = {
        userId: currentUserId.toString(),
        name: groupChatName,
        usersAmount: arrayMemberIds.length,
        members: arrayMemberIds,
      };

      let newGroup = await ChatGroupModel.createNew(newGroupItem);
      
      newGroup = newGroup.toObject();

      // get user info
      newGroup.membersInfo = []; 
      for (const member of newGroup.members) {
        let userInfo = await UserModel.getNormalUserDataById(member.userId);
        newGroup.membersInfo.push(userInfo); 
      }

      resolse(newGroup);
    } catch (error) {
      
    }
  });
}

let countAllGroupChats = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let count = await ChatGroupModel.countAllChatGroups(currentUserId);
      resolve(count);
    } catch (error) {
      reject(error);
    }
  });
};

let leaveGroupChat = (currentUserId, groupId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let groupChatById = await ChatGroupModel.findGroupChatById(groupId);
      let members = groupChatById.members;
      
      // remove member from groupChat
      members = members.filter(member => member.userId != currentUserId);

      // remove groupChat if not have member in groupChat
      if (members.length === 0) {
        let removeGroupChat = await ChatGroupModel.removeGroupChatById(groupId);
        if(removeGroupChat.n === 0) {
          reject(false);
        }
        resolve([]);
      }

      let newGroupChat = await ChatGroupModel.updateMembersInGroupChat(groupId, members);
      
      resolve(newGroupChat);
    } catch (error) {
      reject(error);
    }
  });
};

let findUsersToAddGroupChat = (userId, groupId, keyword) => {
  return new Promise(async (resolve, reject) => {
    try {
      let groupChat = await ChatGroupModel.getChatGroupById(groupId);
      let memberIds = groupChat.members.map(member => member.userId);
      let friends = await ContactModel.findContactsToAddGroupChat(userId, memberIds);
      
      let userIds = []; 
      friends.forEach(friend => {
        userIds.push(friend.userId);
        userIds.push(friend.contactId);
      });

      // remove duplicate item and not like id user
      userIds = userIds.filter(id => id != userId); 

      let usersInfo = await UserModel.findUsersToAddGroupChat(userIds, keyword);
      resolve(usersInfo);
    } catch (error) {
      reject(error);
    }
  });
};

let addMemberToGroupChat = (groupId, memberId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let groupChat = await ChatGroupModel.getChatGroupById(groupId);
      let members = [...groupChat.members, { userId: memberId }];
      let newGroupChat = await ChatGroupModel.updateMembersInGroupChat(groupId, members);
      // return group conversation with message
      newGroupChat = newGroupChat.toObject();
      let messages = await MessageModel.model.getMessagesInGroup(groupId, LIMIT_MESSAGES_TAKEN);
      newGroupChat.messages = _.reverse(messages);

      // get member info
      newGroupChat.membersInfo = []; 
      for (const member of newGroupChat.members) {
        let userInfo = await UserModel.getNormalUserDataById(member.userId);
        newGroupChat.membersInfo.push(userInfo); 
      }

      resolve(newGroupChat);
    } catch (error) {
      reject(error);
    }
  });
}

export {
  addNewGroup,
  countAllGroupChats,
  leaveGroupChat,
  findUsersToAddGroupChat,
  addMemberToGroupChat
}
