/**
 * Created by usuario on 10/21/15.
 */
var express = require('express');
var router = express.Router();
var path = require('path');
var DeviceCosts = require('../models/DeviceCosts');


//This is only used once to set the default cost values for Device costs. only use if needing to update costs.
router.post('/postDefaultValues', function(req, res, next){
   var savedValues = new DeviceCosts(req.body);
   console.log(savedValues);
   savedValues.save(function(err){
      if(err) throw err;
      console.log('Erro ', err);
      res.send(savedValues)
   })
});
/****************************************************************/

var totalQuantities;
router.post('/postDeviceQuantities', function(req, res, next){
    var deviceQuantities = req.body;
    var PMQuantity = parseInt(deviceQuantities.PMQuantity);
    var CRTPQuantity = parseInt(deviceQuantities.CRTPQuantity);
    var ICDQuantity = parseInt(deviceQuantities.ICDQuantity);
    var CRTDQuantity = parseInt(deviceQuantities.CRTDQuantity);

   totalQuantities = PMQuantity + CRTDQuantity + ICDQuantity + CRTPQuantity;
   console.log(PMQuantity);
   console.log(CRTPQuantity);
   console.log(ICDQuantity);
   console.log(CRTDQuantity);
   console.log("total quantities " + totalQuantities);
   res.send('Ok');
});



/*This is returning the default Device Cost prices back to javascript */
router.get('/getCostValues', function(req, res, next){
   DeviceCosts.find(function(err, prices){
      res.json(prices)
   })
});
/*****************************************************************/


router.get('/getDeviceQuantities', function(req,res, next){
   res.json(totalQuantities);
   console.log('these are total Quantities ' + totalQuantities)
});


//This is where the Device Costs are coming in and being save to totalAvgDeviceCost to be updated once form is submitted
var totalAvgDeviceCost;
router.post('/postTotalsInServer', function(req, res, next){
   var deviceCosts = req.body;
   console.log("this is what's coming back " );
   var deviceCostPM = parseInt(deviceCosts.PMCost);
   var deviceCostCRTP = parseInt(deviceCosts.CRTPCost);
   var deviceCostICD = parseInt(deviceCosts.ICDCost);
   var deviceCostCRTD = parseInt(deviceCosts.CRTDCost);
   var addedDevices = deviceCostICD + deviceCostPM + deviceCostCRTD + deviceCostCRTP;
   console.log("these are the added devices " + addedDevices);
   totalAvgDeviceCost = addedDevices/4;
   res.send('ok');
});
/*************************************************************************/



//This is to get the totalAvgDeviceCost that is set in the POST back to the javascript
router.get('/getresult', function(req, res, next){
   console.log("the GETresult worked");
   res.json(totalAvgDeviceCost);
});
/*******************************************************/



module.exports = router;