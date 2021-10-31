import {
  pushSocketIdToArray,
  emitNotifyToArray,
  removeSocketIdFromArray,
} from "../../helpers/socketHelper";

/**
 * @param io from socket.io library
 */
const newGroupChat = (io) => {
  let clients = {};
  io.on("connection", (socket) => {
    clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id);
    // Join all room chat of user
    socket.request.user.chatGroupIds.map((group) => socket.join(group._id));

    socket.on("new-group-created", (data) => {
      // join new group chat
      socket.join(data.groupChat._id);

      let response = {
        groupChat: data.groupChat,
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
            "response-new-group-created",
            response
          );
        }
      });
    });

    socket.on("member-received-group-chat", (data) => {
      socket.join(data.groupChatId);
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

export default newGroupChat;
