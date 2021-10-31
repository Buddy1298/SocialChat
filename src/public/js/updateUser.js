let userAvatar = null;
let originAvatarSrc = null;
let userInfo = {};
let originUserInfo = {};

let userUpdatePassword = {};

function updateUserInfo() {
  $("#input-change-avatar").bind("change", function () {
    // Validation update user avatar in frontend
    const fileData = $(this).prop("files")[0];
    const math = ["image/png", "image/jpg", "image/jpeg"];
    const limit = 1048576; // byte = 1MB

    if ($.inArray(fileData.type, math) === -1) {
      alertify.notify(
        "Kiểu file Không hợp lệ, chỉ chấp nhận file png, jpg hoặc jpeg",
        "error",
        5
      );
      $(this).val(null);
      return;
    }

    if (fileData.size > limit) {
      alertify.notify("Ảnh có kích thước tối đa 1MB", "error", 5);
      $(this).val(null);
      return;
    }

    if (typeof FileReader !== "undefined") {
      const imagePreview = $("#image-edit-profile");
      imagePreview.empty();

      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        $("<img>", {
          src: e.target.result,
          id: "user-modal-avatar",
          class: "avatar img-circle",
          alt: "avatar",
        }).appendTo(imagePreview);
      };
      imagePreview.show();
      fileReader.readAsDataURL(fileData);

      let formData = new FormData();
      formData.append("avatar", fileData);
      userAvatar = formData;
    } else {
      alertify.notify(
        "Trình duyệt của bạn không hỗ trợ FileReader",
        "error",
        5
      );
    }
  });

  // Validation update user info in frontend
  $("#input-change-username").bind("change", function () {
    const username = $(this).val();
    const regUsername = new RegExp(
      /^[s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/
    );
    if (
      username.length < 3 ||
      username.length > 16 ||
      !regUsername.test(username)
    ) {
      alertify.notify(
        "Username gới hạn từ 3-16 kí tự và không chứa kí tự đặc biệt.",
        "error",
        5
      );
      $(this).val(originUserInfo.username);
      delete userInfo.username;
      return;
    }

    userInfo.username = username;
  });

  $("#input-change-gender-male").bind("click", function () {
    const gender = $(this).val();

    if (gender !== "male") {
      alertify.notify("Oops! dữ liệu trường không hợp lệ,", "error", 5);
      $(this).val(originUserInfo.gender);
      delete userInfo.gender;
      return;
    }

    userInfo.gender = gender;
  });

  $("#input-change-gender-female").bind("click", function () {
    const gender = $(this).val();

    if (gender !== "female") {
      alertify.notify("Oops! dữ liệu trường không hợp lệ.", "error", 5);
      $(this).val(originUserInfo.gender);
      delete userInfo.gender;
      return;
    }

    userInfo.gender = gender;
  });

  $("#input-change-address").bind("change", function () {
    const address = $(this).val();

    if (address.length < 3 || address.length > 30) {
      alertify.notify("Địa chỉ từ 3-30 kí tự.", "error", 5);
      $(this).val(originUserInfo.address);
      delete userInfo.address;
      return;
    }

    userInfo.address = address;
  });

  $("#input-change-phone").bind("change", function () {
    const phone = $(this).val();
    const regPhone = new RegExp(/^(0)[0-9]{9,10}$/);
    if (!regPhone.test(phone)) {
      alertify.notify("Số điện thoại bắt đầu từ 0, gồm 9-10 số.", "error", 5);
      $(this).val(originUserInfo.phone);
      delete userInfo.phone;
      return;
    }

    userInfo.phone = phone;
  });

  $("#input-change-current-password").bind("change", function () {
    const currentPassword = $(this).val();
    const regPassword = new RegExp(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/
    );

    if (!regPassword.test(currentPassword)) {
      alertify.notify(
        "Mật khẩu có ít nhất 8 kí tự, gồm chữ hoa, chữ số và kí tự đặc biệt",
        "error",
        5
      );
      $(this).val(null);
      delete userUpdatePassword.currentPassword;
      return;
    }

    userUpdatePassword.currentPassword = currentPassword;
  });

  $("#input-change-new-password").bind("change", function () {
    const newPassword = $(this).val();
    const regPassword = new RegExp(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/
    );

    if (!regPassword.test(newPassword)) {
      alertify.notify(
        "Mật khẩu có ít nhất 8 kí tự, gồm chữ hoa, chữ số và kí tự đặc biệt",
        "error",
        5
      );
      $(this).val(null);
      delete userUpdatePassword.newPassword;
      return;
    }

    userUpdatePassword.newPassword = newPassword;
  });

  $("#input-change-confirm-new-password").bind("change", function () {
    const confirmNewPassword = $(this).val();

    if (!userUpdatePassword.newPassword) {
      alertify.notify("Bạn chưa nhập mật khẩu mới", "error", 5);
      $(this).val(null);
      delete userUpdatePassword.confirmNewPassword;
      return;
    }

    if (confirmNewPassword !== userUpdatePassword.newPassword) {
      alertify.notify("Nhập lại mật khẩu chưa chính xác", "error", 5);
      $(this).val(null);
      delete userUpdatePassword.confirmNewPassword;
      return;
    }

    userUpdatePassword.confirmNewPassword = confirmNewPassword;
  });
}

