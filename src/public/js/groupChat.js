function removeFriendFromGroup(id) {
  $(`ul#friends-added .remove-user[data-uid = ${id}]`).off("click").on("click", function () {
    $('ul#friends-added').find(`li[data-uid = ${id}]`).remove();
    if($(`ul#friends-added .remove-user`).length < 1) {
      $('#groupChatModal .list-user-added').hide();
    }
  });
}

function addFriendsToGroup() {
  $('ul#group-chat-friends').find('div.add-user').bind('click', function() {
    let uid = $(this).data('uid');
    $(this).remove();

    let removeButtonHtml = `
      <div class="remove-user" data-uid="${uid}">
        Xóa khỏi nhóm
      </div>`; 
    $('ul#group-chat-friends').find('li[data-uid=' + uid + '] .contactPanel').append(removeButtonHtml);

    let html = $('ul#group-chat-friends').find('div[data-uid=' + uid + ']').html();

    $('ul#friends-added').append(html);
    $('#groupChatModal .list-user-added').show();
    $('ul#group-chat-friends').find('div[data-uid=' + uid + ']').remove();

    removeFriendFromGroup(uid);
  });
}

function cancelCreateGroup() {
  $('#btn-cancel-group-chat').bind('click', function() {
    $('#groupChatModal .list-user-added').hide();
    if ($('ul#friends-added>li').length) {
      $('ul#friends-added>li').each(function(index) {
        $(this).remove();
      });
    }
  });
}

