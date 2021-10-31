
const socket = io();

function nineScrollLeft() {
  $('.left').niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
}

function resizeNineScrollLeft() {
  $(".left").getNiceScroll().resize();
}

function resizeNineScrollRight() {
  $(".chat").getNiceScroll().resize();
}


function nineScrollRight(divId) {
  if($(`.right .chat[data-chat = ${divId}]`).length) {
    $(`.right .chat[data-chat = ${divId}]`).niceScroll({
      smoothscroll: true,
      horizrailenabled: false,
      cursorcolor: '#ECECEC',
      cursorwidth: '7px',
      scrollspeed: 50
    });
    $(`.right .chat[data-chat = ${divId}]`).scrollTop($(`.right .chat[data-chat = ${divId}]`)[0].scrollHeight);
  }
}

function enableEmojioneArea(divId) {
  $(`#write-chat-${divId}`).emojioneArea({
    standalone: false,
    pickerPosition: 'top',
    filtersPosition: 'bottom',
    tones: false,
    autocomplete: false,
    inline: true,
    hidePickerOnBlur: true,
    search: false,
    shortnames: false,
    events: {
      keyup: function(editor, event) {
        // Gán giá trị thay đổi vào thể input đã bị ẩn
        $(`#write-chat-${divId}`).val(this.getText());
      },
      click: function() {
        // Bật lắng nghe DOM cho việc chat tin nhắn + emoji
        textAndEmojiChat(divId);

        // Bật chức năng người dùng đang gõ trò chuyện
        typingOn(divId);
      },
      blur: function () {
        // Tắt chức năng người dùng đang gõ trò chuyện
        typingOff(divId);
      }
    },
  });
  $('.icon-chat').bind('click', function(event) {
    event.preventDefault();
    $('.emojionearea-button').click();
    $('.emojionearea-editor').focus();
  });
}

// function spinLoaded() {
//   $('.master-loader').css('display', 'none');
// }

// function spinLoading() {
//   $('.master-loader').css('display', 'block');
// }

// function ajaxLoading() {
//   $(document)
//     .ajaxStart(function() {
//       spinLoading();
//     })
//     .ajaxStop(function() {
//       spinLoaded();
//     });
// }

function showModalContacts() {
  $('#show-modal-contacts').click(function() {
    $(this).find('.noti_contact_counter').fadeOut('slow');
  });
}

function configNotification() {
  $('#noti_Button').click(function() {
    $('#notifications').fadeToggle('fast', 'linear');
    $('.noti_counter').fadeOut('slow');
    return false;
  });
  $(".main-content").click(function() {
    $('#notifications').fadeOut('fast', 'linear');
  });
}

function gridPhotos(layoutNumber) {
  $(".show-images").off("click").on("click", function () {
    let href = $(this).attr("href");  
    let modalImageId = href.replace("#", "");

    let originDataImage = $(`#${modalImageId}`).find("div.modal-body").html();

    let countRows = Math.ceil($(`#${modalImageId}`).find('div.all-images>img').length / layoutNumber);
    let layoutStr = new Array(countRows).fill(layoutNumber).join("");

    $(`#${modalImageId}`).find('div.all-images').photosetGrid({
      highresLinks: true,
      rel: 'withhearts-gallery',
      gutter: '2px',
      layout: layoutStr,
      onComplete: function() {
        $(`#${modalImageId}`).find(".all-images").css({
          'visibility': 'visible'
        });
        $(`#${modalImageId}`).find('.all-images a').colorbox({
          photo: true,
          scalePhotos: true,
          maxHeight: '90%',
          maxWidth: '90%'
        });
      }
    });

    // Bắt sự kiện đóng modal
    $(`#${modalImageId}`).on('hidden.bs.modal', function () {
      $(this).find("div.modal-body").html(originDataImage);
    });
  });

}

function flashMasterNotify() {
  const notify = $(".master-success-message").text();
  if(notify.length) {
    alertify.notify(notify, "success", 5);
  }
}

function changeTypeChat() {
  $("#select-type-chat").on("change", function () {
    let optionSelected = $("option:selected", this);
    optionSelected.tab("show");
  })
}

function changeScreenChat() {
  $(".room-chat").off("click").on("click", function () {
    let divId = $(this).find("li").data("chat");
    
    $(".person").removeClass("active");
    $(`.person[data-chat = ${divId}]`).addClass("active");

    $(this).tab("show");

    // Cấu hình thanh cuộn bên box chat rightSide.ejs mỗi khi mà mình click chuột vào 1 cuộc trò chuyện cụ thể
    nineScrollRight(divId);
    resizeNineScrollRight();
    
    // Bật emoji, tham số truyền vào là id của box nhập nội dung tin nhắn
    enableEmojioneArea(divId);

    // Bật lắng nghe DOM cho việc chat tin nhắn hình ảnh
    imageChat(divId);

    // Bật lắng nghe DOM cho việc chat tin nhắn tệp
    attachmentChat(divId);

    // Bật lắng nghe DOM chi việc gọi video
    videoChat(divId);

    if ($(".person.active").hasClass("group-chat")) {
      // gắn sự kiện tìm user để thêm vào group chat
      bindEventfindUsersToAddGroupChat(divId);
      talkWithMember();
    }
  })
}

function convertEmoji() {
  $(".convert-emoji").each(function() {
    var original = $(this).html();
    var converted = emojione.toImage(original);
    $(this).html(converted);
});
}

function bufferToBase64(arrayBuffer) {
  return btoa(
    new Uint8Array(arrayBuffer)
      .reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
}

function lastItemFromArr(arr) {
  if(!arr.length) return [];
  return arr[arr.length - 1];
}

function convertTimestampHumanTime(timestamp) {
  if(!timestamp) {
    return "";
  }
  return moment(timestamp).locale("vi").startOf("second").fromNow();   
}

function notifNoFriendLogin() {
  if(!$("ul.people").find("a").length) {
    Swal.fire({
      title: "Bạn chưa có bạn bè, hãy tìm kiếm bạn bè để trò chuyện!",
      type: "info",
      confirmButtonColor: "#82cc28",
      confirmButtonText: "Xác nhận",
      width: "52rem",
    }).then((result) => {
      if (!result.value) return;
      $("#contactsModal").modal("show");
    });
  }
}

$(document).ready(function() {
  // Hide số thông báo trên đầu icon mở modal contact
  showModalContacts();

  // Bật tắt popup notification
  configNotification();

  // Cấu hình thanh cuộn
  nineScrollLeft();

  // Icon loading khi chạy ajax
  // ajaxLoading();

  // Hiển thị hình ảnh grid slide trong modal tất cả ảnh, tham số truyền vào là số ảnh được hiển thị trên 1 hàng.
  // Tham số chỉ được phép trong khoảng từ 1 đến 5
  gridPhotos(5);

  // Flash message ở màn hình master
  flashMasterNotify();

  // Thay đổi kiểu trò chuyện
  changeTypeChat();

  // Thay đởi màn hình chat 
  changeScreenChat();

  notifNoFriendLogin();

  if($("ul.people").find("a").length) {
    $("ul.people").find("a")[0].click();
  }

  // Convert unicode thành hình ảnh cảm xúc
  convertEmoji();
});