function callUpdateUserAvatar() {
  $.ajax({
    url: "/user/update-avatar",
    type: "put",
    cache: false,
    contentType: false,
    processData: false,
    data: userAvatar,
    success: function (response) {
      console.log(response);
      // Display success
      $(".user-modal-alert-success")
        .css("display", "block")
        .find("span")
        .text(response.message);

      // Update avatar at navbar
      $("#navbar-avatar").attr("src", response.imgSrc);

      // Update origin avatar src
      originAvatarSrc = response.imgSrc;

      // Reset all
      $("#input-btn-cancel-user").click();
    },
    error: function (error) {
      // Display error
      $(".user-modal-alert-error")
        .css("display", "block")
        .find("span")
        .text(error.responseText);

      // Reset all
      $("#input-btn-cancel-user").click();
    },
  });
}

function callUpdateUserInfo() {
  $.ajax({
    url: "/user/update-info",
    type: "put",
    data: userInfo,
    success: function (response) {
      console.log(response);
      // Display success
      $(".user-modal-alert-success")
        .css("display", "block")
        .find("span")
        .text(response.message);

      // Update origin user info
      originUserInfo = Object.assign(originUserInfo, userInfo);

      // Update username at navbar
      $("#navbar-username").text(originUserInfo.username);

      // Reset all
      $("#input-btn-cancel-user").click();
    },
    error: function (error) {
      // Display error
      $(".user-modal-alert-error")
        .css("display", "block")
        .find("span")
        .text(error.responseText);

      // Reset all
      $("#input-btn-cancel-user").click();
    },
  });
}

function callLogout() {
  let timerInterval;
  Swal.fire({
    title: "Tự động đăng xuất sau 5 giây",
    position: "top-end",
    html: "Thời gian: <strong></strong> giây.",
    timer: 5000,
    timerProgressBar: true,
    onBeforeOpen: () => {
      Swal.showLoading();
      timerInterval = setInterval(() => {
        Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
      }, 1000);
    },
    onClose: () => {
      clearInterval(timerInterval);
    },
  }).then((result) => {
    $.get("/logout", function () {
      location.reload();
    });
  });
}

function callUpdateUserPassword() {
  $.ajax({
    url: "/user/update-password",
    type: "put",
    data: userUpdatePassword,
    success: function (response) {
      console.log(response);
      // Display success
      $(".user-modal-password-alert-success")
        .css("display", "block")
        .find("span")
        .text(response.message);

      // Reset all
      $("#input-btn-cancel-user-password").click();

      // Logout after change password success
      callLogout();
    },
    error: function (error) {
      // Display error
      $(".user-modal-password-alert-error")
        .css("display", "block")
        .find("span")
        .text(error.responseText);

      // Reset all
      $("#input-btn-cancel-user-password").click();
    },
  });
}

$(document).ready(function () {
  originAvatarSrc = $("#user-modal-avatar").attr("src");
  originUserInfo = {
    username: $("#input-change-username").val(),
    gender: $("#input-change-gender-male").is(":checked")
      ? $("#input-change-gender-male").val()
      : $("#input-change-gender-female").val(),
    address: $("#input-change-address").val(),
    phone: $("#input-change-phone").val(),
  };

  // Update user info after change value to update
  updateUserInfo();

  $("#input-btn-update-user").bind("click", function () {
    if ($.isEmptyObject(userInfo) && !userAvatar) {
      alertify.notify(
        "Bạn phải thay đổi thông tin trước khi cập nhật",
        "error",
        5
      );
    }

    // Call ajax update user avatar
    if (userAvatar) {
      callUpdateUserAvatar();
    }

    // Call ajx update user info
    if (!$.isEmptyObject(userInfo)) {
      callUpdateUserInfo();
    }
  });

  $("#input-btn-cancel-user").bind("click", function () {
    userAvatar = null;
    userInfo = {};

    $("#input-change-avatar").val(null);
    $("#user-modal-avatar").attr("src", originAvatarSrc);

    $("#input-change-username").val(originUserInfo.username);
    originUserInfo.gender === "male"
      ? $("#input-change-gender-male").click()
      : $("#input-change-gender-female").click();
    $("#input-change-address").val(originUserInfo.address);
    $("#input-change-phone").val(originUserInfo.phone);
  });

  $("#input-btn-update-user-password").bind("click", function () {
    if (
      !userUpdatePassword.currentPassword ||
      !userUpdatePassword.newPassword ||
      !userUpdatePassword.confirmNewPassword
    ) {
      alertify.notify("Bạn phải nhập đầy đủ thông tin", "error", 5);
      return;
    }

    Swal.fire({
      title: "Bạn có chắc muốn đổi mật khẩu?",
      text: "Bạn không thể hoàn tác lại qui trình này!",
      type: "info",
      showCancelButton: true,
      confirmButtonColor: "#82cc28",
      cancelButtonColor: "#ff7675",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (!result.value) {
        $("#input-btn-cancel-user-password").click();
        return;
      }
      callUpdateUserPassword();
    });
  });

  $("#input-btn-cancel-user-password").bind("click", function () {
    userUpdatePassword = {};

    $("#input-change-current-password").val(null);
    $("#input-change-new-password").val(null);
    $("#input-change-confirm-new-password").val(null);
  });
});