function callSearchFriend(e) {
  if (e.which === 13 || e.type === "click") {
    let keyword = $("#input-search-friend-to-add-group-chat").val();
    const regKeyword = new RegExp(/^[s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/)

    if (!keyword) {
      alertify.notify("Chưa nhập nội dung tìm kiếm.", "error", 5);
      return;
    }
    
    if(!regKeyword.test(keyword)) {
      alertify.notify("Nội dung tìm kiếm không được chứa kí tự đặc biệt, chỉ cho phép chữ cái, số và khoảng trống", "error", 5);
      return;
    }
    
    $.get(`/contact/search-friends/${keyword}`, function (data) {
      $("ul#group-chat-friends").html(data);
      // Thêm người dùng vào danh sách liệt kê trước khi tạo nhóm trò chuyện
      addFriendsToGroup();

      // Action hủy việc tạo nhóm trò chuyện
      cancelCreateGroup();
    });
  }
}

function callCreateGroupChat() {
  $("#btn-create-group-chat").off("click").on("click", function name() {
    let countUsers = $("ul#friends-added").find("li");

    if(countUsers.length < 2) {
      alertify.error("Vui lòng chọn bạn bè để thêm vào nhóm, ít nhất thêm 2 người", 5);
      return;
    }

    let groupChatName = $("#input-name-group-chat").val();
    let regUsername = new RegExp(
      /^[s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/
    );
    if(!regUsername.test(groupChatName) || groupChatName.length < 5 || groupChatName.length > 30) {
      alertify.error("Vui lòng nhập tên cuộc trò chuyện, giới hạn từ 5 - 30 kí tự và không chứa kí tự đặc biệt.", 5);
      return;
    }

    let arrIds = [];
    $("ul#friends-added").find("li").each(function (index, item) {
      arrIds.push({ userId: $(item).data("uid") });
    });

    Swal.fire({
      title: `Bạn có chắc muốn tạo nhóm ${groupChatName}?`,
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
      $.post(
        "/group-chat/add-new",
        {
          groupChatName: groupChatName,
          arrIds: arrIds,
        },
        function (data) {
          // Step 01: hide modal
          $("#groupChatModal").modal("hide");
          $("#input-name-group-chat").val("");
          $("#btn-cancel-group-chat").click();
          
          // Step 02: handle leftSide.js
          let subGroupChatName = data.groupChat.name;
          if (subGroupChatName.length > 15) {
            subGroupChatName = subGroupChatName.substr(0, 14) + "...";
          }
          let leftSideData = `
            <a href="#uid_${data.groupChat._id}" class="room-chat" data-target="#to_${data.groupChat._id}">
              <li class="person group-chat" data-chat="${data.groupChat._id}">
                <div class="left-avatar">
                  <img src="images/users/group-avatar.png" alt="" />
                </div>
                <span class="name">
                  <span class="group-chat-name">
                    ${subGroupChatName}
                  </span> 
                </span>
                <span class="time"></span>
                <span class="preview convert-emoji"></span>
              </li>
            </a>`;
          
          $("#all-chat").find("ul").prepend(leftSideData);

          // Step 03: handle rightSide.ejs
          let rightSideData = `
          <div class="right tab-pane" data-chat="${data.groupChat._id}" id="to_${data.groupChat._id}">
            <div class="top">
              <span>To: <span class="name">${data.groupChat.name}</span></span>
              <span class="chat-menu-right">
                <a class="leave-group-chat" id="${data.groupChat._id}" href="javascript:void(0)">
                  Rời nhóm
                  <i class="fa fa-sign-out"></i>
                </a>
              </span>
              <span class="chat-menu-right">
                  <a href="javascript:void(0)">&nbsp;</a>
              </span>
              <span class="chat-menu-right">
                <a href="#addMemberModal_${data.groupChat._id}" data-toggle="modal">
                  <span>Thêm thành viên</span>
                  <i class="fa fa-plus-square"></i>
                </a>
              </span>
              <span class="chat-menu-right">
                  <a href="javascript:void(0)">&nbsp;</a>
              </span>
              <span class="chat-menu-right">
                <a href="#attachmentsModal_${data.groupChat._id}" class="show-attachments" data-toggle="modal">
                  Tệp đính kèm
                  <i class="fa fa-paperclip"></i>
                </a>
              </span>
              <span class="chat-menu-right">
                <a href="javascript:void(0)">&nbsp;</a>
              </span>
              <span class="chat-menu-right">
                <a href="#imagesModal_${data.groupChat._id}" class="show-images" data-toggle="modal">
                  Hình ảnh
                  <i class="fa fa-photo"></i>
                </a>
              </span>
              <span class="chat-menu-right">
                <a href="javascript:void(0)">&nbsp;</a>
              </span>
              <span class="chat-menu-right">
                <a href="#membersModal_${data.groupChat._id}" class="number-members" data-toggle="modal">
                  <span class="show-number-members" >${data.groupChat.usersAmount}</span>
                  <span>Thành viên</span>
                  <i class="fa fa-users"></i>
                </a>
              </span>
              <span class="chat-menu-right">
                <a href="javascript:void(0)">&nbsp;</a>
              </span>
              <span class="chat-menu-right">
                <a href="javascript:void(0)" class="number-messages" data-toggle="modal">
                  <span class="show-number-messages" >${data.groupChat.messagesAmount}</span>
                  <span>Tin nhắn</span>
                  <i class="fa fa-comment-o"></i>
                </a>
              </span>
            </div>
            <div class="content-chat">
              <div class="chat chat-in-group" data-chat="${data.groupChat._id}">
                <img src="images/chat/message-loading.gif" class="message-loading" />
              </div>
            </div>
            <div class="write" data-chat="${data.groupChat._id}">
              <input type="text" class="write-chat chat-in-group" id="write-chat-${data.groupChat._id}" data-chat="${data.groupChat._id}" />
              <div class="icons">
                <a href="#" class="icon-chat" data-chat="">
                  <i class="fa fa-smile-o"></i>
                </a>
                <label for="image-chat-${data.groupChat._id}">
                  <input
                    type="file"
                    id="image-chat-${data.groupChat._id}"
                    name="my-image-chat"
                    class="image-chat chat-in-group"
                    data-chat="${data.groupChat._id}"
                  />
                  <i class="fa fa-photo"></i>
                </label>
                <label for="attachment-chat-${data.groupChat._id}">
                  <input
                    type="file"
                    id="attachment-chat-${data.groupChat._id}"
                    name="my-attachment-chat"
                    class="attachment-chat chat-in-group"
                    data-chat="${data.groupChat._id}"
                  />
                  <i class="fa fa-paperclip"></i>
                </label>
                <a href="javascript:void(0)" class="video-chat-group">
                  <i class="fa fa-video-camera"></i>
                </a>
              </div>
            </div>
          </div>`
          $("#screen-chat").prepend(rightSideData);
        
          // Step 04: call function changeScreenChat
          changeScreenChat();
          notSupportVideoChat();
          
          // Step 05: handle imageModal
          let imgModalData = `
          <div class="modal fade" id="imagesModal_${data.groupChat._id}" role="dialog">
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

          // Step 06: call grid photo
          gridPhotos(5);

          // Step 07: handle attachmentModal
          let attachmentModalData = `
          <div class="modal fade" id="attachmentsModal_${data.groupChat._id}" role="dialog">
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

          // Step 08: handle membersModal
          let membersModalData = `
            <div class="modal fade" id="membersModal_${data.groupChat._id}" role="dialog">
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
          data.groupChat.membersInfo.forEach(member => {
            let html = `
              <div id="${member._id}" class="col-sm-2 member">
                <div class="thumbnail">
                  <img class="member-avatar" src="/images/users/${member.avatar}" alt="">
                  <div class="caption">
                    <p class="member-name ${data.groupChat.userId === member._id ? "admin" : "" }">
                      ${member.username}
                    </p>
                    <div class="member-talk" data-uid="${member._id}" >
                      Trò chuyện
                    </div> 
                  </div>
                </div>
              </div>`;

            $(`#membersModal_${data.groupChat._id}`).find(".all-members .row").append(html);
          });
          
          // step 09: call function leaveGroupChat 
          leaveGroupChat();

          // Step 10: handle membersModal
          let addMemberModalData = `
            <div class="modal fade" id="addMemberModal_${data.groupChat._id}" role="dialog">
              <div class="modal-dialog modal-lg">
                  <div class="modal-content">
                      <div class="modal-header">
                          <button type="button" class="close" data-dismiss="modal">&times;</button>
                          <h4 class="modal-title">Thêm thành viên.</h4>
                      </div>
                      <div class="modal-body">
                          <div class="input-group">
                              <input class="form-control input-find-member" data-uid="${data.groupChat._id}" placeholder="Nhập E-mail hoặc username..." aria-describedby="basic-addon2">
                              <span class="input-group-addon btn-find-member" >
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

          // Step 12: Emit new group created
          socket.emit("new-group-created", { groupChat: data.groupChat });

          // Step 13: update online

        }
      ).fail(function (response) {
        alertify.error(response.responseText, 5);
      });
    });
  });
}

$(document).ready(function () {
  $("#input-search-friend-to-add-group-chat").bind("keypress", callSearchFriend);
  $("#btn-search-friend-to-add-group-chat").bind("click", callSearchFriend);
  callCreateGroupChat();

  socket.on("response-new-group-created", (response) => {
    
    // Step 01: handle leftSide.js
    let subGroupChatName = response.groupChat.name;
    if (subGroupChatName.length > 15) {
      subGroupChatName = subGroupChatName.substr(0, 14) + "...";
    }
    let leftSideData = `
      <a href="#uid_${response.groupChat._id}" class="room-chat" data-target="#to_${response.groupChat._id}">
        <li class="person group-chat" data-chat="${response.groupChat._id}">
          <div class="left-avatar">
            <img src="images/users/group-avatar.png" alt="" />
          </div>
          <span class="name">
            <span class="group-chat-name">
              ${subGroupChatName}
            </span> 
          </span>
          <span class="time"></span>
          <span class="preview convert-emoji"></span>
        </li>
      </a>`;
    
    $("#all-chat").find("ul").prepend(leftSideData);

    // Step 02: handle rightSide.ejs
    let rightSideData = `
    <div class="right tab-pane" data-chat="${response.groupChat._id}" id="to_${response.groupChat._id}">
      <div class="top">
        <span>To: <span class="name">${response.groupChat.name}</span></span>
        <span class="chat-menu-right">
          <a class="leave-group-chat" id="${response.groupChat._id}" href="javascript:void(0)">
            Rời nhóm
            <i class="fa fa-sign-out"></i>
          </a>
        </span>
        <span class="chat-menu-right">
            <a href="javascript:void(0)">&nbsp;</a>
        </span>
        <span class="chat-menu-right">
          <a href="#addMemberModal_${response.groupChat._id}" data-toggle="modal">
            <span>Thêm thành viên</span>
            <i class="fa fa-plus-square"></i>
          </a>
        </span>
        <span class="chat-menu-right">
            <a href="javascript:void(0)">&nbsp;</a>
        </span>
        <span class="chat-menu-right">
          <a href="#attachmentsModal_${response.groupChat._id}" class="show-attachments" data-toggle="modal">
            Tệp đính kèm
            <i class="fa fa-paperclip"></i>
          </a>
        </span>
        <span class="chat-menu-right">
          <a href="javascript:void(0)">&nbsp;</a>
        </span>
        <span class="chat-menu-right">
          <a href="#imagesModal_${response.groupChat._id}" class="show-images" data-toggle="modal">
            Hình ảnh
            <i class="fa fa-photo"></i>
          </a>
        </span>
        <span class="chat-menu-right">
          <a href="javascript:void(0)">&nbsp;</a>
        </span>
        <span class="chat-menu-right">
          <a href="#membersModal_${response.groupChat._id}" class="number-members" data-toggle="modal">
            <span class="show-number-members" >${response.groupChat.usersAmount}</span>
            <span>Thành viên</span>
            <i class="fa fa-users"></i>
          </a>
        </span>
        <span class="chat-menu-right">
          <a href="javascript:void(0)">&nbsp;</a>
        </span>
        <span class="chat-menu-right">
          <a href="javascript:void(0)" class="number-messages" data-toggle="modal">
            <span class="show-number-messages" >${response.groupChat.messagesAmount}</span>
            <span>Tin nhắn</span>
            <i class="fa fa-comment-o"></i>
          </a>
        </span>
      </div>
      <div class="content-chat">
        <div class="chat chat-in-group" data-chat="${response.groupChat._id}">
          <img src="images/chat/message-loading.gif" class="message-loading" />
        </div>
      </div>
      <div class="write" data-chat="${response.groupChat._id}">
        <input type="text" class="write-chat chat-in-group" id="write-chat-${response.groupChat._id}" data-chat="${response.groupChat._id}" />
        <div class="icons">
          <a href="#" class="icon-chat" data-chat="">
            <i class="fa fa-smile-o"></i>
          </a>
          <label for="image-chat-${response.groupChat._id}">
            <input
              type="file"
              id="image-chat-${response.groupChat._id}"
              name="my-image-chat"
              class="image-chat chat-in-group"
              data-chat="${response.groupChat._id}"
            />
            <i class="fa fa-photo"></i>
          </label>
          <label for="attachment-chat-${response.groupChat._id}">
            <input
              type="file"
              id="attachment-chat-${response.groupChat._id}"
              name="my-attachment-chat"
              class="attachment-chat chat-in-group"
              data-chat="${response.groupChat._id}"
            />
            <i class="fa fa-paperclip"></i>
          </label>
          <a href="javascript:void(0)" class="video-chat-group">
            <i class="fa fa-video-camera"></i>
          </a>
        </div>
      </div>
    </div>`
    $("#screen-chat").prepend(rightSideData);
  
    // Step 03: call function changeScreenChat
    changeScreenChat();

    // Step 04: handle imageModal
    let imgModalData = `
    <div class="modal fade" id="imagesModal_${response.groupChat._id}" role="dialog">
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

    // Step 05: call grid photo
    gridPhotos(5);

    // Step 06: handle attachmentModal
    let attachmentModalData = `
    <div class="modal fade" id="attachmentsModal_${response.groupChat._id}" role="dialog">
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
    
    // Step 07: handle membersModal
    let membersModalData = `
    <div class="modal fade" id="membersModal_${response.groupChat._id}" role="dialog">
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
    response.groupChat.membersInfo.forEach(member => {
      let html = `
        <div id="${member._id}" class="col-sm-2 member">
          <div class="thumbnail">
            <img class="member-avatar" src="/images/users/${member.avatar}" alt="">
            <div class="caption">
              <p class="member-name ${response.groupChat.userId === member._id ? "admin" : "" }">
                ${member.username}
              </p>
              <div class="member-talk" data-uid="${member._id}" >
                Trò chuyện
              </div> 
            </div>
          </div>
        </div>`;

      $(`#membersModal_${response.groupChat._id}`).find(".all-members .row").append(html);
    });

    // step 09: call function leaveGroupChat 
    leaveGroupChat();

    // Step 10: Emit when member received a group chat
    socket.emit("member-received-group-chat", { groupChatId: response.groupChat._id });

    // Step 11: update online
  });
});
