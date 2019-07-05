"use strict";

var cur_date, today, first_day;
var task;
const TIME_WEEK = 1000 * 60 * 60 * 24 * 7
  , TIME_DAY = 1000 * 60 * 60 * 24
  , TIME_HOUR = 1000 * 60 * 60
  , FORMAT_DATE = 'dd/MM/yyyy'
  ;
var 
  COLOR_LIST = [
      "darkorange",
      "crimson",
      "darkcyan",
      "firebrick",
      "slateblue",
      "goldenrod",
      "royalblue",
      "darkviolet",
      "olivedrab",
      "slategrey",
      "dodgerblue",
      "palevioletred",
      "saddlebrown",
      "chocolate",
      "lightseagreen",
      "darkslategray"
  ],
  event_list = [
//      new Event({ title: '111', start: '2017-06-23', end: '2017-06-27' })
//    , new Event({ title: '222', start: '2017-07-02', end: '2017-07-06' })
//    , new Event({ title: '333', start: '2017-07-04', end: '2017-07-04' })
//    , new Event({ title: '444', start: '2017-07-10', end: '2017-07-10' })
//    , new Event({ title: '555', start: '2017-07-12', end: '2017-07-15' })
//    , new Event({ title: '666', start: '2017-07-13', end: '2017-07-15' })
//    , new Event({ title: '777', start: '2017-07-15', end: '2017-07-17' })
//    , new Event({ title: '888', start: '2017-07-17', end: '2017-07-18' })
//    , new Event({ title: '999', start: '2017-07-18', end: '2017-07-19' })
//    , new Event({ title: '100', start: '2017-07-18', end: '2017-07-18' })
//    , new Event({ title: '110', start: '2017-07-20', end: '2017-07-21' })
//    , new Event({ title: '120', start: '2017-07-19', end: '2017-07-21' })
//    , new Event({ title: '130', start: '2017-07-21', end: '2017-07-23' })
//    , new Event({ title: '140', start: '2017-08-02', end: '2017-08-05' })
//    , new Event({ title: '150', start: '2017-08-03', end: '2017-08-04' })
//    , new Event({ title: '160', start: '2017-08-06', end: '2017-08-06' })
  ],
  DAY_OFF = []
  ;

const URL_GET = 'http://localhost:10101/Help/la_get'
  ,URL_UPDATE = 'http://localhost:10101/Help/la_update'
;
$(document).ready(function () {
  cur_date = new Date;
  cur_date.setHours(0, 0, 0, 0);
  today = new Date(cur_date)
  load_curr_month(cur_date);

  la_get()
  event_list = localStorage.events ? JSON.parse(localStorage.events) : [];
  event_list.forEach(function (event, index) {
    this[index] = new Event(event);
    this[index].id = event.id;
    append_task_list(this[index]);
  }, event_list);

  show_all_task();

  apply_datepicker();

});

function on_receive_data(data) {

}

String.prototype.format = function () {
  var s = this;
  for (var i = 0; i < arguments.length; i++) {
    var reg = new RegExp("\\(p" + i + "\\)", "g");
    s = s.replace(reg, arguments[i]);
  }

  return s;
}

function apply_datepicker() {
  $('.input-date').datepicker({
    weekStart: 1,
    todayBtn: "linked",
    daysOfWeekDisabled: "0,6",
    daysOfWeekHighlighted: "0,6",
    autoclose: true,
    format: "dd/mm/yyyy"
  });
}
function load_curr_month(date) {
  var day = new Date(date);
  day.setHours(0, 0, 0, 0); // remove time
  day.setDate(1); // set first date of month

  var cur_month = day.getMonth();
  day.setDate(day.getDate() -
    (get_day_week_nth(day) == 1 ? 7 : get_day_week_nth(day) - 1)
  );

  first_day = new Date(day);

  var dom = '';
  $('.kalendar .ka-row').remove();
  for (var i = 0; i < 6; ++i) {
    //dom += '<div class="row kal-week">';
    for (var d = 0; d < 7; ++d) {
      // check the day is weekend
      if (day.getDay() == 6 || day.getDay() == 0) {// sat or sun
        DAY_OFF.push(+day);
      }

      var td = $('#day_temp .ka-week th:eq(' + d + '),#day_temp .ka-back td:eq(' + d + ')');

      if (day.getMonth() == cur_month)
        td.removeClass('otherMonth');
      else
        td.addClass('otherMonth');

      if (+day == +today)
        td.eq(0).addClass('ka-today');
      else
        td.eq(0).removeClass('ka-today');

      td.data('date', +day);
      td.find('.dayNumber').html(day.getDate());

      let lunarDate = getLunarDate(day.getDate(), day.getMonth() + 1, day.getFullYear());
      let lunar = lunarDate.day
      if (day.getDate() == 1 || lunarDate.day == 1 || i + d == 0)
        lunar = lunarDate.day + "/" + lunarDate.month;
      td.find('.lunardayNumber').html(lunar);

      day.setDate(day.getDate() + 1);
    }
    $('.kalendar').append($('#day_temp').children().clone());
    //dom += '</div>';
  }

  $('.kal-body .kal-week').remove();
  $('.kal-body').append(dom);
  $('#titleCal').html(cur_date.format('MM/yyyy'));
}
function load_prev_month() {
  cur_date.setMonth(cur_date.getMonth() - 1);
  load_curr_month(cur_date);
  show_all_task();
}
function load_next_month() {
  cur_date.setMonth(cur_date.getMonth() + 1);
  load_curr_month(cur_date);
  show_all_task();
}

