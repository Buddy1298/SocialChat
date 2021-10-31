function approveRequestContactReceived() {
  $(".user-approve-request-contact-received").off("click").on("click", function () {
    let targetId = $(this).data("uid");
    let targetName = $(this).parent().find("div.user-name>p").text().trim();
    let targetAvatar = $(this).parent().find("div.user-avatar>img").attr("src");

    $.ajax({
      url: "/contact/approve-request-contact-received",
      type: "put",
      data: { uid: targetId },
      success: function (data) {
        let userInfo = $("#request-contact-received").find(`ul li[data-uid = ${targetId}]`);
        $(userInfo).find("div.user-approve-request-contact-received").remove();
        $(userInfo).find("div.user-remove-request-contact-received").remove();
        $(userInfo).find("div.contactPanel")
          .append(`
            <div class="user-talk" data-uid="${targetId}">
              Trò chuyện
            </div>
            <div class="user-remove-contact action-danger" data-uid="${targetId}">
              Xóa liên hệ
            </div>
          `);
        let userInfoHtml = userInfo.get(0).outerHTML;
        $("#contacts").find("ul").prepend(userInfoHtml);
        $(userInfo).remove();
        
        decreaseNumberNotifContact("count-request-contact-received"); // js/caculateNotifContact.js
        increaseNumberNotifContact("count-contacts"); //js/caculateNotifContact.js
    
        decreaseNumberNotification("noti_contact_counter", 1); // js/caculateNotification.js

        removeContact(); // js/removeContact.js

        socket.emit("approve-request-contact-received", { contactId: targetId, messages: data.messages });

        // All steps handle chat after approve contact
        // Step 01: handle leftSide.js
        let subUsername = targetName;
        if (subUsername.length > 15) {
          subUsername = subUsername.substr(0, 14) + "...";
        }
        let leftSideData = "";
        let lastMess = lastItemFromArr(data.messages);
        
        if (lastMess.messageType === "text" || !lastMess.length) {
          leftSideData = `
              <a href="#uid_${targetId}" class="room-chat" data-target="#to_${targetId}">
                <li class="person" data-chat="${targetId}">
                  <div class="left-avatar">
                  <div class="dot"></div>
                    <img src="${targetAvatar}" alt="" />
                  </div>
                  <span class="name">
                    ${subUsername}
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
              <a href="#uid_${targetId}" class="room-chat" data-target="#to_${targetId}">
                <li class="person" data-chat="${targetId}">
                  <div class="left-avatar">
                  <div class="dot"></div>
                    <img src="${targetAvatar}" alt="" />
                  </div>
                  <span class="name">
                    ${subUsername}
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
              <a href="#uid_${targetId}" class="room-chat" data-target="#to_${targetId}">
                <li class="person" data-chat="${targetId}">
                  <div class="left-avatar">
                  <div class="dot"></div>
                    <img src="${targetAvatar}" alt="" />
                  </div>
                  <span class="name">
                    ${subUsername}
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
        <div class="right tab-pane" data-chat="${targetId}" id="to_${targetId}">
          <div class="top">
            <span>To: 
              <span class="name">${targetName}</span>
            </span>
            <span class="chat-menu-right">
              <a href="#attachmentsModal_${targetId}" class="show-attachments" data-toggle="modal">
                Tệp đính kèm
                <i class="fa fa-paperclip"></i>
              </a>
            </span>
            <span class="chat-menu-right">
              <a href="javascript:void(0)">&nbsp;</a>
            </span>
            <span class="chat-menu-right">
            <a href="#imagesModal_${targetId}" class="show-images" data-toggle="modal">
              Hình ảnh
              <i class="fa fa-photo"></i>
            </a>
            </span>
          </div>
          <div class="content-chat">
            <div class="chat" data-chat="${targetId}">
              <img src="images/chat/message-loading.gif" class="message-loading" />
            </div>
          </div>
          <div class="write" data-chat="${targetId}">
            <input type="text" class="write-chat" id="write-chat-${targetId}" data-chat="${targetId}" />
            <div class="icons">
              <a href="#" class="icon-chat" data-chat="">
                <i class="fa fa-smile-o"></i>
              </a>
              <label for="image-chat-${targetId}">
                <input
                  type="file"
                  id="image-chat-${targetId}"
                  name="my-image-chat"
                  class="image-chat"
                  data-chat="${targetId}"
                />
                <i class="fa fa-photo"></i>
              </label>
              <label for="attachment-chat-${targetId}">
                <input
                  type="file"
                  id="attachment-chat-${targetId}"
                  name="my-attachment-chat"
                  class="attachment-chat"
                  data-chat="${targetId}"
                />
                <i class="fa fa-paperclip"></i>
              </label>
              <a
                href="javascript:void(0)"
                id="video-chat-${targetId}"
                class="video-chat"
                data-chat="${targetId}"
              >
                <i class="fa fa-video-camera"></i>
              </a>
            </div>
          </div>
        </div>`
        $("#screen-chat").prepend(rightSideData);
        
        data.messages.forEach(message => {
          let messageHtml = "";
          if (message.messageType === "text") {
            messageHtml = `
            <div 
              class="convert-emoji bubble ${message.senderId == targetId ? 'you': 'me'}"
              data-mess-id="${targetId}"
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
              class="convert-emoji bubble ${message.senderId == targetId ? 'you': 'me'}"
              data-mess-id="${targetId}"
            >
              <img src="/images/users/${message.sender.avatar}" class="avatar-small" title="">
              <img
                src="data:${message.file.contentType}; base64, ${bufferToBase64(message.file.data.data)}"
                class="show-image-chat"
              />
            </div>`;
          }

          if (message.messageType === "file") {
            messageHtml = `
            <div 
              class="convert-emoji bubble ${message.senderId == targetId ? 'you': 'me'}"
              data-mess-id="${targetId}"
            >
              <img src="/images/users/${message.sender.avatar}" class="avatar-small" title="">
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
          $(`.chat[data-chat = ${targetId}]`).append(messageHtml);
        });

        // Step 03: call function changeScreenChat
        changeScreenChat();

        // Step 04: Enable chat emoji
        enableEmojioneArea();

        // Step 05: convert emoji
        convertEmoji();

        // Step 06: handle imageModal
        let imgModalData = `
        <div class="modal fade" id="imagesModal_${targetId}" role="dialog">
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

        data.messages.forEach(message => {
          if (message.messageType === "image") {
            let messageHtml = `
              <img src="data:${message.file.contentType}; base64, ${bufferToBase64(message.file.data.data)}" />
            `;

            $(`#imagesModal_${targetId}`).find(".all-images").append(messageHtml);
          }
        });

        // Step 07: call grid photo
        gridPhotos(5);

        // Step 08: handle attachmentModal
        let attachmentModalData = `
        <div class="modal fade" id="attachmentsModal_${targetId}" role="dialog">
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

        data.messages.forEach(message => {
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

            $(`#attachmentsModal_${targetId}`).find(".list-attachments").append(messageHtml);
          }
        });

        // Step 09: update online
        socket.emit("check-status");

        // Step 11: Read more messages
        readMoreMessages();

        openModalImage();
      }
    });
  });
}

socket.on("response-approve-request-contact-received", function (user) {
  let notif = `<div class="notif-readed-false" data-uid="${user.id}">
                <img class="avatar-small" src="images/users/${user.avatar}" alt=${user.username}div/>
                <strong>${user.username}</strong> đã chấp nhận lời mời kết bạn của bạn! 
              </div>`;
  $(".noti_content").prepend(notif); // thêm ở popup notification
  $("ul.list-notifications").prepend(`<li>${notif}</li>`); // thểm ổ modal notification

  decreaseNumberNotifContact("count-request-contact-sent"); // js/caculateNotifContact.js
  increaseNumberNotifContact("count-contacts"); // js/caculateNotifContact.js

  decreaseNumberNotification("noti_contact_counter", 1); // js/caculateNotification.js
  increaseNumberNotification("noti_counter", 1); // js/caculateNotification.js

  $("#request-contact-sent").find(`ul li[data-uid = ${user.id}]`).remove();
  $("#find-user").find(`ul li[data-uid = ${user.id}]`).remove();
  
  let userInfoHtml = `
    <li class="_contactList" data-uid="${user.id}">
      <div class="contactPanel">
          <div class="user-avatar">
              <img src="images/users/${user.avatar}" alt="hoanggaphan0021">
          </div>
          <div class="user-name">
              <p>${user.username}</p>
          </div>
          <br>
          <div class="user-address">
              <span>&nbsp; ${user.address}</span>
          </div>
          <div class="user-talk" data-uid="${user.id}">
              Trò chuyện
          </div>
          <div class="user-remove-contact action-danger" data-uid="${user.id}">
              Xóa liên hệ
          </div>
      </div>
    </li>
  `;
  $("#contacts").find("ul").prepend(userInfoHtml);

  removeContact(); // js/removeContact.js

  // All steps handle chat after approve contact
  // Step 01: handle leftSide.js
  let subUsername = user.username;
  if (subUsername.length > 15) {
    subUsername = subUsername.substr(0, 14) + "...";
  }
  let leftSideData = "";
  let lastMess = lastItemFromArr(user.messages);
  
  if (lastMess.messageType === "text" || !lastMess.length) {
    leftSideData = `
        <a href="#uid_${user.id}" class="room-chat" data-target="#to_${user.id}">
          <li class="person" data-chat="${user.id}">
            <div class="left-avatar">
            <div class="dot"></div>
              <img src="images/users/${user.avatar}" alt="" />
            </div>
            <span class="name">
              ${subUsername}
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
        <a href="#uid_${user.id}" class="room-chat" data-target="#to_${user.id}">
          <li class="person" data-chat="${user.id}">
            <div class="left-avatar">
            <div class="dot"></div>
              <img src="images/users/${user.avatar}" alt="" />
            </div>
            <span class="name">
              ${subUsername}
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
        <a href="#uid_${user.id}" class="room-chat" data-target="#to_${user.id}">
          <li class="person" data-chat="${user.id}">
            <div class="left-avatar">
            <div class="dot"></div>
              <img src="images/users/${user.avatar}" alt="" />
            </div>
            <span class="name">
              ${subUsername}
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
        <div class="right tab-pane" data-chat="${user.id}" id="to_${user.id}">
          <div class="top">
            <span>To: 
              <span class="name">${user.username}</span>
            </span>
            <span class="chat-menu-right">
              <a href="#attachmentsModal_${user.id}" class="show-attachments" data-toggle="modal">
                Tệp đính kèm
                <i class="fa fa-paperclip"></i>
              </a>
            </span>
            <span class="chat-menu-right">
              <a href="javascript:void(0)">&nbsp;</a>
            </span>
            <span class="chat-menu-right">
            <a href="#imagesModal_${user.id}" class="show-images" data-toggle="modal">
              Hình ảnh
              <i class="fa fa-photo"></i>
            </a>
            </span>
          </div>
          <div class="content-chat">
            <div class="chat" data-chat="${user.id}">
              <img src="images/chat/message-loading.gif" class="message-loading" />
            </div>
          </div>
          <div class="write" data-chat="${user.id}">
            <input type="text" class="write-chat" id="write-chat-${user.id}" data-chat="${user.id}" />
            <div class="icons">
              <a href="#" class="icon-chat" data-chat="">
                <i class="fa fa-smile-o"></i>
              </a>
              <label for="image-chat-${user.id}">
                <input
                  type="file"
                  id="image-chat-${user.id}"
                  name="my-image-chat"
                  class="image-chat"
                  data-chat="${user.id}"
                />
                <i class="fa fa-photo"></i>
              </label>
              <label for="attachment-chat-${user.id}">
                <input
                  type="file"
                  id="attachment-chat-${user.id}"
                  name="my-attachment-chat"
                  class="attachment-chat"
                  data-chat="${user.id}"
                />
                <i class="fa fa-paperclip"></i>
              </label>
              <a
                href="javascript:void(0)"
                id="video-chat-${user.id}"
                class="video-chat"
                data-chat="${user.id}"
              >
                <i class="fa fa-video-camera"></i>
              </a>
            </div>
          </div>
        </div>`
  $("#screen-chat").prepend(rightSideData);
  
  user.messages.forEach(message => {
    let messageHtml = "";
    if (message.messageType === "text") {
      messageHtml = `
      <div 
        class="convert-emoji bubble ${message.senderId == user.id ? 'you': 'me'}"
        data-mess-id="${user.id}"
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
        class="convert-emoji bubble ${message.senderId == user.id ? 'you': 'me'}"
        data-mess-id="${user.id}"
      >
        <img
          src="data:${message.file.contentType}; base64, ${bufferToBase64(message.file.data.data)}"
          class="show-image-chat"
        />
      </div>`;
    }

    if (message.messageType === "file") {
      messageHtml = `
      <div 
        class="convert-emoji bubble ${message.senderId == user.id ? 'you': 'me'}"
        data-mess-id="${user.id}"
      >
        <img src="/images/users/${message.sender.avatar}" class="avatar-small" title="">
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
    $(`.chat[data-chat = ${user.id}]`).append(messageHtml);
  });

  // Step 03: call function changeScreenChat
  changeScreenChat();

  // Step 04: Enable chat emoji
  enableEmojioneArea();

  // Step 05: convert emoji
  convertEmoji();

  // Step 06: handle imageModal
  let imgModalData = `
  <div class="modal fade" id="imagesModal_${user.id}" role="dialog">
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

  user.messages.forEach(message => {
    if (message.messageType === "image") {
      let messageHtml = `
        <img src="data:${message.file.contentType}; base64, ${bufferToBase64(message.file.data.data)}" />
      `;

      $(`#imagesModal_${user.id}`).find(".all-images").append(messageHtml);
    }
  });

  // Step 07: call grid photo
  gridPhotos(5);

  // Step 08: handle attachmentModal
  let attachmentModalData = `
  <div class="modal fade" id="attachmentsModal_${user.id}" role="dialog">
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

  user.messages.forEach(message => {
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

      $(`#attachmentsModal_${user.id}`).find(".list-attachments").append(messageHtml);
    }
  });

  // Step 09: update online
  socket.emit("check-status");

  // Step 11: Read more messages
  readMoreMessages();

  openModalImage();
});



$(document).ready(function () {
  approveRequestContactReceived();
});
