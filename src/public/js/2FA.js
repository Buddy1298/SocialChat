const bindEventToBtnEnable = function () {
  $("#btn-enable-2fa").off("click").on("click", function () {
    $.ajax({
      url: "/enable-2fa",
      type: "post",
      success: function (data) {
        const btnDisableHTML = '<button id="btn-disable-2fa" class="btn btn-default custom-background-btn-reset">Tắt xác thực 2 lớp</button>';
        $("#btn-enable-2fa").replaceWith(btnDisableHTML);
        bindEventToBtnDisable();
        $("#qr-code-img-area").html(data);
      },
      error: function (error) {
        const alertHTML = `<div class="alert alert-danger alert-dismissible" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            ${error.responseText}
        </div>`
        $("#2fa-error-area").html(alertHTML);
      }
    });
  });
}

const bindEventToBtnDisable = function () {
  $("#btn-disable-2fa").off("click").on("click", function () {
    $.ajax({
      url: "/disable-2fa",
      type: "post",
      success: function (data) {
        if(data.success) {
          const btnEnableHTML = '<button id="btn-enable-2fa" class="btn btn-primary custom-background-btn-primary">Bật xác thực 2 lớp</button>';
          $("#btn-disable-2fa").replaceWith(btnEnableHTML);
          bindEventToBtnEnable();
          $("#qr-code-img-area").find("img[alt='qr-code-img']").remove();
        }
      },
      error: function (error) {
        const alertHTML = `<div class="alert alert-danger alert-dismissible" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            ${error.responseText}
        </div>`
        $("#2fa-error-area").html(alertHTML);
      }
    });
  });
}

$(document).ready(function () {
  bindEventToBtnEnable();
  bindEventToBtnDisable();
});