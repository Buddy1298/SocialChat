function videoChat(divId) {
  $(`#video-chat-${divId}`).off("click").on("click", function () {
    let targetId = $(this).data("chat");
    let callerName = $(`#navbar-username`).text();

    let dataToEmit = {
      listenerId: targetId,
      callerName: callerName
    };

    // step 01 of caller
    socket.emit("caller-check-listener-online", dataToEmit);

  });
}

function playVideoStream(videoTagId, stream) {
  let video = document.getElementById(videoTagId);
  video.srcObject = stream;
  video.onloadeddata = function () {
    video.play();
  }
}

function closeVideoStream(stream) {
  return stream.getTracks().map(track => track.stop());
}

function notSupportVideoChat() {
  $(".video-chat-group").on("click", function () {
    alertify.warning("Tính năng này không khả dụng với nhóm trò truyện. Vui lòng thử lại tính năng này với trò chuyện cá nhân", 5);
  });
}

$(document).ready(function () {
  notSupportVideoChat();
  
  // step 02 of caller
  socket.on("server-send-listener-is-offline", function () {
    alertify.error("Người dùng này chưa online", 5);
  });
  
  let iceServerList = $("#ice-server-list").val();
  let getPeerId = "";
  const peer = new Peer({
    key: "peerjs",
    host: 'peerjs-server-trungquandev.herokuapp.com',
    port: 443,
    secure: true,
    config: { "iceServers": JSON.parse(iceServerList) }
    // debug: 3
  });
  
  peer.on("open", function (peerId) {
    getPeerId = peerId;
  });
  // peer.on('error', function(err) { console.error(err) });

  // step 03 of listener
  socket.on("server-request-peer-id-of-listener", function (response) {
    let listenerName = $(`#navbar-username`).text();
    let dataToEmit = {
      callerId: response.callerId,
      callerName: response.callerName,
      listenerId: response.listenerId,
      listenerName: listenerName,
      listenerPeerId: getPeerId,
    };

    // step 04 of listener
    socket.emit("listener-emit-peer-id-to-server", dataToEmit);
  });

  let timerInterval;

  // step 05 of caller
  socket.on("server-send-peer-id-of-listener-to-caller", function (response) {
    let dataToEmit = {
      callerId: response.callerId,
      callerName: response.callerName,
      listenerId: response.listenerId,
      listenerName: response.listenerName,
      listenerPeerId: response.listenerPeerId,
    };

    // step 06 of caller
    socket.emit("caller-request-call-to-server", dataToEmit);

    Swal.fire({
      title: `Đang gọi cho &nbsp; <span style="color: #82cc28;">${response.listenerName}</span> &nbsp; <i class="fa fa-volume-control-phone"></i>`,
      html: `
        Thời gian: <strong style="color: #d43f3a;"></strong> giây. <br/> <br/>
        <button id="btn-cancel-call" class="btn btn-danger">
          Hủy cuộc gọi.
        </button>
      `,
      backdrop: "rgba(85, 85, 85, .4)",
      width: "52rem",
      allowOutsideClick: false,
      timer: 30000, // 30s
      onBeforeOpen: () => {
        $("#btn-cancel-call").off("click").on("click", function name(params) {
          Swal.close();
          clearInterval(timerInterval);

          // step 07 of caller
         socket.emit("caller-cancel-request-call-to-server", dataToEmit);
        });

        if(Swal.getContent().querySelector !== null) {
          Swal.showLoading();
          timerInterval = setInterval(() => {
            Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
          }, 1000);
        }
      },
      onOpen: () => {
        // step 12 of caller
        socket.on("server-send-reject-call-to-caller", function (response) {
          Swal.close();
          clearInterval(timerInterval);

          Swal.fire({
            type: "info",
            title: `<span style="color: #82cc28;">${response.listenerName}</span> &nbsp; đã từ chối cuộc gọi.`,
            backdrop: "rgba(85, 85, 85, .4)",
            width: "52rem",
            allowOutsideClick: true,
            confirmButtonColor: "#82cc28",
            confirmButtonText: "Xác nhận",
          });
        });
      },
      onClose: () => {
        clearInterval(timerInterval);
      },
    }).then((result) => {
      return;
    });
  });

  // step 08 of listener
  socket.on("server-send-request-call-to-listener", function (response) {
    let dataToEmit = {
      callerId: response.callerId,
      callerName: response.callerName,
      listenerId: response.listenerId,
      listenerName: response.listenerName,
      listenerPeerId: response.listenerPeerId,
    };

    Swal.fire({
      title: `<span style="color: #82cc28;">${response.callerName}</span> &nbsp; muốn trò chuyện video với bạn &nbsp; <i class="fa fa-volume-control-phone"></i>`,
      html: `
        Thời gian: <strong style="color: #d43f3a;"></strong> giây. <br/> <br/>
        <button id="btn-accept-call" class="btn btn-success">
          Đồng ý
        </button>
        <button id="btn-reject-call" class="btn btn-danger">
          Từ chối
        </button>
      `,
      backdrop: "rgba(85, 85, 85, .4)",
      width: "52rem",
      allowOutsideClick: false,
      timer: 30000, // 30s
      onBeforeOpen: () => {
        $("#btn-reject-call").off("click").on("click", function name() {
          Swal.close();
          clearInterval(timerInterval);

          // step 10 of listener
          socket.emit("listener-reject-request-call-to-server", dataToEmit);
        });

        $("#btn-accept-call").off("click").on("click", function name() {
          Swal.close();
          clearInterval(timerInterval);

          // step 11 of listener
          socket.emit("listener-accept-request-call-to-server", dataToEmit);
        });

        if(Swal.getContent().querySelector !== null) {
          Swal.showLoading();
          timerInterval = setInterval(() => {
            Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
          }, 1000);
        }
      },
      onOpen: () => {
        // step 09 of listener
        socket.on("server-send-cancel-request-call-to-listener", function (response) {
          Swal.close();
          clearInterval(timerInterval);
        });
      },
      onClose: () => {
        clearInterval(timerInterval);
      },
    }).then((result) => {
      return;
    });
  });

  // step 13 of caller
  socket.on("server-send-accept-call-to-caller", function (response) {
    Swal.close();
    clearInterval(timerInterval);

    let getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);

    getUserMedia({ video: true, audio: true }, function(stream) {
      // Show modal streaming
      $("#streamModal").modal("show");

      // Play stream of caller
      playVideoStream("local-stream", stream);

      // Call to listener
      let call = peer.call(response.listenerPeerId, stream);

      // wait listen & play stream of listener
      call.on('stream', function(remoteStream) {
        // Play stream of listener
        playVideoStream("remote-stream", remoteStream);
      });

      // Close modal: remove stream
      $("#streamModal").on("hidden.bs.modal", function () {
        closeVideoStream(stream);

        Swal.fire({
          type: "info",
          title: `Đã kết thúc cuộc trò chuyện với &nbsp; <span style="color: #82cc28;">${response.listenerName}</span>`,
          backdrop: "rgba(85, 85, 85, .4)",
          width: "52rem",
          allowOutsideClick: true,
          confirmButtonColor: "#82cc28",
          confirmButtonText: "Xác nhận",
        });
      });

    }, function(err) {
      if (err.toString() === "NotAllowedError: Permission denied") {
        alertify.error("Xin lỗi, bạn đã tắt quyền truy cập vào thiết bị nghe gọi trên trình duyệt, vui lòng mở lại trong phần cài đặt của trình duyệt", 5);
      }

      if (err.toString() === "NotFoundError: Requested device not found") {
        alertify.error("Xin lỗi, không tìm thấy thiết bị nghe gọi trên máy tính của bạn", 5);
      }
    });
  });

  // step 14 of listener
  socket.on("server-send-accept-call-to-listener", function (response) {
    Swal.close();
    clearInterval(timerInterval);

    let getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);

    peer.on('call', function(call) {
      getUserMedia({video: true, audio: true}, function(stream) {
        // Show modal streaming
        $("#streamModal").modal("show");

        // Play stream of listener
        playVideoStream("local-stream", stream);

        call.answer(stream); // Answer the call with an A/V stream.
        call.on('stream', function(remoteStream) {
          // Play stream of caller
          playVideoStream("remote-stream", remoteStream);
        });

        // Close modal: remove stream
        $("#streamModal").on("hidden.bs.modal", function () {
          closeVideoStream(stream);

          Swal.fire({
            type: "info",
            title: `Đã kết thúc cuộc trò chuyện với &nbsp; <span style="color: #82cc28;">${response.callerName}</span>`,
            backdrop: "rgba(85, 85, 85, .4)",
            width: "52rem",
            allowOutsideClick: true,
            confirmButtonColor: "#82cc28",
            confirmButtonText: "Xác nhận",
          });
        });

      }, function(err) {
        if (err.toString() === "NotAllowedError: Permission denied") {
          alertify.error("Xin lỗi, bạn đã tắt quyền truy cập vào thiết bị nghe gọi trên trình duyệt, vui lòng mở lại trong phần cài đặt của trình duyệt", 5);
        }

        if (err.toString() === "NotFoundError: Requested device not found") {
          alertify.error("Xin lỗi, không tìm thấy thiết bị nghe gọi trên máy tính của bạn", 5);
        }
      });
    });
  });
});
