var inDoingTest = false;
var gridnameRefresh = 'grid';
var on_update_success = UpdateSuccess;
var dialogOpening = false;
var mydialog;


function LoadPopup(url, data, title) {
  $.ajax({
    url: url,
    data: data,
    cache: false,
    success: function (content) {
      ShowPopup(title, content);
    },
    error: function () { alert('fail LoadPopup: ' + url); }
  });
}

function ShowPopup(title, content) {
  mydialog = make_popup({
    id: 'kpopup',
    content: content,
    title: title,
    modal: true
  });
}
function close_dialog() {
  mydialog.close();
}

function submit_form(e) {
  var form = $(e).closest("form")[0];
  if ($(form).valid()) {
    $.ajax({
      url: form.action,
      type: form.method,
      data: $(form).serialize(),
      success: on_update_success,
      error: function () { alert('fail onSubmit: ' + form.action); }
    });
  }
  return false;
}

function UpdateSuccess(e) {
  if (e.response) {
    var error_span = $('#error_span');
    if (error_span)
      error_span.html(e.response);
    else
      alert(e.response);
  }
  if (e.error == false)
    close_dialog();

  if (e.reload == true) {
    window.location = window.location;
  }

  if (gridnameRefresh == '') {
    refreshGrid();
  }
  else {
    refreshGridByName(gridnameRefresh);
  }
}

function refreshGrid() {
  var table = $.fn.dataTable.fnTables(true);
  $(table).each(function () {
    this.dataTable().fnReloadAjax();
  });
}

function refreshGridByName(grid_name) {
  var oTable = $('#' + grid_name).dataTable();
  oTable.fnReloadAjax();
}