function show_all_task() {
  var day_event = {},
    week_event = {},
    week, event, dom = '',
    process_event_list = [];

  //process_event_list = event_list;
  event_list.forEach(function (event, index) {
    //// set color
    //event.color = COLOR_LIST[index % COLOR_LIST.length];

    var start = +event.start,
        end = start;
    
    var is_work = DAY_OFF.indexOf(end) == -1;
    for (end = start + TIME_DAY; end <= event.end; end += TIME_DAY) {
      if (DAY_OFF.indexOf(end) >= 0) {
        if (is_work) {
          process_event_list.push(new Event({ start: start, end: end - TIME_DAY, event: event}));
        }
        is_work = false;
      }
      else {
        if ((new Date(end)).getDay() == 1) {// first day of week / monday
          if (is_work) {
            process_event_list.push(new Event({ start: start, end: end - TIME_DAY, event: event }));
          }
          start = end;
        }
        if (!is_work) {
          start = end;
        }
        is_work = true;
      }
    }
    if (is_work)
      process_event_list.push(new Event({ start: start, end: event.end, event: event }));
  });
  // sort event_list
  process_event_list.sort(function (x, y) {
    var ret = x.start - y.start;
    if (ret == 0)
      ret = (y.event.end - y.event.start) - (x.event.end - x.event.start);
    return ret;
  });

  process_event_list.forEach(function (event) {
    // push event to date
    if (!day_event[+event.start]) day_event[+event.start] = [];
    day_event[+event.start].push(event);
    // push event to week
    week = get_week_start(event.start);
    week_event[week] = week_event[week] == undefined ? 1 : week_event[week] + 1
  });

  week = +first_day;
  $(".kalendar .ka-row").each(function (index) {
    while (week_event[week]) {
      dom += '<tr>';
      for (var i = 0, day = week; i < 7; ++i, day = week + i * TIME_DAY) {
        event = undefined;
        if (day_event[day]) event = day_event[day].shift();

        if (event) {
          var leng = (event.end - event.start) / TIME_DAY + 1;
          dom += '<td colspan="' + leng + '"><div class="ka-event" style="background-color: ' + event.event.color + '">' + event.title + '</div></td>';

          --week_event[week];
          i += leng - 1;
        }
        else {
          dom += '<td></td>';
        }
      }
      dom += '</tr>';
    }

    $(this).find('.ka-week table tbody').html(dom);

    week += TIME_WEEK;
    dom = '';
  });

}
//---------------------
function Event(obj) {
  this.id = obj.event ? obj.event.id : get_max_event_id() + 1;
  this.title = obj.event ? obj.event.title : obj.title;
  this.start = new Date(obj.start);
  this.start.setHours(0, 0, 0, 0);
  this.end = new Date(obj.end);
  this.end.setHours(0, 0, 0, 0);
  this.event = obj.event ? obj.event : undefined;

  this.color = obj.event ? obj.event.color : (obj.color ? obj.color : COLOR_LIST[this.id % COLOR_LIST.length]);
}
function FEvent(title, start, end) {
  this.title = title;
  this.start = start;
  this.end = moment(end).add(1, 'day').format('YYYY-MM-DD');
}
function get_week_start(date) {
  date = new Date(date);
  return +date -
    (get_day_week_nth(date) - 1) * TIME_DAY;
}

