//express basic module-jade templete
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//router 적용위치
var routes = require('./routes/index');
var users = require('./routes/users');
var health = require('./routes/health')(app);   // health
var trips = require('./routes/trips')(app);    //trips

var app = express();
//jade파일로부터 소스보기시 줄바꿈을 실행해서 가독성을 높여준다
app.locals.pretty = true;
// view engine -jade-setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//static service setting
app.use(express.static(path.join(__dirname, 'public')));
// router setting
app.use('/', routes);
app.use('/users', users);
app.use('/health', health);   // /health로 시작하는 url을 health로 라우트한다
app.use('/trips', trips);   // '/trips/'인 url router

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
