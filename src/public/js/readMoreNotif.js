$(document).ready(function () {
  $("#link-read-more-notif").bind("click", function () {
    const skipNumber = $("ul.list-notifications").find("li").length;

    $(this).css("display", "none");
    $(".read-more-notif-loader").css("display", "inline-block");

    $.get(`/notification/read-more?skipNumber=${skipNumber}`, function (notifications) {
      if(!notifications.length) {
        alertify.notify("Bạn không còn thông báo nào để xem nữa cả.", "error", 5);
        $("#link-read-more-notif").css("display", "inline-block");
        $(".read-more-notif-loader").css("display", "none");
        return;
      }

      notifications.map(notification => {
        $("ul.list-notifications").append(`<li>${notification}</li>`); // thểm ổ modal notification
      });

      $("#link-read-more-notif").css("display", "inline-block");
      $(".read-more-notif-loader").css("display", "none");
    });
  });
});
