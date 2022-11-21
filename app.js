// O arquivo app.js:
//     Configura o ambiente de execução do node.js através do framework
//     Express, que é o framework web mais usado com node.js na atualidade
//
//     Define a estrutura de pastas em que o site será armazenado
//
//     É o ponto de entrada da aplicação web e funciona como um middleware
//     que redireciona requisições para os demais módulos, como o index.js

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 
// Informa a rota para o arquivo index.js, que controla o acesso
// a todas as páginas
//
var indexRouter = require('./routes/index');

var app = express();

//
// Configura o mecanismo de controle e acesso às views
//
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// O comando abaixo exporta o módulo app.js, deixando-o acessível
// para os demais módulos, como o que está em bin\www

module.exports = app;