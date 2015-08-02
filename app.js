'use strict';

//load environment variables
require('dotenv').load();

console.log('Initializing app...');
// Top level globals
global.Promise = global.PROMISE = require('bluebird'); 
global.D = require('dottie');
global.moment = global.MOMENT = require('moment');
global.S = require('string');
global._ = require('underscore');
//global.DOMAIN = process.env.DOMAIN;
global.UUID = require('./apps/utils/uuidGen.js');

//load models the last because it has dependencies on the previous globals.
global.DB = require('./models/index.js');
global.DEBUG = require('debug');


var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');


/* routes */
var routes = require('./routes/index');

var app = express();



// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.engine('mustache', cons.hogan);
// app.set('view engine', 'mustache');

//app.use(favicon(__dirname + '/public/assets/favicon/favicon-160x160.png'));
app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

/// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    console.log('WARN: Running in development mode.');
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


// app.listen(2999, function() {
//     console.log('Congrats, nothing broke!! Listening on port %d', server.address().port);
// });

console.log('Initialization complete.');
console.log('Start the awesome stats engine...');


var engine = require('./apps/engine');
// set interval as required, else, defaults to 2 hours.
// engine.intervals = 2000;
engine.start();

module.exports = app;