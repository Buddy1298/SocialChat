import {
  pushSocketIdToArray,
  emitNotifyToArray,
  removeSocketIdFromArray,
} from "../../helpers/socketHelper";

/**
 * @param io from socket.io library
 */
const addMemberToGroupChat = (io) => {
  let clients = {};
  io.on("connection", (socket) => {
    clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id);
    // Join all room chat of user
    socket.request.user.chatGroupIds.map((group) => socket.join(group._id));

    socket.on("add-member-to-group-chat", (data) => {
      let response = data;

      data.group.members.forEach((member) => {
        if (
          clients[member.userId] &&
          member.userId != socket.request.user._id &&
          member.userId != data.member.id
        ) {
          emitNotifyToArray(
            clients,
            member.userId,
            io,
            "response-add-member-to-group-chat",
            response
          );
        }
      });
    });

    socket.on("add-group-chat-for-new-member", (data) => {
      let response = data;
      if (clients[data.member.id]) {
        emitNotifyToArray(
          clients,
          data.member.id,
          io,
          "response-add-group-chat-for-new-member",
          response
        );
      }
    });

    socket.on("member-added-to-group-chat", (data) => {
      socket.join(data.group._id);
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

export default addMemberToGroupChat;
