function openModalImage() {
  $(".show-image-chat").off("click").on("click", function () {
    $("#modal-image").css("display", "block");
    $("#modal-image").find("#img-content").attr("src", this.src);
  });
}

$(document).ready(function () {
  $("#modal-image").find(".close").on("click", function () {
    $("#modal-image").css("display", "none");
  });

  openModalImage();
});
