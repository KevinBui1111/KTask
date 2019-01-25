"use strict";

function make_popup(conf) {
  var id = 'kpopup-' + conf.id;
  var pop = 
'  <div class="kpopup" id="(p0)">' + 
'    <div class="kpop-header">' + 
'      <div class="kpop-title">(p1)</div>' + 
'      <div class="kpop-close">×</div>' + 
'    </div>' + 
'    <div class="kpop-content">' + 
'      (p2)' +
'    </div>' + 
    '  </div>'
  ;
  pop = pop.format(id, conf.title);
  if (conf.modal) {
    pop = '<div class="wrap-modal">' + pop + '</div>';
  }

  var content = conf.content ? conf.content : document.getElementById(conf.id).outerHTML;
  pop = $(pop);
  pop.find('.kpop-content').empty().append(content)

  toggle_blur();

  $('body').append(pop);

  // make draggable
  var dialog = document.getElementById(id);
  var wrapper = dialog.parentElement;
  $(dialog.parentElement).show();
  dialog.style.top = (wrapper.offsetHeight - dialog.offsetHeight) / 3 + 'px'; //'10%';
  dialog.style.left = (wrapper.offsetWidth - dialog.offsetWidth) / 2 + 'px';


  var header = dialog.getElementsByClassName('kpop-header')[0];

  header.addEventListener('mousedown', function (e) {
    var isDown = true;
    var offset = [
      dialog.offsetLeft - e.clientX,
      dialog.offsetTop - e.clientY
    ];

    function mousemove_event(event) {
      event.preventDefault();
      if (isDown) {
        var newX = Math.max(event.clientX + offset[0], 0);
        var newY = Math.max(event.clientY + offset[1], 0);
        newX = Math.min(newX, wrapper.offsetWidth - dialog.offsetWidth);
        newY = Math.min(newY, wrapper.offsetHeight - dialog.offsetHeight);

        dialog.style.left = newX + 'px';
        dialog.style.top = newY + 'px';
      }
    }

    document.addEventListener('mousemove', mousemove_event);
    document.addEventListener('mouseup', function mouseup_event() {
      isDown = false;
      this.removeEventListener('mousemove', mousemove_event);
      this.removeEventListener('mouseup', mouseup_event);
    });
  });

  var btnclose = dialog.getElementsByClassName('kpop-close')[0];
  
  function close_dialog() {
    dialog.style.animationName = 'animateup';
    dialog.addEventListener("animationend", function () {
      $(dialog.parentElement).remove();
      toggle_blur();
    });

    btnclose.removeEventListener('click', close_dialog);
  }

  btnclose.addEventListener("click", close_dialog);

  return {
    close: close_dialog
  }
}

function toggle_blur() {
  var wrap = document.body.children[0];
  if (wrap.id != 'wrap-container') {
    wrap = $('<div id="wrap-container" class="blur">');
    wrap.append($('body').children());
    $('body').append(wrap);
  }
  else 
    $(wrap).toggleClass('blur');
}

String.prototype.format = function () {
  var s = this;
  for (var i = 0; i < arguments.length; i++) {
    var reg = new RegExp("\\(p" + i + "\\)", "g");
    s = s.replace(reg, arguments[i]);
  }

  return s;
}
