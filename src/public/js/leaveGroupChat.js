function leaveGroupChat() {
  $(".leave-group-chat").off("click").on("click", function (e) {
    let targetId = e.target.id;
    let groupChatName = $(`.right[data-chat = ${targetId}]`).find(".top .name").val();

    Swal.fire({
      title: `Bạn có chắc muốn rời khỏi nhóm ${groupChatName}?`,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#82cc28",
      cancelButtonColor: "#ff7675",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (!result.value) {
        return;
      }

      $.ajax({
        url: "/group-chat/leave-group-chat",
        type: "put",
        data: { groupId: targetId },
        success: function (data) {
          // step 01: handle leftSide
          $("#all-chat").find(`.people a[href = "#uid_${targetId}"]`).remove();

          // step 02: handle rightSide
          $("#screen-chat").find(`.right[data-chat = ${targetId}]`).remove();

          // step 03: handle imageModal
          $(`.modal[id = "imagesModal_${targetId}"]`).remove();

          // step 04: handle attachmentModal
          $(`.modal[id = "attachmentsModal_${targetId}"]`).remove();

          // step 05: handle membersModal
          $(`.modal[id = "membersModal_${targetId}"]`).remove();

          // step 06: emit real-time
          if (data.groupChat.members.length) {
            socket.emit("leave-group-chat", { groupChat: data.groupChat });
          }
        }
      });

    });
  });
}

socket.on("response-leave-group-chat", (response) => {
  $("#screen-chat")
    .find(`.number-members[href = "#membersModal_${response.groupChat._id}"] .show-number-members`)
    .text(response.groupChat.usersAmount);
  
  $(`#membersModal_${response.groupChat._id}`).find(`.member[id = ${response.currentUserId}]`).remove();
});

$(document).ready(function () {
  leaveGroupChat();
});
