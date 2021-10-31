$(document).ready(function () {
  $("#link-read-more-contacts-received").bind("click", function () {
    const skipNumber = $("#request-contact-received").find("li").length;

    $(this).css("display", "none");
    $(".read-more-contact-received-loader").css("display", "inline-block");

    $.get(`/contact/read-more-contacts-received?skipNumber=${skipNumber}`, function (data) {
      if(!data.newContactUsers.length) {
        alertify.notify("Bạn không còn yêu cầu nào để xem nữa cả.", "error", 5);
        $("#link-read-more-contacts-received").css("display", "inline-block");
        $(".read-more-contact-received-loader").css("display", "none");
        return;
      }

      data.newContactUsers.map(user => {
        $("#request-contact-received")
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
                  <div class="user-approve-request-contact-received" data-uid="${user._id}">
                      Chấp nhận
                  </div>
                  <div class="user-remove-request-contact-received action-danger" data-uid="${user._id}">
                      Xóa yêu cầu
                  </div>
              </div>
            </li>`); // thểm ổ modal notification
      });

      removeRequestContactReceived(); // js/removeRequestContactReceived.js
      approveRequestContactReceived() // js/approveRequestContactReceived.js

      $("#link-read-more-contacts-received").css("display", "inline-block");
      $(".read-more-contact-received-loader").css("display", "none");

      if($(`#request-contact-received .contactList`).find("._contactList").length === data.countAllContactsReceived) {
        $("#link-read-more-contacts-received").remove();
      }
    });
  });
});
