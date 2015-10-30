/**
 * Created by usuario on 10/21/15.
 */
var app = angular.module('myApp', [/*'ngAnimate'*/]);


app.controller('FormController', ['$scope', '$http', function($scope, $http){
    $scope.hideAndShowBox = false;
    $scope.showFirstTotals = false;
    $scope.showTotalPotentials = false;
    $scope.showAvgRelatedInfection = false;
    $scope.inputBoxHide = true;
    $scope.hidePercentageValues=true;
    $scope.showtotalImplantsAndCost = false;
    var noTyrxCost;
    $scope.placeNewPotentialHighRisk = 40;
    $scope.placeNewAvgInfectionRate = 3.6;


    //The submitData is what happens when the submit Button is pressed
    $scope.submitData = function() {
        console.log('heyhey');
            $scope.hideAndShowBox = true;
            $scope.showFirstTotals = true;
            $scope.showTotalPotentials = true;
            $scope.showAvgRelatedInfection = true;
            $scope.inputBoxHide = false;
            $scope.showtotalImplantsAndCost = true;
        $scope.editInputs = function(){
            $scope.hideAndShowBox = false;
            $scope.inputBoxHide = true;
        };

        var inputPMQuantity = $scope.PMNumImplantsInput;
        $scope.PMNumImplants = pmQuantity(inputPMQuantity);

        var inputCRTPQuantity = $scope.CRTPNumImplantsInput;
        $scope.CRTPNumImplants = CRTPQuantity(inputCRTPQuantity);

        var inputICDQuantity = $scope.ICDNumImplantsInput;
        $scope.ICDNumImplants = ICDQuantity(inputICDQuantity);

        var inputCRTDQuantity = $scope.CRTDNumImplantsInput;
        $scope.CRTDNumImplants = CRTDQuantity(inputCRTDQuantity);




        /* Getting the Device cost row to equal whatever is input or default to the default price from the database.
         *  To change the default values, you must uncomment it in this file and send a new POST to update the values
         and delete the old ones. They are stored in a mongo database.          */
        var inputPMCostReceived = $scope.PMCostInput;
        $scope.PMCost = theCostPM(inputPMCostReceived);

        var inputCRTPCost = $scope.CRTPCostInput;
        $scope.CRTPCost =theCostCRTP(inputCRTPCost);

        var inputICDCost = $scope.ICDCostInput;
        $scope.ICDCost = theCostICD(inputICDCost);

        var inputCRTDCost = $scope.CRTDCostInput;
        $scope.CRTDCost = theCostCRTD(inputCRTDCost);

        // Cost object to send the value costs which are either input into box or default value
        var CostObj = {
            PMCost : $scope.PMCost,
            CRTPCost : $scope.CRTPCost,
            ICDCost : $scope.ICDCost,
            CRTDCost :$scope.CRTDCost
        };

        postTotalPrices(CostObj);


        /* Device Quantities object to send the number to the server to do the math
         The $scope.PMNumImplants has been run through the PMQuantity function to see what value
         should be passed in.        */
        var deviceQuantities = {
            PMQuantity: $scope.PMNumImplants,
            CRTPQuantity: $scope.CRTPNumImplants,
            ICDQuantity: $scope.ICDNumImplants,
            CRTDQuantity: $scope.CRTDNumImplants
        };


        /*********** GET the total cost Avg. by making the get call and math in the serve */
        var x = getResult();
        x.then(function(data){
            costData = data.data;
            $scope.totalDevicesCost = costData;
            console.log($scope.totalDevicesCost)
        },function(err){
            console.log(err);
        });
        /*********************************************/



        getDeviceQuantities();  //Receiving the device quantities back


        postDeviceQuantities(deviceQuantities);  //Calling the Post Quantities and passing in the Obj for quantities


        /***************** Function to GET call the Total device quantities ******/
                            //function getDeviceQuantities(){
                            //    return $http({
                            //        method:'GET',
                            //        url: "/formRouter/getDeviceQuantities"
                            //    }).then(function(data) {
                            //        $scope.totalNumImplants = data.data;
                            //        console.log("total num implants " + $scope.totalNumImplants);
                            //        $scope.TotalPotentialHighRisk = Math.round($scope.totalNumImplants * potentialHighRiskToPercentage);
                            //        highRisk ={TotalHighRiskPercentage: $scope.TotalPotentialHighRisk}
                            //    },function(err){
                            //        console.log(err);
                            //        })
                            //}

        function getDeviceQuantities(){
            return $http({
                method:'GET',
                url: "/formRouter/getDeviceQuantities"
            });
        }



        function setTotalPotentialRisk(){
            getDeviceQuantities().then(function(data) {
                settingTotalCosts (data);
                //returnPotentialCostDist(data);
                returnPotentialCostDist();

            },function(err){
                console.log(err);
            })
        }
        /**************************************************************************/


        setTotalPotentialRisk();

        function settingTotalCosts (data){
            $scope.totalNumImplants = data.data;

            $scope.TotalPotentialHighRisk = Math.round($scope.totalNumImplants * potentialHighRiskToPercentage);

            noTyrxCost = Math.round($scope.TotalAverageInfectionRate * costOfInfectionEuros);
            $scope.TotalCostInfectionWithoutTyrx = numberWithCommas(noTyrxCost);

            var infectionwithTyrexCost = Math.round(CIEDInfectionRisk * $scope.TotalPotentialHighRisk * costOfInfectionEuros);
            $scope.costInfectionWithTyrx = numberWithCommas(infectionwithTyrexCost);



            var TYRXCostInHighRiskPatients = TYRXPrice * $scope.TotalPotentialHighRisk;
            $scope.costOfTYRXInHighRiskPatients = numberWithCommas(TYRXCostInHighRiskPatients);



            var totalCostTyrxAndInfection = infectionwithTyrexCost + TYRXCostInHighRiskPatients;
            $scope.totalCostInfectionAndTyrex = numberWithCommas(totalCostTyrxAndInfection);



            var economicDifference = totalCostTyrxAndInfection - noTyrxCost;
            $scope.economicImpact = numberWithCommas(economicDifference);

            returnPotentialCostDist(data);
        }





        //Math and appending for Total potential # of High Risk Patients
        var potentialHighRiskToPercentage;
        function resultTotalPotentialHighRiskPatients (){
            potentialHighRiskToPercentage = $scope.placeNewPotentialHighRisk/100;
            $scope.PMPotentialHighRisk  = Math.round((deviceQuantities.PMQuantity) * potentialHighRiskToPercentage);
            $scope.CRTPPotentialHighRisk = Math.round((deviceQuantities.CRTPQuantity) * potentialHighRiskToPercentage);
            $scope.ICDPotentialHighRisk =  Math.round((deviceQuantities.ICDQuantity) * potentialHighRiskToPercentage);
            $scope.CRTDPotentialHighRisk = Math.round((deviceQuantities.CRTDQuantity) * potentialHighRiskToPercentage);
        }
        /****************************************************/


        function actualRiskMaker(){
            var averageInfectionRate = $scope.placeNewAvgInfectionRate/100;
            $scope.PMDeviceInfection = $scope.PMPotentialHighRisk * averageInfectionRate;
            $scope.CRTPDeviceInfection = $scope.CRTPPotentialHighRisk * averageInfectionRate;
            $scope.ICDDeviceInfection =  $scope.ICDPotentialHighRisk * averageInfectionRate;
            $scope.CRTDDeviceInfection = $scope.CRTDPotentialHighRisk * averageInfectionRate;
            $scope.TotalAverageInfectionRate =  Math.ceil($scope.PMDeviceInfection + $scope.CRTPDeviceInfection + $scope.ICDDeviceInfection + $scope.CRTDDeviceInfection);
            $scope.PatientMortality =  Math.ceil($scope.TotalAverageInfectionRate / 2);
        }



        resultTotalPotentialHighRiskPatients();
        actualRiskMaker();



        //var costOfInfectionDollars =  47817.57;
        var costOfInfectionEuros =  42076.27;
        //var costOfInfectionPounds = 30,958.40;

        var CIEDInfectionRisk = .0044;
        //var TYRXPrice = 1000;




// TYRX Price function that either gives it a default price or whatever is typed into the input box
        var TYRXPrice;
        function TyrxCost (tyrxPrice){

            if (tyrxPrice ==='undefined' || tyrxPrice == null){
                TYRXPrice = 1000;
            } else{
                TYRXPrice = $scope.tyrxPrice;
            }

            return TYRXPrice;
        }

        var typedInValueForTyrxPrice = $scope.tyrxPrice;
        var ttt = TyrxCost(typedInValueForTyrxPrice);
        TyrxCost(typedInValueForTyrxPrice);
/*********************************************************************/




console.log('why??????')

    }; //End submit Data function





    function postDeviceQuantities (deviceQuantities){
        $http({
            method: 'POST',
            url: '/formRouter/postDeviceQuantities',
            data: deviceQuantities
        });
    }

    function postTotalPrices (dataSend){
        $http({
            method: 'POST',
            url: '/formRouter/postTotalsInServer',
            data: dataSend
        })
    }

    function getResult(){
        return $http({
            method:'GET',
            url: "/formRouter/getresult"
        });
    }

    function numberWithCommas(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }



/*  ******** This is for the Cost Accordia, Infection Cost Distribution ***************/
    var patientBedCost = 17761.40;
    $scope.patientBedCost = numberWithCommas(patientBedCost);

    var deviceExtractionCost = 3450.32;
    $scope.deviceExtractionCost = numberWithCommas(deviceExtractionCost);

    var deviceReplacementCost = 60187.24;
    $scope.deviceReplacementCost = numberWithCommas(deviceReplacementCost);

    var antibioticsCost =  829.29;
    $scope.antibioticsCost = numberWithCommas(antibioticsCost);

    var totalSumOfExampleCosts = (patientBedCost + deviceExtractionCost + deviceReplacementCost + antibioticsCost).toFixed(2);
    $scope.totalCostsExample = numberWithCommas(totalSumOfExampleCosts);

    $scope.weightedBedOccupancy = Math.round((patientBedCost/totalSumOfExampleCosts) * 100);
    //console.log( $scope.weightedBedOccupancy);


    var weightedAvgBed = patientBedCost / totalSumOfExampleCosts;

    var weightedAvgDeviceExtraction = deviceExtractionCost / totalSumOfExampleCosts;

    var weightedAvgDeviceReplacementCost = deviceReplacementCost/totalSumOfExampleCosts;

    var weightedAvgAntibiotics = antibioticsCost / totalSumOfExampleCosts;


    function returnPotentialCostDist(){
        var potentialCostDistBed = Math.round(noTyrxCost * weightedAvgBed);
        $scope.PotentialDistBed = numberWithCommas(potentialCostDistBed);

        var potentialCostDistDeviceExtraction = Math.round(noTyrxCost * weightedAvgDeviceExtraction);
        $scope.potentialDistDeviceExtraction = numberWithCommas(potentialCostDistDeviceExtraction);

        var potentialCostDistDeviceReplacement = Math.round(noTyrxCost * weightedAvgDeviceReplacementCost);
        $scope.potentialDistDeviceReplacement= numberWithCommas(potentialCostDistDeviceReplacement);

        var potentialCostDistAntibiotics = Math.round(noTyrxCost * weightedAvgAntibiotics);
        $scope.potentialCostDistAntibiotics = numberWithCommas(potentialCostDistAntibiotics);

        var totalPotentialCostDist = Math.round(noTyrxCost * 1);
        $scope.totalPotentialCostDist = numberWithCommas(totalPotentialCostDist);
    }



    $scope.showInfectionInput= false;
    //********************************************************************************
    //$scope.valueOfPotentialHighRisk = 30; //Setting initial value of Potential High Risk Patients to 30%. it can be change by clicking on it.
    //$scope.placeNewPotentialHighRisk = $scope.valueOfPotentialHighRisk;
    $scope.changePotentialHighRisk = function(){
        $scope.showHighRiskInputButton= true;
    };
    $scope.submitNewPotentialRisk = function() {
        function determinePercentPotentialHighRisk (potentialInput){
            if (potentialInput=='undefined' || potentialInput == null){
                $scope.placeNewPotentialHighRisk = 40;
            } else{
                $scope.placeNewPotentialHighRisk = potentialInput;
            }
            return potentialInput;
        }
        var potentialInput1 = $scope.updatePotentialHighRisk;
        determinePercentPotentialHighRisk(potentialInput1);
        $scope.showHighRiskInputButton= false;

    };


    //$scope.placeNewAvgInfectionRate = 3.6;
    //console.log("first it equal this: " + $scope.placeNewAvgInfectionRate);
    $scope.changeAvgInfectionRate = function(){
        $scope.showInfectionInputButton = true;
    };
    $scope.submitNewAvgInfectionRate = function() {
        function determinePercentInfection (infectionInput){
            if (infectionInput == 'undefined' || infectionInput == null ) {
                $scope.placeNewAvgInfectionRate = 3.6;
            } else {
                $scope.placeNewAvgInfectionRate = infectionInput;
            }
            return infectionInput;
        }

        var infectionInput1 = $scope.updateAvgInfectionRate;
        determinePercentInfection(infectionInput1);


        $scope.showInfectionInputButton = false;

    };




//*********************************     ***************************************






    //This is to change the actual Average Infection Rate according to studies
    //$scope.hideInfectionRate = false;
    //$scope.showInfectionInput = false;
    //$scope.placeNewAvgInfectionRate = 3.6;  //Set initial actual Average Infection rate
    //$scope.changeAvgInfectionRate = function() {
    //    $scope.hideInfectionRate = !$scope.hideInfectionRate;
    //    $scope.showInfectionInput = !$scope.showInfectionInput;
    //};

    //$scope.submitNewAvgInfectionRate = function(){
    //    $scope.placeNewAvgInfectionRate = $scope.updateAvgInfectionRate;
    //    $scope.updateAvgInfectionRate = "";
    //    $scope.hideInfectionRate = !$scope.hideInfectionRate;
    //    $scope.showInfectionInput = !$scope.showInfectionInput;
    //};
// *********************************           *******************************************




    /* Get Set Values for Devices Costs and set them to variable to be placed
    in if Statements if there is no value put into the text box
     */
    var returnedSetCostPM;
    var returnedSetCostCRTP;
    var returnedSetCostICD;
    var returnedSetCostCRTD;

    function getSetValues (){
        $http({
            method: 'GET',
            url: '/formRouter/getCostValues'
        }).then(function(res){
            var gettingSetValues = res.data[0];
            returnedSetCostPM = gettingSetValues.PMCost;
            returnedSetCostCRTP = gettingSetValues.CRTPCost;
            returnedSetCostICD = gettingSetValues.ICDCost;
            returnedSetCostCRTD = gettingSetValues.CRTDCost;
        })
    }
    getSetValues();
    /*  **************************** END getValues******************************************** */




    /**** These functions are to take input from boxes and if input is null , it'll turn it into a 0 */
    function pmQuantity(inputPMQuantity){
        if(inputPMQuantity == null || inputPMQuantity ===''){
            $scope.PMNumImplants = 0;
        } else ( $scope.PMNumImplants = $scope.PMNumImplantsInput );
        return $scope.PMNumImplants;
    }

    function CRTPQuantity(inputCRTPQuantity){
        if(inputCRTPQuantity == null || inputCRTPQuantity ===''){
            $scope.CRTPNumImplants = 0;
        } else ($scope.CRTPNumImplants = $scope.CRTPNumImplantsInput);
        return $scope.CRTPNumImplants;
    }

    function ICDQuantity(inputICDQuantity){
        if(inputICDQuantity == null || inputICDQuantity === ''){
            $scope.ICDNumImplants = 0;
        } else ($scope.ICDNumImplants = $scope.ICDNumImplantsInput);
        return $scope.ICDNumImplants;
    }

    function CRTDQuantity(inputCRTDQuantity){
        if(inputCRTDQuantity == null || inputCRTDQuantity === ''){
            $scope.CRTDNumImplants = 0;
        } else ($scope.CRTDNumImplants = $scope.CRTDNumImplantsInput);
        return $scope.CRTDNumImplants;
    }
    /********************************************************/




    //Functions to decide what value should appear in the Devices Cost row
    function theCostPM(input) {
        if (input == null || input === '') {
            $scope.PMCost = returnedSetCostPM;
        }
        else ($scope.PMCost = $scope.PMCostInput);
        console.log($scope.PMCostInput);
        return $scope.PMCost;
    }

    function theCostCRTP(input) {
        if (input == null || input === '') {
           $scope.CRTPCost= returnedSetCostCRTP;
        }
        else ($scope.CRTPCost = $scope.CRTPCostInput);
        return $scope.CRTPCost;
    }

    function theCostICD(input) {
        if (input == null || input === '') {
            $scope.ICDCost= returnedSetCostICD;
        }
        else ($scope.ICDCost = $scope.ICDCostInput);
        return $scope.ICDCost;
    }

    function theCostCRTD(input) {
        if (input == null || input === '') {
            $scope.CRTDCost= returnedSetCostCRTD;
        }
        else ($scope.CRTDCost = $scope.CRTDCostInput);
        return $scope.CRTDCost;
    }
    /*  ************************************ END Cost deciding functions *************************/


    /*This is commented out because I only needed it to post the values once, to have it in database
     and I tried to transfer it into the Server but couldn't get it to work so I posted the values once
     and just commented it out. I kept it here in case the default prices ever change
     */
    //Setting the default value prices in the database
    //function postPricesOnce (){
    //     var deviceCostObj = {PMCost: 2150, CRTPCost:4500, ICDCost:8000, CRTDCost:12400};
    //     $http({
    //         method: 'POST',
    //         url: "/formRouter/postDefaultValues",
    //         data:deviceCostObj
    //     });
    //}
    //postPricesOnce();
    /*  ************************** END POST ********************************/




    /******************************************************************************************************************
    ******************************************************************************************************************
     **************************** START PAGE TWO *********************************************************************
     */


//button only functions once
//update the price without it having to be submitted





}]);


















