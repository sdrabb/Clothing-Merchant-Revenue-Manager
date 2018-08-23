const {ObjectId} = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";


exports.saveInvoice = function(req, res){
  MongoClient.connect(url, function(err, client) {
    if (err) throw err;

    let db = client.db('mydb');

    db.collection('invoices').save(req.body.invoice, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.json({'returncode': 0, 'data':{}, 'returnstring':'success'})
    });
  });  
}

exports.getInvoices = function(req, res){
  MongoClient.connect(url, function(err, client) {
    if (err) throw err;

    let db = client.db('mydb');
    let invoices = null;
    
    db.collection("invoices").find({}).toArray(function(err, result) {
      if (err) throw err;
      invoices = Object.assign({}, result);
      res.json({'returncode': 0, invoices, 'returnstring':'success'})
    });
  });
}

exports.removeInvoice = function(req, res){
  MongoClient.connect(url, function(err, client) {
    if (err) throw err;

    let db = client.db('mydb');
    let o_to_remove = {"_id": ObjectId(req.body.invoice._id) };

    db.collection("invoices").deleteOne(o_to_remove, function(err, obj) {
      if (err) throw err;
      console.log(o_to_remove);
      res.json({'returncode': 0,"data":{}, 'returnstring':obj.result.n + " document(s) deleted"})
    });
  });
}

exports.updateInvoice = function(req, res){
  MongoClient.connect(url, function(err, client) {
    if (err) throw err;

    let db = client.db('mydb');
    let o_to_update = {"_id": ObjectId(req.body.invoice._id) };
    let invoice = Object.assign({}, req.body.invoice);
    delete invoice._id

    db.collection("invoices").updateOne(o_to_update, {$set: invoice } ,function(err, obj) {
      if (err) throw err;
      res.json({'returncode': 0,"data":{}, 'returnstring':obj.result.n + " document(s) deleted"})
    });
  });
}

exports.saveCompany = function(req, res){
  MongoClient.connect(url, function(err, client) {
    if (err) throw err;

    let db = client.db('mydb');

    db.collection('companies').save(req.body.company, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.json({'returncode': 0, 'data':{}, 'returnstring':'success'})
    });
  });  
}

exports.saveCustomer = function(req, res){
  MongoClient.connect(url, function(err, client) {
    if (err) throw err;

    let db = client.db('mydb');

    db.collection('customers').save(req.body.customer, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.json({'returncode': 0, 'data':{}, 'returnstring':'success'})
    });
  });  
}

exports.getCustomers = function(req, res){
  MongoClient.connect(url, function(err, client) {
    if (err) throw err;

    let db = client.db('mydb');
    let invoices = null;
    
    db.collection("customers").find({}).toArray(function(err, result) {
      if (err) throw err;
      customers = Object.assign({}, result);
      res.json({'returncode': 0, customers, 'returnstring':'success'})
    });
  });
}

exports.getCompanies = function(req, res){
  MongoClient.connect(url, function(err, client) {
    if (err) throw err;

    let db = client.db('mydb');
    let invoices = null;
    
    db.collection("companies").find({}).toArray(function(err, result) {
      if (err) throw err;
      companies = Object.assign({}, result);
      res.json({'returncode': 0, companies, 'returnstring':'success'})
    });
  });
}
