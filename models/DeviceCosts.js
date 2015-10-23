/**
 * Created by usuario on 10/21/15.
 */
var mongoose= require('mongoose');
var Schema = mongoose.Schema;

var setPriceSchema = new Schema({
    PMCost: Number,
    CRTPCost: Number,
    ICDCost: Number,
    CRTDCost: Number
});

var setDevicePrice = mongoose.model('setDevicePrice', setPriceSchema);

module.exports = setDevicePrice;