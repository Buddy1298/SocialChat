function removeContact() {
  $(".user-remove-contact")
    .off("click")
    .on("click", function () {
      let targetId = $(this).data("uid");
      let username = $(this).parent().find("div.user-name p").text();

      Swal.fire({
        title: `Bạn có chắc chắn muốn xóa ${username} khỏi danh bạ`,
        text: "Bạn không thể hoàn tác lại qui trình này!",
        type: "warning",
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
          url: "/contact/remove-contact",
          type: "delete",
          data: { uid: targetId },
          success: function (data) {
            if (data.success) {
              $("#contacts").find(`ul li[data-uid = ${targetId}]`).remove();
              decreaseNumberNotifContact("count-contacts"); // js/caculateNotifContact.js

              socket.emit("remove-contact", { contactId: targetId });

              // All step handle chat after remove
              // Step 00: check active
              let checkActive = $("#all-chat").find(`li[data-chat = ${targetId}]`).hasClass("active");

              // Step 01: remove leftSide.ejs
              $("#all-chat").find(`ul a[href = "#uid_${targetId}"]`).remove();

              // Step 02: remove rightSide.ejs
              $("#screen-chat").find(`div#to_${targetId}`).remove();

              // Step 03: remove imgModal, attachModal
              $("body").find(`#imagesModal_${targetId}`).remove();
              $("body").find(`#attachmentsModal_${targetId}`).remove();
              
              // Step 04: CLick first conversation
              if (checkActive) {
                $("ul.people").find("a")[0].click();
              } 

              // Step 07: reset create group
              $("#btn-cancel-group-chat").click();
            }
          },
        });

      });
    });
}

socket.on("response-remove-contact", function (user) {
  $("#contacts").find(`ul li[data-uid = ${user.id}]`).remove();
  decreaseNumberNotifContact("count-contacts"); // js/caculateNotifContact.js
  
  // All step handle chat after remove
  // Step 00: check active
  let checkActive = $("#all-chat").find(`li[data-chat = ${user.id}]`).hasClass("active");

  // Step 01: remove leftSide.ejs
  $("#all-chat").find(`ul a[href = "#uid_${user.id}"]`).remove();

  // Step 02: remove rightSide.ejs
  $("#screen-chat").find(`div#to_${user.id}`).remove();

  // Step 03: remove imgModal, attachModal
  $("body").find(`#imagesModal_${user.id}`).remove();
  $("body").find(`#attachmentsModal_${user.id}`).remove();

  // Step 04: CLick first conversation
  if (checkActive) {
    $("ul.people").find("a")[0].click();
  } 
});

$(document).ready(function () {
  removeContact();
});