function get_day_week_nth(date) {
  return date.getDay() == 0 ? 7 : date.getDay();

}

function add_task() {
  var task_name = $('#in-task-name').val().trim();
  var start_txt = $('#in-start-date').val();
  var due_txt = $('#in-due-date').val();
  var start = Date.parseString(start_txt, FORMAT_DATE);
  var due = Date.parseString(due_txt, FORMAT_DATE);
  var error;

  if (error = task_name == '') {
    console.error('invalid task');
  }
  if (!error && (error = !start)) {
    console.error('invalid start');
  }
  if (!error && (error = !due)) {
    console.error('invalid due');
  }

  if (!error && (error = due < start)) {
    console.error('due < start');
  }

  if (error) return;

  var event = new Event({
      title: task_name
    , start: start
    , end: due
  });

  event_list.push(event);

  append_task_list(event);

  $('#in-task-name').val('');

  save_storage();

  show_all_task();
}

function get_max_event_id() {
  var max = 0;
  if (event_list)
    event_list.forEach(function (event, index) {
      if (max < event.id) max = event.id;
    });
  return max;
}
function remove_task(id) {
  // remove from task grid
  $('#dv_task .tb-task tr[data-task-id=' + id + ']').remove();
  // remove from list
  event_list = event_list.filter(obj => obj.id != id);
  save_storage();
  // refresh calendar
  show_all_task();
}

function show_edit_task(id) {
  var e = get_task(id);
  $('#edit_task_temp #event-id').val(id);
  $('#edit_task_temp #in-start-date').val(e.start.format(FORMAT_DATE));
  $('#edit_task_temp #in-due-date').val(e.end.format(FORMAT_DATE));
  $('#edit_task_temp #in-task-name').val(e.title);

  var content = $('#edit_task_temp').clone();
  ShowPopup('Edit task', content);
  apply_datepicker();
}
function edit_task() {
  var event_id = $('.kpopup #event-id').val();
  var task_name = $('.kpopup #in-task-name').val().trim();
  var start_txt = $('.kpopup #in-start-date').val();
  var due_txt = $('.kpopup #in-due-date').val();
  var start = Date.parseString(start_txt, FORMAT_DATE);
  var due = Date.parseString(due_txt, FORMAT_DATE);
  var error;

  if (error = task_name == '') {
    console.error('invalid task');
  }
  if (!error && (error = !start)) {
    console.error('invalid start');
  }
  if (!error && (error = !due)) {
    console.error('invalid due');
  }

  if (!error && (error = due < start)) {
    console.error('due < start');
  }

  if (error) return;

  var e = get_task(event_id);
  e.start = start;
  e.end = due;
  e.title = task_name;

  var row = $('.tb-task .ta-row[data-task-id="' + event_id + '"] td');
  row.eq(1).html(task_name);
  row.eq(2).html(start_txt);
  row.eq(3).html(due_txt);

  close_dialog();

  save_storage();
  show_all_task();
}
function get_task(id) {
  return event_list.find(event => id == event.id);
}
function save_storage() {
  localStorage.events = JSON.stringify(event_list);
}

function append_task_list(event) {
  var rows = $('#table_temp .ta-row');
  var ta_row = rows[0].outerHTML
    .format(event.id, event.title, event.start.format(FORMAT_DATE), event.end.format(FORMAT_DATE));
  $('#dv_task .tb-task tbody').append(ta_row);
}

function toggle_show_lunar_day(e) {
  if (e.checked)
    [...document.getElementsByClassName('lunardayNumber')].forEach(d => d.classList.remove('hidden'));
  else
    [...document.getElementsByClassName('lunardayNumber')].forEach(d => d.classList.add('hidden'));
}

function la_get(url) {
  $.getJSON (
    URL_GET,
    {
      username: 'kevinbui',
      web_app: 'knote',
    },
    on_receive_data
  )
  .fail(function(jqxhr, textStatus, error)  {
    console.log( "error" );
  })
}

function la_update(url) {
  $.post (
    URL_UPDATE,
    {
      username: 'kevinbui',
      web_app: 'knote',
      data_content: '2352 3523 523 5'
    },
    function (data){
      //alert('Thanks! ' + JSON.stringify(data));
    }
  )
  .fail(function(jqxhr, textStatus, error)  {
    console.log( "error la_update " + error );
  })
}