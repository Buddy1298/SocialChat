function textAndEmojiChat(divId) {
  $(`.emojionearea`).off("keyup").on("keyup", function (elem) {
    let currentEmojioneArea = $(this);
    if(elem.which === 13) {
      let targetId = $(`#write-chat-${divId}`).data("chat");
      let messageVal = $(`#write-chat-${divId}`).val();
      
      if (!targetId.length || !messageVal) {
        return false;  
      }

      let dataTextEmojiForSend = {
        uid: targetId,
        messageVal,
      };

      if($(`#write-chat-${divId}`).hasClass("chat-in-group")) {
        dataTextEmojiForSend.isChatGroup = true;
      }

      // Call send message
      $.post("/message/add-new-text-emoji", dataTextEmojiForSend, function (data) {
        let dataToEmit = data;

        // step 01: handle message data before show
        let messageOfMe = $(`<div class="bubble me" data-mess-id="${data.newMessage._id}">
                              <div class="bubble-content"></div>
                            </div>`
                          );
        messageOfMe.find(".bubble-content").text(data.newMessage.text);
        let convertEmojiMessage = emojione.toImage(messageOfMe.html());
        let senderAvatar = `<img src="/images/users/${data.newMessage.sender.avatar}" class="avatar-small" title="${data.newMessage.sender.name}" />`

        if (dataTextEmojiForSend.isChatGroup) {
          messageOfMe.html(`${senderAvatar} ${convertEmojiMessage}`);

          increaseNumberMessageGroup(divId);
          dataToEmit.groupId = targetId;
        } else {
          messageOfMe.html(`${senderAvatar} ${convertEmojiMessage}`);
          dataToEmit.contactId = targetId;
        }

        // step 02: append message data to screen
        $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);
        nineScrollRight(divId);

        // step 03: remove all data input
        $(`#write-chat-${divId}`).val("");
        currentEmojioneArea.find(".emojionearea-editor").text("");

        // step 04: change data preview & time in leftSide
        $(`.person[data-chat = ${divId}]`).find("span.time").removeClass("message-time-realtime").html(moment(data.newMessage.createdAt).locale("vi").startOf("seconds").fromNow());
        $(`.person[data-chat = ${divId}]`).find("span.preview").html(emojione.toImage(data.newMessage.text));

        // step 05: move conversation to the top 
        $(`.person[data-chat = ${divId}]`).on("event.moveConversationToTheTop", function () {
          let dataToMove = $(this).parent();
          $(this).closest("ul").prepend(dataToMove);
          $(this).off("event.moveConversationToTheTop");
        })
        $(`.person[data-chat = ${divId}]`).trigger("event.moveConversationToTheTop");

        // step 06: emit realtime
        socket.emit("chat-text-emoji", dataToEmit);

        // step 07: emit remove typing real-time
        typingOff(divId);

        // step 08: If this has typing, remove that immediate
        let checkTyping = $(`.chat[data-chat = ${divId}]`).find("div.bubble-typing-gif");
        if(checkTyping) {
          checkTyping.remove();
        }

      }).fail(function (response) {
        // error
        alertify.notify(response.responseText, "error", 5);
      })
    }
  });
}

