$(document).ready(function () {
  $("#link-read-more-contacts").bind("click", function () {
    const skipNumber = $("#contacts").find("li").length;

    $(this).css("display", "none");
    $(".read-more-contact-loader").css("display", "inline-block");

    $.get(`/contact/read-more-contacts?skipNumber=${skipNumber}`, function (data) {
      if(!data.newContactUsers.length) {
        alertify.notify("Bạn không còn bạn bè nào để xem nữa cả.", "error", 5);
        $("#link-read-more-contacts").css("display", "inline-block");
        $(".read-more-contact-loader").css("display", "none");
        return;
      }

      data.newContactUsers.map(user => {
        $("#contacts")
          .find("ul")
          .append(
            `<li class="_contactList" data-uid="${user._id}">
              <div class="contactPanel">
                <div class="user-avatar">
                    <img src="images/users/${user.avatar}" alt="${user.username}">
                </div>
                <div class="user-name">
                    <p>${user.username}</p>
                </div>
                <br>
                <div class="user-address">
                    <span>&nbsp ${user.address || ""}</span>
                </div>
                <div class="user-talk" data-uid="${user._id}">
                    Trò chuyện
                </div>
                <div class="user-remove-contact action-danger" data-uid="${user._id}">
                    Xóa liên hệ
                </div>
              </div>
            </li>`); // thểm ổ modal notification
      });

      removeContact(); // js/removeContact.js

      $("#link-read-more-contacts").css("display", "inline-block");
      $(".read-more-contact-loader").css("display", "none");

      if($(`#contacts .contactList`).find("._contactList").length === data.countAllContacts) {
        $("#link-read-more-contacts").remove();
      }
    });
  });
});
