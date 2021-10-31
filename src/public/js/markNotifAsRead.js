function markNotificationAsRead(targetUser) {
  $.ajax({
    url: "/notification/mark-all-as-read",
    method: "put",
    data: { targetUser },
    success: function (response) {
      if(response) {
        targetUser.map(uid => {
          $(".noti_content").find(`div[data-uid = ${uid}]`).removeClass("notif-readed-false");
          $("ul.list-notifications").find(`li>div[data-uid = ${uid}]`).removeClass("notif-readed-false");
        });
        decreaseNumberNotification("noti_counter", targetUser.length);
      }
    }
  });
}

$(document).ready(function () {
  // Link at popup notifications
  $("#popup-mark-notif-as-read").bind("click", function () {
    let targetUser = [];
    $(".noti_content").find("div.notif-readed-false").each(function (index, notification) {
      targetUser.push($(notification).data("uid"))
    });
    if(!targetUser.length) {
      alertify.notify("Bạn không còn thông báo nào chưa đọc", "error", 5);
      return;
    }
    markNotificationAsRead(targetUser);
  });

  // Link at modal notification
  $("#modal-mark-notif-as-read").bind("click", function () {
    let targetUser = [];
    $("ul.list-notifications").find("li>div.notif-readed-false").each(function (index, notification) {
      targetUser.push($(notification).data("uid"))
    });
    if(!targetUser.length) {
      alertify.notify("Bạn không còn thông báo nào chưa đọc", "error", 5);
      return;
    }
    markNotificationAsRead(targetUser);
  });
});