import addNewContact from "./contact/addNewContact";
import removeRequestContactSent from './contact/removeRequestContactSent';
import removeRequestContactReceived from './contact/removeRequestContactReceived';
import approveRequestContactReceived from './contact/approveRequestContactReceived';
import removeContact from './contact/removeContact';
import chatTextEmoji from './chat/chatTextEmoji';
import chatImage from './chat/chatImage';
import chatAttachment from './chat/chatAttachment';
import typingOn from './chat/typingOn';
import typingOff from './chat/typingOff';
import chatVideo from './chat/chatVideo';
import userOnlineOffline from './status/userOnlineOffline';
import newGroupChat from './group/newGroupChat';
import leaveGroupChat from './group/leaveGroupChat';
import addMemberToGroupChat from './group/addMemberToGroupChat';

/**
 * @param io from socket.io library
 */
const initSockets = (io) => {
  addNewContact(io);
  removeRequestContactSent(io);
  removeRequestContactReceived(io);
  approveRequestContactReceived(io);
  removeContact(io);
  chatTextEmoji(io);
  typingOn(io);
  typingOff(io);
  chatImage(io);
  chatAttachment(io);
  chatVideo(io);
  userOnlineOffline(io);
  newGroupChat(io);
  leaveGroupChat(io);
  addMemberToGroupChat(io);
};

export default initSockets;
