var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3001);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('puzzle', {
    data: [], // układ liczb-kolorów do zganięcia
    size: 5,  // liczba wykorzystywanych „kolumn”
    dim: 9,   // liczba dostępnych kolorów
    max: null // maksymalna liczba prób (null – brak ograniczeń)
  });
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('bardzo tajne aqq'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get(/^\/play\/(size\/(\d+)\/)?(dim\/(\d+)\/)?(max\/(\d+)\/)?$/, routes.play);
app.get(/^\/mark\/((?:\d+\/)+)$/, routes.mark);
http.createServer(app).listen(app.get('port'), function () {
  console.log("Serwer nasłuchuje na porcie " + app.get('port'));
});