$(document).ready(function () {
  socket.on("response-chat-text-emoji", function (response) {
    let divId = "";
    let currentUserId = $("#dropdown-navbar-user").data("uid");

    // step 01: handle message data before show
    let messageOfYou = $(`<div class="bubble ${response.newMessage.senderId == currentUserId ? 'me': 'you'}" data-mess-id="${response.newMessage._id}">
                              <div class="bubble-content"></div>
                            </div>`
                          );
    messageOfYou.find(".bubble-content").text(response.newMessage.text);
    let convertEmojiMessage = emojione.toImage(messageOfYou.html());
    let senderAvatar = `<img src="/images/users/${response.newMessage.sender.avatar}" class="avatar-small" title="${response.newMessage.sender.name}" />`

    if (response.currentGroupId) {
      messageOfYou.html(`${senderAvatar} ${convertEmojiMessage}`);

      divId = response.currentGroupId;

      increaseNumberMessageGroup(divId);
    } else {
      messageOfYou.html(`${senderAvatar} ${convertEmojiMessage}`);
      divId = response.currentUserId;
    }

    // All steps handle chat if conversation is showing window screen
    if($("#all-chat").find(`li[data-chat = "${divId}"]`).length) {
      // step 02: append message data to screen
      $(`.right .chat[data-chat=${divId}]`).append(messageOfYou);
      nineScrollRight(divId);
      
      // step 03: change data preview & time in leftSide
      if(!response.newMessage.senderId == currentUserId) {
        $(`.person[data-chat = ${divId}]`).find("span.time").addClass("message-time-realtime");
      }
      $(`.person[data-chat = ${divId}]`).find("span.time").html(moment(response.newMessage.createdAt).locale("vi").startOf("seconds").fromNow());
      $(`.person[data-chat = ${divId}]`).find("span.preview").html(emojione.toImage(response.newMessage.text));
  
      // step 04: move conversation to the top 
      $(`.person[data-chat = ${divId}]`).on("event.moveConversationToTheTop", function () {
        let dataToMove = $(this).parent();
        $(this).closest("ul").prepend(dataToMove);
        $(this).off("event.moveConversationToTheTop");
      })
      $(`.person[data-chat = ${divId}]`).trigger("event.moveConversationToTheTop");

      return;
    }

    // All steps handle chat with user conversation is not showing window screen
    if (!response.currentGroupId) {
      // Step 01: handle leftSide.js
      let subUsername = response.sender.name;
      if (subUsername.length > 15) {
        subUsername = subUsername.substr(0, 14) + "...";
      }
      let leftSideData = "";
      let lastMess = lastItemFromArr(response.messages);
      
      if (lastMess.messageType === "text" || !lastMess.length) {
        leftSideData = `
            <a href="#uid_${divId}" class="room-chat" data-target="#to_${divId}">
              <li class="person" data-chat="${divId}">
                <div class="left-avatar">
                <div class="dot"></div>
                  <img src="images/users/${response.sender.avatar}" alt="" />
                </div>
                <span class="name">
                  ${subUsername}
                </span>
                <span class="time message-time-realtime">
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
            <a href="#uid_${divId}" class="room-chat" data-target="#to_${divId}">
              <li class="person" data-chat="${divId}">
                <div class="left-avatar">
                <div class="dot"></div>
                  <img src="images/users/${response.sender.avatar}" alt="" />
                </div>
                <span class="name">
                  ${subUsername}
                </span>
                <span class="time message-time-realtime">
                  ${convertTimestampHumanTime(lastMess.createdAt)}
                </span>
                <span class="preview convert-emoji">
                  H??nh ???nh...
                </span>
              </li>
            </a>`;
      }
  
      if (lastMess.messageType === "file") {
        leftSideData = `
            <a href="#uid_${divId}" class="room-chat" data-target="#to_${divId}">
              <li class="person" data-chat="${divId}">
                <div class="left-avatar">
                <div class="dot"></div>
                  <img src="images/users/${response.sender.avatar}" alt="" />
                </div>
                <span class="name">
                  ${subUsername}
                </span>
                <span class="time message-time-realtime">
                  ${convertTimestampHumanTime(lastMess.createdAt)}
                </span>
                <span class="preview convert-emoji">
                  T???p ????nh k??m...
                </span>
              </li>
            </a>`;
      }
  
      $("#all-chat").find("ul").prepend(leftSideData);
      $("#user-chat").find("ul").prepend(leftSideData);
  
      // Step 02: handle rightSide.ejs
      let rightSideData = `
      <div class="right tab-pane" data-chat="${divId}" id="to_${divId}">
        <div class="top">
          <span>To: 
            <span class="name">${response.sender.name}</span>
          </span>
          <span class="chat-menu-right">
            <a href="#attachmentsModal_${divId}" class="show-attachments" data-toggle="modal">
              T???p ????nh k??m
              <i class="fa fa-paperclip"></i>
            </a>
          </span>
          <span class="chat-menu-right">
            <a href="javascript:void(0)">&nbsp;</a>
          </span>
          <span class="chat-menu-right">
          <a href="#imagesModal_${divId}" class="show-images" data-toggle="modal">
            H??nh ???nh
            <i class="fa fa-photo"></i>
          </a>
          </span>
        </div>
        <div class="content-chat">
          <div class="chat" data-chat="${divId}">
            <img src="images/chat/message-loading.gif" class="message-loading" />
          </div>
        </div>
        <div class="write" data-chat="${divId}">
          <input type="text" class="write-chat" id="write-chat-${divId}" data-chat="${divId}" />
          <div class="icons">
            <a href="#" class="icon-chat" data-chat="">
              <i class="fa fa-smile-o"></i>
            </a>
            <label for="image-chat-${divId}">
              <input
                type="file"
                id="image-chat-${divId}"
                name="my-image-chat"
                class="image-chat"
                data-chat="${divId}"
              />
              <i class="fa fa-photo"></i>
            </label>
            <label for="attachment-chat-${divId}">
              <input
                type="file"
                id="attachment-chat-${divId}"
                name="my-attachment-chat"
                class="attachment-chat"
                data-chat="${divId}"
              />
              <i class="fa fa-paperclip"></i>
            </label>
            <a
              href="javascript:void(0)"
              id="video-chat-${divId}"
              class="video-chat"
              data-chat="${divId}"
            >
              <i class="fa fa-video-camera"></i>
            </a>
          </div>
        </div>
      </div>`
      $("#screen-chat").prepend(rightSideData);
      
      response.messages.forEach(message => {
        let messageHtml = "";
        if (message.messageType === "text") {
          messageHtml = `
          <div 
            class="convert-emoji bubble ${message.senderId == currentUserId ? 'me': 'you'}"
            data-mess-id="${message._id}"
          >
            <img src="/images/users/${message.sender.avatar}" class="avatar-small" title="${message.sender.name}">
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
        $(`.chat[data-chat = ${divId}]`).append(messageHtml);
      });
  
      // Step 03: call function changeScreenChat
      changeScreenChat();
  
      // Step 04: Enable chat emoji
      enableEmojioneArea();
  
      // Step 05: convert emoji
      convertEmoji();
  
      // Step 06: handle imageModal
      let imgModalData = `
      <div class="modal fade" id="imagesModal_${divId}" role="dialog">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal">&times;</button>
              <h4 class="modal-title">T???t c??? h??nh ???nh trong cu???c tr?? truy???n.</h4>
            </div>
            <div class="modal-body">
              <div class="all-images" style="visibility: hidden;"></div>
            </div>
          </div>
        </div>
      </div>`;
      $("body").append(imgModalData);
  
      response.messages.forEach(message => {
        if (message.messageType === "image") {
          let messageHtml = `
            <img src="data:${message.file.contentType}; base64, ${bufferToBase64(message.file.data.data)}" />
          `;
  
          $(`#imagesModal_${divId}`).find(".all-images").append(messageHtml);
        }
      });
  
      // Step 07: call grid photo
      gridPhotos(5);
  
      // Step 08: handle attachmentModal
      let attachmentModalData = `
      <div class="modal fade" id="attachmentsModal_${divId}" role="dialog">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal">&times;</button>
              <h4 class="modal-title">T???t c??? t???p ????nh k??m trong cu???c tr?? chuy???n.</h4>
            </div>
            <div class="modal-body">
              <ul class="list-attachments"></ul>
            </div>
          </div>
        </div>
      </div>`
      $("body").append(attachmentModalData);
  
      response.messages.forEach(message => {
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
  
          $(`#attachmentsModal_${divId}`).find(".list-attachments").append(messageHtml);
        }
      });
  
      // Step 09: update online
      socket.emit("check-status");
  
      // Step 10: Read more messages
      readMoreMessages();

      return;
    }

    // All steps handle chat if group conversation is not showing window screen
    // Step 01: handle leftSide.js
    let subUsername = response.receiver.name;
    if (subUsername.length > 15) {
      subUsername = subUsername.substr(0, 14) + "...";
    }
    let leftSideData = "";
    let lastMess = lastItemFromArr(response.messages);
    
    if (lastMess.messageType === "text" || !lastMess.length) {
      leftSideData = `
          <a href="#uid_${divId}" class="room-chat" data-target="#to_${divId}">
            <li class="person group-chat" data-chat="${divId}">
              <div class="left-avatar">
                <img src="images/users/group-avatar.png" alt="" />
              <span class="name">
                <span class="group-chat-name">
                  ${subUsername}
                </span> 
              </span>
              <span class="time ${response.newMessage.senderId != currentUserId && "message-time-realtime"}">
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
          <a href="#uid_${divId}" class="room-chat" data-target="#to_${divId}">
            <li class="person group-chat" data-chat="${divId}">
              <div class="left-avatar">
                <img src="images/users/group-avatar.png" alt="" />
              <span class="name">
                <span class="group-chat-name">
                  ${subUsername}
                </span> 
              </span>
              <span class="time ${response.newMessage.senderId != currentUserId && "message-time-realtime"}">
                ${convertTimestampHumanTime(lastMess.createdAt)}
              </span>
              <span class="preview convert-emoji">
                H??nh ???nh...
              </span>
            </li>
          </a>`;
    }

    if (lastMess.messageType === "file") {
      leftSideData = `
          <a href="#uid_${divId}" class="room-chat" data-target="#to_${divId}">
            <li class="person group-chat" data-chat="${divId}">
              <div class="left-avatar">
                <img src="images/users/group-avatar.png" alt="" />
              <span class="name">
                <span class="group-chat-name">
                  ${subUsername}
                </span> 
              </span>
              <span class="time ${response.newMessage.senderId != currentUserId && "message-time-realtime"}">
                ${convertTimestampHumanTime(lastMess.createdAt)}
              </span>
              <span class="preview convert-emoji">
                T???p ????nh k??m...
              </span>
            </li>
          </a>`;
    }

    $("#all-chat").find("ul").prepend(leftSideData);

    // Step 02: handle rightSide.ejs
    let rightSideData = `
    <div class="right tab-pane" data-chat="${divId}" id="to_${divId}">
      <div class="top">
        <span>To: 
          <span class="name">${response.sender.name}</span>
        </span>
        <span class="chat-menu-right">
          <a class="leave-group-chat" id="${divId}" href="javascript:void(0)">
            R???i nh??m
            <i class="fa fa-sign-out"></i>
          </a>
        </span>
        <span class="chat-menu-right">
            <a href="javascript:void(0)">&nbsp;</a>
        </span>
        <span class="chat-menu-right">
          <a href="#addMemberModal_${divId}" data-toggle="modal">
            <span>Th??m th??nh vi??n</span>
            <i class="fa fa-plus-square"></i>
          </a>
        </span>
        <span class="chat-menu-right">
            <a href="javascript:void(0)">&nbsp;</a>
        </span>
        <span class="chat-menu-right">
          <a href="#attachmentsModal_${divId}" class="show-attachments" data-toggle="modal">
            T???p ????nh k??m
            <i class="fa fa-paperclip"></i>
          </a>
        </span>
        <span class="chat-menu-right">
          <a href="javascript:void(0)">&nbsp;</a>
        </span>
        <span class="chat-menu-right">
          <a href="#imagesModal_${divId}" class="show-images" data-toggle="modal">
            H??nh ???nh
            <i class="fa fa-photo"></i>
          </a>
        </span>
        <span class="chat-menu-right">
          <a href="javascript:void(0)">&nbsp;</a>
        </span>
        <span class="chat-menu-right">
          <a href="#membersModal_${response.getChatGroupReceiver._id}" class="number-members" data-toggle="modal">
            <span class="show-number-members" >${response.getChatGroupReceiver.usersAmount}</span>
            <span>Th??nh vi??n</span>
            <i class="fa fa-users"></i>
          </a>
        </span>
        <span class="chat-menu-right">
          <a href="javascript:void(0)">&nbsp;</a>
        </span>
        <span class="chat-menu-right">
          <a href="javascript:void(0)" class="number-messages" data-toggle="modal">
            <span class="show-number-messages" >${response.receiver.messagesAmount}</span>
            <span>Tin nh???n</span>
            <i class="fa fa-comment-o"></i>
          </a>
        </span>
      </div>
      <div class="content-chat">
        <div class="chat chat-in-group" data-chat="${divId}">
          <img src="images/chat/message-loading.gif" class="message-loading" />
        </div>
      </div>
      <div class="write" data-chat="${divId}">
        <input type="text" class="write-chat chat-in-group" id="write-chat-${divId}" data-chat="${divId}" />
        <div class="icons">
          <a href="#" class="icon-chat" data-chat="">
            <i class="fa fa-smile-o"></i>
          </a>
          <label for="image-chat-${divId}">
            <input
              type="file"
              id="image-chat-${divId}"
              name="my-image-chat"
              class="image-chat chat-in-group"
              data-chat="${divId}"
            />
            <i class="fa fa-photo"></i>
          </label>
          <label for="attachment-chat-${divId}">
            <input
              type="file"
              id="attachment-chat-${divId}"
              name="my-attachment-chat"
              class="attachment-chat chat-in-group"
              data-chat="${divId}"
            />
            <i class="fa fa-paperclip"></i>
          </label>
          <a
            href="javascript:void(0)"
            id="video-chat-${divId}"
            class="video-chat"
            data-chat="${divId}"
          >
            <i class="fa fa-video-camera"></i>
          </a>
        </div>
      </div>
    </div>`
    $("#screen-chat").prepend(rightSideData);
    
    response.messages.forEach(message => {
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
      $(`.chat[data-chat = ${divId}]`).append(messageHtml);
    });

    // Step 03: call function changeScreenChat
    changeScreenChat();

    // Step 04: Enable chat emoji
    enableEmojioneArea();

    // Step 05: convert emoji
    convertEmoji();

    // Step 06: handle imageModal
    let imgModalData = `
    <div class="modal fade" id="imagesModal_${divId}" role="dialog">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">&times;</button>
            <h4 class="modal-title">T???t c??? h??nh ???nh trong cu???c tr?? truy???n.</h4>
          </div>
          <div class="modal-body">
            <div class="all-images" style="visibility: hidden;"></div>
          </div>
        </div>
      </div>
    </div>`;
    $("body").append(imgModalData);

    response.messages.forEach(message => {
      if (message.messageType === "image") {
        let messageHtml = `
          <img src="data:${message.file.contentType}; base64, ${bufferToBase64(message.file.data.data)}" />
        `;

        $(`#imagesModal_${divId}`).find(".all-images").append(messageHtml);
      }
    });

    // Step 07: call grid photo
    gridPhotos(5);

    // Step 08: handle attachmentModal
    let attachmentModalData = `
    <div class="modal fade" id="attachmentsModal_${divId}" role="dialog">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">&times;</button>
            <h4 class="modal-title">T???t c??? t???p ????nh k??m trong cu???c tr?? chuy???n.</h4>
          </div>
          <div class="modal-body">
            <ul class="list-attachments"></ul>
          </div>
        </div>
      </div>
    </div>`
    $("body").append(attachmentModalData);
    response.messages.forEach(message => {
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

        $(`#attachmentsModal_${divId}`).find(".list-attachments").append(messageHtml);
      }
    });

    // Step 09: handle membersModal
    let membersModalData = `
      <div class="modal fade" id="membersModal_${response.getChatGroupReceiver._id}" role="dialog">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">T???t c??? th??nh vi??n trong nh??m.</h4>
                </div>
                <div class="modal-body">
                    <div class="member-types">
                        <div class="member-type-admin">
                            <div></div>
                            <span>Ch??? nh??m</span>
                        </div>
                        <div class="member-type-member">
                            <div></div>
                            <span>Th??nh vi??n</span>
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
    response.getChatGroupReceiver.membersInfo.forEach(member => {
      let html = `
        <div id="${member._id}" class="col-sm-2 member">
          <div class="thumbnail">
            <img class="member-avatar" src="/images/users/${member.avatar}" alt="">
            <div class="caption">
              <p class="member-name ${response.getChatGroupReceiver.userId === member._id ? "admin" : "" }">
                ${member.username}
              </p>
              <div class="member-talk" data-uid="${member._id}" >
                Tr?? chuy???n
              </div> 
            </div>
          </div>
        </div>`;

      $(`#membersModal_${response.getChatGroupReceiver._id}`).find(".all-members .row").append(html);
    });

    // step 10: call function leaveGroupChat
    leaveGroupChat();

    // Step 11: handle membersModal
    let addMemberModalData = `
    <div class="modal fade" id="addMemberModal_${response.getChatGroupReceiver._id}" role="dialog">
      <div class="modal-dialog modal-lg">
          <div class="modal-content">
              <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal">&times;</button>
                  <h4 class="modal-title">Th??m th??nh vi??n.</h4>
              </div>
              <div class="modal-body">
                  <div class="input-group">
                      <input class="form-control input-find-member" data-uid="${response.getChatGroupReceiver._id}" placeholder="Nh???p E-mail ho???c username..." aria-describedby="basic-addon2">
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

    openModalImage();
  });
});
