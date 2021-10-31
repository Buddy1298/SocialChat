function talk() {
  $(".search_item").off("mousedown").on("mousedown", function () {
    let targetId = $(this).data("uid");
    
    if($("#all-chat").find(`li[data-chat = "${targetId}"]`).length) {
      $("#all-chat").find(`li[data-chat = "${targetId}"]`).click();
      return;
    }
    
    if($(this).hasClass("group-chat")) {
      $.get(`/contact/talk-group/${targetId}`, function (data) {
        if (data.leftSideData.trim() === "") {
          alertify.error("Lỗi hãy tìm kiếm lại, hoặc F5 để refresh trang.", 5);
          return;
        }
        
        // Step 01: handle leftSide
        $(`#all-chat`).find("ul").prepend(data.leftSideData);
        
        // Step 02: handle scroll left
        nineScrollLeft();
        resizeNineScrollLeft();
        
        // Step 03: handle rightSide
        $("#screen-chat").prepend(data.rightSideData);
  
        // Step 04: Not support video chat
        notSupportVideoChat();

        // Step 05: call screenChat
        changeScreenChat();
  
        // Step 06: Enable chat emoji
        enableEmojioneArea();
  
        // Step 07: convert emoji
        convertEmoji();
  
        // Step 08: handle imageModal
        $("body").append(data.imageModalData);
  
        // Step 09: call function gridPhotos
        gridPhotos(5);
  
        // Step 10: handle attachmentModal
        $("body").append(data.attachmentModalData);
        
        // Step 11: handle membersModal
        $("body").append(data.membersModalData);

        // Step 12: handle membersModal
        $("body").append(data.addMemberModalData);

        // step 14: call function leaveGroupChat 
        leaveGroupChat();

        // Step 15: update online
        socket.emit("check-status");
  
        // Step 16: Read more messages
        readMoreMessages();
  
        // Step 17: Click chat with target group
        $("#all-chat").find(`li[data-chat = "${targetId}"]`).click();

        openModalImage();

      });
      return;
    }
    
    $.get(`/contact/talk-contact/${targetId}`, function (data) {
      if (data.leftSideData.trim() === "") {
        alertify.error("Lỗi hãy tìm kiếm lại, hoặc F5 để refresh trang.", 5);
        return;
      }
      
      // Step 01: handle leftSide
      $(`#all-chat`).find("ul").prepend(data.leftSideData);
      
      // Step 02: handle scroll left
      nineScrollLeft();
      resizeNineScrollLeft();
      
      // Step 03: handle rightSide
      $("#screen-chat").prepend(data.rightSideData);

      // Step 04: call screenChat
      changeScreenChat();

      // Step 05: Enable chat emoji
      enableEmojioneArea();

      // Step 06: convert emoji
      convertEmoji();

      // Step 07: handle imageModal
      $("body").append(data.imageModalData);

      // Step 08: call function gridPhotos
      gridPhotos(5);

      // Step 09: handle attachmentModal
      $("body").append(data.attachmentModalData);
      
      // Step 10: update online
      socket.emit("check-status");

      // Step 11: Read more messages
      readMoreMessages();

      // Step 12: Click chat with target user
      $("#all-chat").find(`li[data-chat = "${targetId}"]`).click();

      openModalImage();

    });

  });
}

function findNameConversation(e) {
  if (e.which === 13) {
    let keyword = $("#input-search").val();
    let regKeyword = new RegExp(/^[s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/)
    
    if (keyword.length < 1 || keyword.length > 16 || !regKeyword.test(keyword)) {
      alertify.error("Nội dung tìm kiếm không hợp lệ, giới hạn từ 1 - 16 kí tự và không chứa kí tự đặc biệt.", 5);
      return;
    }

    $.get(`/contact/find-name-conversations?keyword=${keyword}`, function (data) {
      $("#search-results").find(".search_content ul").html(data);
      talk();
    });

  }
}

$(document).ready(function () {
  $("#input-search").on("keypress", findNameConversation);
  $("#input-search").on("click", function (e) {
    $("#search-results").css("display", "block");
  });
  $("#input-search").on("blur", function () {
    $("#search-results").css("display", "none");
  });
});
