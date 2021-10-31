function addMemberToGroup(groupId) {
  $(".btn-add-member").off("click").on("click", function (e) {
    let memberId = e.target.getAttribute("data-uid");
    let memberName = $(`#addMemberModal_${groupId}`).find(`.member-item[data-uid = ${memberId}] .member-name p`).text();
    let memberAvatar = $(`#addMemberModal_${groupId}`).find(`.member-item[data-uid = ${memberId}] .member-avatar img`).attr("src");

    Swal.fire({
      title: `Bạn có chắc muốn thêm ${memberName} vào nhóm?`,
      type: "info",
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
        url: "/group-chat/add-member-to-group-chat",
        type: "put",
        data: { memberId, groupId },
        success: function (data) {
          let member = {
            id: memberId,
            name: memberName,
            avatar: memberAvatar
          }
          let dataToEmit = { member, group: data }

          $(`#addMemberModal_${data._id}`).find(`.member-item[data-uid = ${member.id}]`).remove();
          
          let memberHtml = `
            <div id="${member.id}" class="col-sm-2 member">
              <div class="thumbnail">
                <img class="member-avatar" src="${member.avatar}" alt="">
                <div class="caption">
                  <p class="member-name ${member.id === data.userId ? "admin": ""}">${member.name}</p>
                  <div class="member-talk" data-uid="${member.id}">
                    Trò chuyện
                  </div> 
              </div>
              </div>
            </div>
          `;
          $(`#membersModal_${data._id}`).find(`.all-members .row`).append(memberHtml);

          $(`#screen-chat`).find(`.right[data-chat = ${data._id}] .show-number-members`).text(data.usersAmount);
          talkWithMember();

          // emit to all current member
          socket.emit("add-member-to-group-chat", dataToEmit);

          // emit to new member
          socket.emit("add-group-chat-for-new-member", dataToEmit);
        }
      });
    });

  });
}

