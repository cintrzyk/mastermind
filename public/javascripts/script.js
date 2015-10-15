$(document).ready(function() {
  var colors = {
    0: 'brown',
    1: 'red',
    2: 'yellow',
    3: 'blue',
    4: 'green',
    5: 'pink',
    6: 'black',
    7: 'grey',
    8: 'orange',
    9: 'purple'
  };

  var create_option = function (min, max, current) {
    return {
      'custom': false,
      'min': min,
      'max': max,
      'current': current
    }
  };

  var settings = {
    size: create_option(2, 15, 5),
    dim: create_option(2, 9, 9),
    max: create_option(10, 30, null)
  }

  var update_settings = function (type, current) {
    settings[type].current = current;
    settings[type].custom = true;
  };


  $(".sliders").each(function() {
    var type = this.id.split('-')[1];
    var input_field = $("#" + type);
    var that = this;

    $(this).slider({
      orientation: "vertical",
      range: "min",
      min: settings[type].min,
      max: settings[type].max,
      value: settings[type].current,
      slide: function(event, ui) {
        input_field.val(ui.value);
        update_settings(type, ui.value);
      }
    });

    input_field
      .attr('min', settings[type].min)
      .attr('max', settings[type].max)
      .val($(this).slider("value"))
      .on('input', function () {
        $(that).slider("value", input_field.val());
        update_settings(type, input_field.val());
      });
  });

  $('#start-game').on('click', function () {
    var url = "/play/";

    for (var opt in settings) {
      var obj = settings[opt];
      if (obj.custom) {
        url += opt + '/' + obj.current + '/';
      }
    };

    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      success: function(data, textStatus, xhr) {
        start_game(data);
      },
      error: function(xhr, textStatus, errorThrown) {
        alert('Gra nie może być rozpoczęta :(');
      }
    });
  });

  var create_circle = function (color_number) {
    return " \
    <div class='btn-group btn-group-vertical'> \
      <div class='btn-group nav-color'> \
        <div class='prev-color btn btn-small'><i class='icon-angle-left'></i></div> \
        <div class='next-color btn btn-small'><i class='icon-angle-right'></i></div> \
      </div> \
      <div class='btn-circle btn disabled'> \
        <i data-color='" + color_number + "' class='icon-circle icon-2x' style='color: " + colors[color_number] + ";'></i> \
      </div> \
    </div>";
  };

  var start_game = function (data) {
    var game_table_body = $('#game-field table tbody'),
      get_icon_circle = function (e) {
        return $(e).parent().next().find('.icon-circle');
      };

    $('.hide-on-start').remove(); // clear view before playing
    $('#game-field').removeClass('hidden'); // show game field

    $('.container:first').prepend(function () {
      var msg = " \
        <p class='alert alert-info'> \
          <span class='label label-info'>liczba kolorów " + settings.dim.current + " </span> \
          <span class='label label-warning'>ilość kółek " + settings.size.current + " </span> \
          <span class='pull-right'>";
      for (var i = 0; i < settings.dim.current; i++) {
        msg += " <i class='icon-circle icon-large' style='color: " + colors[i] + "; '></i>"
      };
      msg += "</span></p>";
      return msg;
    });

    $('#game-field table tbody').append("<tr><td><div class='btn-group'></div></td><td></td></tr>");

    for (var i = 0; i < settings.size.current; i++) {
      $('.btn-group', game_table_body)
        .first()
          .append(create_circle(0));
    }

    $('.next-color, .prev-color')
      .click(function () {
        if ($(this).hasClass('next-color')) {
          change_color(get_icon_circle(this), 'next-color');
        } else if ($(this).hasClass('prev-color')) {
          change_color(get_icon_circle(this), 'prev-color');
        }
      });
  };

  var change_color = function (e, change_case) {
    var new_color,
      current_color = parseInt(e.attr('data-color'), 10);

    if (change_case === 'next-color') {
      if (current_color === settings.dim.current-1) {
        new_color = 0;
      }
      else {
        new_color = ++current_color;
      }
    } else if (change_case === 'prev-color') {
      if (current_color === 0) {
        new_color = settings.dim.current-1;
      }
      else {
        new_color = --current_color;
      }
    } else {
      return;
    }

    e
      .attr('data-color', new_color)
      .css('color', colors[new_color]);
  };

  $('#accept_state').click(function () {
    var first_table_row = $('#game-field').find('tr').first(),
      url = '/mark/';

    $('.icon-circle', first_table_row).each(function () {
      url += $(this).attr('data-color') + '/';
    });

    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      success: function(data, textStatus, xhr) {
        var player_won = (parseInt(data.retVal.black_points, 10) === parseInt(settings.size.current, 10));
        if (data.retVal.game_over) {
          alert('GAME OVER !!!');
        } else {
            if (data.retVal.attempts_left === 0 || player_won) {
              $('#accept_state').hide();
            } else {
              create_next_row();
            }
            create_result(data.retVal, player_won);
          }
      },
      error: function(xhr, textStatus, errorThrown) {
        alert("Nie można wysłać rozwiazania!");
      }
    });

  });

  var create_next_row = function () {
    var row = $('#game-field table tbody').find('tr').first();
    row
      .clone()
      .insertAfter(row);
  };

  var create_result = function (retVal, player_won) {
    var print_points = function () {
        var circles = "",
          i;
        for (i = 0; i < retVal.black_points; i++) {
          circles += " <i class='icon-circle'></i>";
        };
        for (i = 0; i < retVal.white_points; i++) {
          circles += " <i class='icon-circle-blank'></i>";
        };

        return circles;
      },
      print_and_clear = function (e) {
        e
          .find('td')
            .last()
            .append(function () {
              return print_points();
            })
          .prev()
          .find('.btn-group-vertical')
            .removeClass('btn-group-vertical')
            .find('.nav-color')
              .remove();
      },
      first_row = $('#game-field table tbody').find('tr').first();

      if (retVal.attempts_left === 0 || player_won) {
        print_and_clear(first_row);
        if (player_won){
          alert("GRATULACJE! Dopasowałeś wszystkie w " + $('#game-field table tbody tr').length + " ruchach!");
        } else {
          alert("Niestety ale skończyły ci się ruchy...");
        }
      } else {
          print_and_clear(first_row.next());
      }
  };

  $('#attempts-btn').click(function (e) {
    e.preventDefault();
    $(this).parent().hide();
    $("#attempts-slider").removeClass('hidden');
    settings.max.custom = true;
    settings.max.current = settings.max.min;
  });

});
