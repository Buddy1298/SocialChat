function callFindUser(e) {
  if (e.which === 13 || e.type === "click") {
    let keyword = $("#input-find-users-contact").val();
    const regKeyword = new RegExp(/^[s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/)

    if (!keyword) {
      alertify.notify("Chưa nhập nội dung tìm kiếm.", "error", 5);
      return;
    }
    
    if(!regKeyword.test(keyword)) {
      alertify.notify("Nội dung tìm kiếm không được chứa kí tự đặc biệt, chỉ cho phép chữ cái, số và khoảng trống", "error", 5);
      return;
    }
    
    $.get(`/contact/find-users/${keyword}`, function (data) {
      $("#find-user ul").html(data);
      addContact(); // js/addContact.js
      removeRequestContactSent(); // js/removeRequestContactSent.js
    });
  }
}

$(document).ready(function () {
  $("#input-find-users-contact").bind("keypress", callFindUser);
  $("#btn-find-users-contact").bind("click", callFindUser);
});
