
  // NPM dependencies
var express = require('express');
var sharejs = require('./ShareJS').server;
var faye = require('faye');
var https = require('https');

// Local Modules
var DashboardManager = require('./js/server/dashboardsManager');
var DataSetsManager = require('./js/server/dataSetsManager');
var GadgetsManager = require('./public/gadgets/gadgetsInfo');
var xhr = require("./js/shared/xhr");

var app = express.createServer();
var dashboardsManager;
var dataSetsManager;
var gadgetsManager;

// Share JS options
var options = {
  rest: { path : '/dashboard/:name/state'},
  db: { type: 'none'},
  auth: function(client, action) {
    // This auth handler rejects any ops bound for docs starting with 'readonly'.
    if (action.name === 'submit op' && action.docName.match(/^readonly/)) {
      action.reject();
    } else {
      action.accept();
    }
  }
};

// Lets try and enable redis persistance if redis is installed...
try {
  require('redis');
  options.db = {type: 'redis'};
} catch (e) {}


// Attach the sharejs REST and Socket.io interfaces to the server
sharejs.attach(app, options);

// Faye adapter for pub/sub of dashboards
var adapter = new faye.NodeAdapter({ mount: '/faye', timeout: 45 });
adapter.attach(app);

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/templates');
  app.set('view engine', 'mustache');
  app.register(".mustache", require('stache'));
  app.set('view options', {layout: false });
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/js/client'));
  app.use(express.static(__dirname + '/js/shared'));
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

dashboardsManager = new DashboardManager(app, app.model);

app.get('/xhrProxy/:request', function(req, res){
  var options = {
    url: req.params.request,
    type: "GET",
    success: function(response) { res.send(response); }
  }
  xhr.ajax(options);
});

app.get('/gadgets/', function(req, res){
  res.send(GadgetsManager.all);
});


app.get('/dataSet/:id', function(req, res){
  var dataSetFound = function (dataSet) {
    res.send(JSON.stringify(dataSet));
  };
  DataSetsManager.find(req.params.id, dataSetFound);
});

app.post('/dataSet/', function(req, res){
  var queryInfo = req.body || undefined;
  var dataSetCreated = function(datasetId){
    res.send(JSON.stringify(datasetId));
  }
  DataSetsManager.createDataSet(queryInfo, dataSetCreated);
});

var request = require('request');
//This is where our server defines what to do when a post request is sent to it
//with the url myria/mquery. This is where we actually query myria. Something to note
//is that we are queries demo.myria because we use the parsing functionality to issue a
//myriaL query instead of directly sending the json. The get requests defined below
//use json directly and don't send requests to the demo. The req variable stores
//the data we sent to the server (the table name and output names and so on)
app.post('/myria/mquerygrp', function(req, postResponse) {
  postResponse.header("Transfer-Encoding", "chunked");
  postResponse.header("Content-Type", "application/json");
  var queryString = 'results = select * from SCAN(' + req.param('dataTable') +') as f where f.NowGroup=' +
      req.param('group') +
      '; STORE(results, ' + req.param('resultTable') + ');';
      request({
      "url":'https://demo.myria.cs.washington.edu/execute',
      "method": "POST",
      "rejectUnauthorized": false,
      "form": {
          query: queryString,
          language: "MyriaL"
        }
    },
    //The results the myria sends to server.js are now collected and sent
    //to the callback function in our sendMergerTree() function
    function (error, response, body) {
        if (!error && response.statusCode == 201) {
            postResponse.write(body);
            postResponse.end();
        } else {
            console.log('Error mquerygrp: ' + error);
            console.log('Status code' + response.statusCode);
            postResponse.write({error: response.statusCode});
        }
    }
  );
});

// Sending a query to myria that request present day group ids within a given mass range
app.post('/myria/mquerymass', function(req, postResponse) {
  postResponse.header("Transfer-Encoding", "chunked");
  postResponse.header("Content-Type", "application/json");
  var queryString = 'T1 = scan(astro:cosmo50:snapshot512Hash);'
                  + 'T2 = [from T1 emit grp as NowGroup, 18479300000000000.0*sum(mass) as massSum];'
                  + 'T3 = [from T2 where massSum <= ' + req.param('maxRange') + ' and massSum >= ' + req.param('minRange') + ' emit NowGroup];'
                  + 'store(T3, ' + (req.param('user') || 'public') + ':adhoc:MassRangeGroups);';
      request({
      "url":'https://demo.myria.cs.washington.edu/execute',
      "method": "POST",
      "rejectUnauthorized": false,
      "form": {
          query: queryString,
          language: "MyriaL"
        }
    },

    function (error, response, body) {
      console.log("ERROR", error);
      console.log("BODY", body);
        if (!error && response.statusCode == 201) {
            postResponse.write(body);
            postResponse.end();
        } else {
            console.log('Error mquerymass: ' + error);
            console.log('Status code' + response.statusCode);
            postResponse.write({error: response.statusCode});
        }
    }
  );
});

// Computes the selected edges tables for the merger trees
app.post('/myria/mcompute', function(req, postResponse) {
  var queryJSON = req.param('query');
  var queryString =  JSON.stringify(queryJSON);

  postResponse.header("Transfer-Encoding", "chunked");
  postResponse.header("Content-Type", "application/json");
  
    request({
      "url":'https://rest.myria.cs.washington.edu:1776/query',
      "method": "POST",
      "json": queryJSON
    },

    function (error, response, body) {
        console.log("ERROR", error);
        console.log("BODY", body);
        if (!error && response.statusCode == 202) {
            postResponse.write(JSON.stringify(body));
            postResponse.end();
        } else {
            console.log('Error mquerymass: ' + error);
            console.log('Status code' + response.statusCode);
            postResponse.write({error: response.statusCode});
        }
    }
  );
});

// here I think we are just checking that the query complete
app.get('/myria/mquery', function(req, postResponse){
  console.log("/query/query-" + req.get('query', ''));
  var request = https.request({
    hostname: "rest.myria.cs.washington.edu",
    port: 1776,
    path: "/query/query-" + req.param('query'),
    method: "get",
    headers: {
      "Accept": "*/*"
    }
  }, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    for (key in res.headers) {
      postResponse.header(key, res.headers[key]);
    }
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      postResponse.write(chunk);
    });
    res.on('end', function() {
      postResponse.end();
    })
  });
  request.end();
});

//Here we are requesting the resultant data tables and not issue a query.
//We are basically requesting a download
app.get('/myria/mdata', function(req, postResponse){
  var request = https.request({
    hostname: "rest.myria.cs.washington.edu",
    port: 1776,
    path: "/dataset/user-" + (req.param('user') || 'public') + "/program-" + (req.param('program') || 'adhoc') + "/relation-" + req.param('table') + '/data?format=json',
    // path: "/dataset/user-" + (req.param('resultTable') || 'public') + "/program-adhoc/relation-MassRangeGroups/data?format=json",
    method: "get",
    headers: {
      "Accept": "*/*"
    }
  }, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    for (key in res.headers) {
      postResponse.header(key, res.headers[key]);
    }
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      postResponse.write(chunk);
    });
    res.on('end', function() {
      postResponse.end();
    })
  });
  request.end();
});

if (!module.parent) {
  app.listen(8080);
  console.log("ASCOT server listening on port %d", app.address().port);
}
