var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var invoiceManager = require('./routes/invoice');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// HTTP POST requests
app.post('/postInvoice', invoiceManager.saveInvoice);
app.post('/removeInvoice', invoiceManager.removeInvoice);
app.post('/saveCompany', invoiceManager.saveCompany);
app.post('/saveCustomer', invoiceManager.saveCustomer);
app.post('/updateInvoice', invoiceManager.updateInvoice);

// HTTP GET requests
app.get('/getInvoices', invoiceManager.getInvoices);
app.get('/views/NewCompanyModal.ejs', function(req,res){res.render('NewCompanyModal')});
app.get('/views/NewCustomerModal.ejs', function(req,res){res.render('NewCustomerModal')});
app.get('/views/InvoicesTableModal.ejs', function(req,res){res.render('InvoicesTableModal')});
app.get('/views/ModifyInvoiceModal.ejs', function(req,res){res.render('ModifyInvoiceModal')});
app.get('/getCompanies', invoiceManager.getCompanies);
app.get('/getCustomers', invoiceManager.getCustomers);


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

 
module.exports = app;
