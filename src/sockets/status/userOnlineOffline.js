import {
  pushSocketIdToArray,
  emitNotifyToArray,
  removeSocketIdFromArray,
} from "../../helpers/socketHelper";

/**
 * @param io from socket.io library
 */
const userOnlineOffline = (io) => {
  let clients = {};
  io.on("connection", (socket) => {
    clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id);

    socket.on("check-status", () => {
      let listUsersOnline = Object.keys(clients);
      // Step 01: Emit to user list online after login or F5
      socket.emit("server-send-list-users-online", listUsersOnline);

      // Step 02: Emit to all another users when has new user online
      socket.broadcast.emit(
        "server-send-when-new-user-online",
        socket.request.user._id
      );
    });

    socket.on("disconnect", () => {
      clients = removeSocketIdFromArray(
        clients,
        socket.request.user._id,
        socket
      );

      // Step 03: Emit to all another users when has new user offline
      socket.broadcast.emit(
        "server-send-when-new-user-offline",
        socket.request.user._id
      );
    });
  });
};

export default userOnlineOffline;
