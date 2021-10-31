import {
  pushSocketIdToArray,
  emitNotifyToArray,
  removeSocketIdFromArray,
} from "../../helpers/socketHelper";

/**
 * @param io from socket.io library
 */
const leaveGroupChat = (io) => {
  let clients = {};
  io.on("connection", (socket) => {
    clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id);
    // Join all room chat of user
    socket.request.user.chatGroupIds.map((group) => socket.join(group._id));

    socket.on("leave-group-chat", (data) => {
      // lave group chat
      socket.leave(data.groupChat._id);

      let response = {
        groupChat: data.groupChat,
        currentUserId: socket.request.user._id,
      };

      data.groupChat.members.forEach((member) => {
        if (
          clients[member.userId] &&
          member.userId != socket.request.user._id
        ) {
          emitNotifyToArray(
            clients,
            member.userId,
            io,
            "response-leave-group-chat",
            response
          );
        }
      });
    });

    socket.on("disconnect", () => {
      clients = removeSocketIdFromArray(
        clients,
        socket.request.user._id,
        socket
      );
    });
  });
};

export default leaveGroupChat;
