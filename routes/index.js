exports.index = function (req, res) {
  req.session.puzzle = req.session.puzzle || req.app.get('puzzle');
  res.render('index', {
    title: 'Mastermind'
  });
};

exports.play = function (req, res) {
  var newGame = function () {
    var i,
      data = [],
      puzzle = req.session.puzzle;
    
    for (i = 0; i < puzzle.size; i += 1) {
      data.push(Math.floor(Math.random() * puzzle.dim));
    }
    
    puzzle.data = data;

    var retMsg = 'Gra wygenerowana z ustawieniami: liczba kolorów: ' + puzzle.dim + 'rozmiar: ' + puzzle.size;
    if (puzzle.max) {
      retMsg += 'próby: ' + puzzle.max;
    }

    return {
      'retMsg': retMsg
    };
  };

  if (req.params[1]) {
    req.session.puzzle.size = parseInt(req.params[1], 10);
  }  
  if (req.params[3]) {
    req.session.puzzle.dim = parseInt(req.params[3], 10);
  }
  if (req.params[5]) {
    req.session.puzzle.max = parseInt(req.params[5], 10);
  }

  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(newGame()));
};

exports.mark = function (req, res) {
  var markAnswer = function () {
    var move = req.params[0].split('/');
    move = move.slice(0, move.length - 1); // usuniecie ostatniego pustego elementu
    var puzzle = req.session.puzzle,
      data = req.session.puzzle.data.slice(); // kopia
      black_points = 0,
      black_indexes = [],
      white_points = 0,
      i = 0;
    
    for(i = 0; i < move.length; i++) {
      move[i] = parseInt(move[i], 10); 
    }

    for (i = 0; i < puzzle.size; i++) {
      if (move[i] === data[i]) {
        black_points++;
        black_indexes.push(i);
      }
    }

    for (var i = 0; i < black_indexes.length; i++) {
      delete data[black_indexes[i]];
      delete move[black_indexes[i]];
    }

    for (i = 0; i < puzzle.size; i++) {
      if (data.indexOf(move[i]) > -1) {
        white_points++;
        delete data[data.indexOf(move[i])];
      }
    }
    
    console.log(puzzle.data);

    return {
      'retVal': {
        game_over: false,
        black_points: black_points,
        white_points: white_points,
        attempts_left: puzzle.max
      }
    };
  };
  
  res.writeHead(200, {'Content-Type': 'application/json'});

  if (req.session.puzzle.max || req.session.puzzle.max === 0) {
    if (req.session.puzzle.max === 0) {
      res.end(JSON.stringify({
        'retVal': {
          game_over: true
        },
        'retMsg': 'koniec gry'
      })); 
    } else {
      req.session.puzzle.max -= 1;
      res.end(JSON.stringify(markAnswer()));
    }
  } else {
    res.end(JSON.stringify(markAnswer()));
  }
};
