var express = require('express');
var router = express.Router();
var path = require('path');
var DeviceCosts = require('../models/DeviceCosts');
var formRouter = require('./formRouter');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

//router.get('/formRouter', function(req, res, next){
//  res.send(formRouter);
//});



module.exports = router;