function findUsersToAddGroupChat(e, divId) {
  if (e.which === 13 || e.type === "click") {
    let keyword = $(`.input-find-member[data-uid = ${divId}]`).val();
    const regKeyword = new RegExp(/^[s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/)

    if (keyword.length < 1 || keyword.length > 16 || !regKeyword.test(keyword)) {
      alertify.error("Nội dung tìm kiếm không hợp lệ, giới hạn từ 1 - 16 kí tự và không chứa kí tự đặc biệt.", 5);
      return;
    }

    $.get(`/group-chat/find-user-to-add-group-chat?groupId=${divId}&keyword=${keyword}`, function (data) {
      if(!data.trim()) {
        return alertify.error("Không còn bạn bè để thêm vào nhóm!", 5);
      }

      $(`#addMemberModal_${divId}`).find(".member-list").html(data);
      addMemberToGroup(divId);
    });
  }
}

function bindEventfindUsersToAddGroupChat(divId) {
  $(".input-find-member").off("keypress").on("keypress", (e) => findUsersToAddGroupChat(e, divId));
  $(".btn-find-member").off("click").on("click", (e) => findUsersToAddGroupChat(e, divId));
}

socket.on("response-add-member-to-group-chat", (response) => {
  $(`#addMemberModal_${response.group._id}`).find(`.member-item[data-uid = ${response.member.id}]`).remove();
  
  let memberHtml = `
            <div id="${response.member.id}" class="col-sm-2 member">
              <div class="thumbnail">
                <img class="member-avatar" src="${response.member.avatar}" alt="">
                <div class="caption">
                  <p class="member-name ${response.member.id === response.group.userId ? "admin": ""}">${response.member.name}</p>
                  <div class="member-talk" data-uid="${response.member.id}">
                    Trò chuyện
                  </div> 
              </div>
              </div>
            </div>
          `;
  $(`#membersModal_${response.group._id}`).find(`.all-members .row`).append(memberHtml);

  $(`#screen-chat`).find(`.right[data-chat = ${response.group._id}] .show-number-members`).text(response.group.usersAmount);
  talkWithMember();

});

socket.on("response-add-group-chat-for-new-member", (response) => {
  let currentUserId = $("#dropdown-navbar-user").data("uid");

  // Step 01: handle leftSide.js
  let subUsername = response.group.name;
  if (subUsername.length > 15) {
    subUsername = subUsername.substr(0, 14) + "...";
  }
  let leftSideData = "";
  let lastMess = lastItemFromArr(response.group.messages);

  if (lastMess.messageType === "text" || !lastMess.length) {
    leftSideData = `
        <a href="#uid_${response.group._id}" class="room-chat" data-target="#to_${response.group._id}">
          <li class="person group-chat" data-chat="${response.group._id}">
            <div class="left-avatar">
              <img src="images/users/group-avatar.png" alt="" />
            <span class="name">
              <span class="group-chat-name">
                ${subUsername}
              </span> 
            </span>
            <span class="time">
              ${lastMess.length ? convertTimestampHumanTime(lastMess.createdAt) : ""}
            </span>
            <span class="preview convert-emoji">
              ${lastMess.text || ""}
            </span>
          </li>
        </a>`;
  }
  
  if (lastMess.messageType === "image") {
    leftSideData = `
        <a href="#uid_${response.group._id}" class="room-chat" data-target="#to_${response.group._id}">
          <li class="person group-chat" data-chat="${response.group._id}">
            <div class="left-avatar">
              <img src="images/users/group-avatar.png" alt="" />
            <span class="name">
              <span class="group-chat-name">
                ${subUsername}
              </span> 
            </span>
            <span class="time">
              ${convertTimestampHumanTime(lastMess.createdAt)}
            </span>
            <span class="preview convert-emoji">
              Hình ảnh...
            </span>
          </li>
        </a>`;
  }

  if (lastMess.messageType === "file") {
    leftSideData = `
        <a href="#uid_${response.group._id}" class="room-chat" data-target="#to_${response.group._id}">
          <li class="person group-chat" data-chat="${response.group._id}">
            <div class="left-avatar">
              <img src="images/users/group-avatar.png" alt="" />
            <span class="name">
              <span class="group-chat-name">
                ${subUsername}
              </span> 
            </span>
            <span class="time">
              ${convertTimestampHumanTime(lastMess.createdAt)}
            </span>
            <span class="preview convert-emoji">
              Tệp đính kèm...
            </span>
          </li>
        </a>`;
  }

  $("#all-chat").find("ul").prepend(leftSideData);

  // Step 02: handle rightSide.ejs
  let rightSideData = `
  <div class="right tab-pane" data-chat="${response.group._id}" id="to_${response.group._id}">
    <div class="top">
      <span>To: 
        <span class="name">${response.group.name}</span>
      </span>
      <span class="chat-menu-right">
        <a class="leave-group-chat" id="${response.group._id}" href="javascript:void(0)">
          Rời nhóm
          <i class="fa fa-sign-out"></i>
        </a>
      </span>
      <span class="chat-menu-right">
          <a href="javascript:void(0)">&nbsp;</a>
      </span>
      <span class="chat-menu-right">
        <a href="#addMemberModal_${response.group._id}" data-toggle="modal">
          <span>Thêm thành viên</span>
          <i class="fa fa-plus-square"></i>
        </a>
      </span>
      <span class="chat-menu-right">
          <a href="javascript:void(0)">&nbsp;</a>
      </span>
      <span class="chat-menu-right">
        <a href="#attachmentsModal_${response.group._id}" class="show-attachments" data-toggle="modal">
          Tệp đính kèm
          <i class="fa fa-paperclip"></i>
        </a>
      </span>
      <span class="chat-menu-right">
        <a href="javascript:void(0)">&nbsp;</a>
      </span>
      <span class="chat-menu-right">
        <a href="#imagesModal_${response.group._id}" class="show-images" data-toggle="modal">
          Hình ảnh
          <i class="fa fa-photo"></i>
        </a>
      </span>
      <span class="chat-menu-right">
        <a href="javascript:void(0)">&nbsp;</a>
      </span>
      <span class="chat-menu-right">
        <a href="#membersModal_${response.group._id}" class="number-members" data-toggle="modal">
          <span class="show-number-members" >${response.group.usersAmount}</span>
          <span>Thành viên</span>
          <i class="fa fa-users"></i>
        </a>
      </span>
      <span class="chat-menu-right">
        <a href="javascript:void(0)">&nbsp;</a>
      </span>
      <span class="chat-menu-right">
        <a href="javascript:void(0)" class="number-messages" data-toggle="modal">
          <span class="show-number-messages" >${response.group.messagesAmount}</span>
          <span>Tin nhắn</span>
          <i class="fa fa-comment-o"></i>
        </a>
      </span>
    </div>
    <div class="content-chat">
      <div class="chat chat-in-group" data-chat="${response.group._id}">
        <img src="images/chat/message-loading.gif" class="message-loading" />
      </div>
    </div>
    <div class="write" data-chat="${response.group._id}">
      <input type="text" class="write-chat chat-in-group" id="write-chat-${response.group._id}" data-chat="${response.group._id}" />
      <div class="icons">
        <a href="#" class="icon-chat" data-chat="">
          <i class="fa fa-smile-o"></i>
        </a>
        <label for="image-chat-${response.group._id}">
          <input
            type="file"
            id="image-chat-${response.group._id}"
            name="my-image-chat"
            class="image-chat chat-in-group"
            data-chat="${response.group._id}"
          />
          <i class="fa fa-photo"></i>
        </label>
        <label for="attachment-chat-${response.group._id}">
          <input
            type="file"
            id="attachment-chat-${response.group._id}"
            name="my-attachment-chat"
            class="attachment-chat chat-in-group"
            data-chat="${response.group._id}"
          />
          <i class="fa fa-paperclip"></i>
        </label>
        <a
          href="javascript:void(0)"
          id="video-chat-${response.group._id}"
          class="video-chat"
          data-chat="${response.group._id}"
        >
          <i class="fa fa-video-camera"></i>
        </a>
      </div>
    </div>
  </div>`
  $("#screen-chat").prepend(rightSideData);
  
  response.group.messages.forEach(message => {
    let messageHtml = "";
    if (message.messageType === "text") {
      messageHtml = `
      <div 
        class="convert-emoji bubble ${message.senderId == currentUserId ? 'me': 'you'}"
        data-mess-id="${message._id}"
      >
        <img src="/images/users/${message.sender.avatar}" class="avatar-small" title="">
        <div class="bubble-content">
          ${message.text}  
        </div>
      </div>`;
    }

    if (message.messageType === "image") {
      messageHtml = `
      <div 
        class="convert-emoji bubble ${message.senderId == currentUserId ? 'me': 'you'}"
        data-mess-id="${message._id}"
      >
        <img src="/images/users/${message.sender.avatar}" class="avatar-small" title="${message.sender.name}">
        <img
          src="data:${message.file.contentType}; base64, ${bufferToBase64(message.file.data.data)}"
          class="show-image-chat"
        />
      </div>`;
    }

    if (message.messageType === "file") {
      messageHtml = `
      <div 
        class="convert-emoji bubble ${message.senderId == currentUserId ? 'me': 'you'}"
        data-mess-id="${message._id}"
      >
        <img src="/images/users/${message.sender.avatar}" class="avatar-small" title="${message.sender.name}">
        <div class="bubble-content">
          <a
            href="data:${message.file.contentType}; base64, ${bufferToBase64(message.file.data.data)}"
            download="${message.file.fileName}"
          >
            ${message.file.fileName}
          </a>
        </div>
      </div>`;
    }
    $(`.chat[data-chat = ${response.group._id}]`).append(messageHtml);
  });

  // Step 03: call function changeScreenChat
  changeScreenChat();

  // Step 04: Enable chat emoji
  enableEmojioneArea();

  // Step 05: convert emoji
  convertEmoji();

  // Step 06: handle imageModal
  let imgModalData = `
  <div class="modal fade" id="imagesModal_${response.group._id}" role="dialog">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal">&times;</button>
          <h4 class="modal-title">Tất cả hình ảnh trong cuộc trò truyện.</h4>
        </div>
        <div class="modal-body">
          <div class="all-images" style="visibility: hidden;"></div>
        </div>
      </div>
    </div>
  </div>`;
  $("body").append(imgModalData);

  response.group.messages.forEach(message => {
    if (message.messageType === "image") {
      let messageHtml = `
        <img src="data:${message.file.contentType}; base64, ${bufferToBase64(message.file.data.data)}" />
      `;

      $(`#imagesModal_${response.group._id}`).find(".all-images").append(messageHtml);
    }
  });

  // Step 07: call grid photo
  gridPhotos(5);

  // Step 08: handle attachmentModal
  let attachmentModalData = `
  <div class="modal fade" id="attachmentsModal_${response.group._id}" role="dialog">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal">&times;</button>
          <h4 class="modal-title">Tất cả tệp đính kèm trong cuộc trò chuyện.</h4>
        </div>
        <div class="modal-body">
          <ul class="list-attachments"></ul>
        </div>
      </div>
    </div>
  </div>`
  $("body").append(attachmentModalData);
  response.group.messages.forEach(message => {
    if (message.messageType === "file") {
      let messageHtml = `
          <li>
            <a
              href="data:${message.file.contentType}; base64, ${bufferToBase64(message.file.data.data)}"
              download="${message.file.fileName}"
            >
              ${message.file.fileName}
            </a>
          </li>
        `;

      $(`#attachmentsModal_${response.group._id}`).find(".list-attachments").append(messageHtml);
    }
  });

  // Step 09: handle membersModal
  let membersModalData = `
    <div class="modal fade" id="membersModal_${response.group._id}" role="dialog">
      <div class="modal-dialog modal-lg">
          <div class="modal-content">
              <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal">&times;</button>
                  <h4 class="modal-title">Tất cả thành viên trong nhóm.</h4>
              </div>
              <div class="modal-body">
                  <div class="member-types">
                      <div class="member-type-admin">
                          <div></div>
                          <span>Chủ nhóm</span>
                      </div>
                      <div class="member-type-member">
                          <div></div>
                          <span>Thành viên</span>
                      </div>
                  </div>
                  <div class="all-members">
                      <div class="row">
                          
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>`
  $("body").append(membersModalData);
  response.group.membersInfo.forEach(member => {
    let html = `
      <div id="${member._id}" class="col-sm-2 member">
        <div class="thumbnail">
          <img class="member-avatar" src="/images/users/${member.avatar}" alt="">
          <div class="caption">
            <p class="member-name ${response.group.userId === member._id ? "admin" : "" }">
              ${member.username}
            </p>
            <div class="member-talk" data-uid="${member._id}" >
              Trò chuyện
            </div> 
          </div>
        </div>
      </div>`;

    $(`#membersModal_${response.group._id}`).find(".all-members .row").append(html);
  });

  // step 10: call function leaveGroupChat
  leaveGroupChat();

  // Step 11: handle membersModal
  let addMemberModalData = `
  <div class="modal fade" id="addMemberModal_${response.group._id}" role="dialog">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">Thêm thành viên.</h4>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <input class="form-control input-find-member" data-uid="${response.group._id}" placeholder="Nhập E-mail hoặc username..." aria-describedby="basic-addon2">
                    <span class="input-group-addon btn-find-member">
                        <i class="glyphicon glyphicon-search"></i>
                    </span>
                </div>
                <ul class="member-list">
                </ul>
            </div>
        </div>
    </div>
  </div>`
  $("body").append(addMemberModalData);

  // Step 13: update online
  socket.emit("check-status");

  // Step 14: Read more messages
  readMoreMessages();

  // Step 15: emit
  let dataToEmit = response;
  socket.emit("member-added-to-group-chat", dataToEmit);
});
