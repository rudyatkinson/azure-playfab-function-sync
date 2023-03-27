const core = require('@actions/core');
const playFabServer = require("playfab-sdk/Scripts/PlayFab/PlayFabServer");
const playFabAuthentication = require("playfab-sdk/Scripts/PlayFab/PlayFabAuthentication");
const playFabCloudScript = require("playfab-sdk/Scripts/PlayFab/PlayFabCloudScript");
const fetch = require('node-fetch');
const fs = require("fs");
const shell = require('shelljs');

const developerSecretKey = core.getInput('playfab-developer-secret-key', { required: true });
const titleId = core.getInput('playfab-title-id', { required: true });
const subscriptionId = core.getInput('azure-subscription-id', { required: true });
const resourceGroup = core.getInput('azure-resource-group', { required: true });
const appName = core.getInput('azure-function-app-name', { required: true });
const unregisterUnusedFunctions = core.getInput('playfab-unregister-unused-functions', {required: false});
const azureLoginAppId = core.getInput('azure-login-app-id', {required: false});
const azureLoginSecretValue = core.getInput('azure-login-secret-value', {required: false});
const azureLoginTenantId = core.getInput('azure-login-tenant-id', {required: false});

var accessData;
var playFabEntityToken;

async function run() {
    
    SetupAzureAuthenticationAndRun();
    SetupPlayFabAuthentication();
}

function SetupAzureAuthenticationAndRun() {

    var azLoginExec = shell.exec('az login --service-principal -u ' + azureLoginAppId + ' -p ' + azureLoginSecretValue + ' --tenant ' + azureLoginTenantId);

    if(azLoginExec.code !== 1) {
        var azGetAccessTokenExec = shell.exec('az account get-access-token --output json > "accessToken.json"');
        core.notice('az get access token code: ' + azGetAccessTokenExec.code);
    }
    else {
        core.notice('az login failed.');
    }
    
    fs.readFile("./accessToken.json", "utf8", (err, jsonString) => {
        if (err) {
            core.setFailed("accessToken.json read failed: " + err)
            return;
        }

        accessData = JSON.parse(jsonString);

        GetAzureFunctionList();
    });
}

function SetupPlayFabAuthentication() {
    
    playFabServer.settings.developerSecretKey = developerSecretKey;
    playFabServer.settings.titleId = titleId;

    var getEntityTokenRequest = {};
    playFabAuthentication.GetEntityToken(getEntityTokenRequest, GetEntityTokenCallback);
}

function GetEntityTokenCallback(error, result) {
    ErrorCheck(error, 'GetEntityToken');

    playFabEntityToken = result.data["EntityToken"];
}

function ClearUnusedFunctions(functionsData) {
    
    var listHttpFunctionsRequest = { EntityToken: playFabEntityToken };
    playFabCloudScript.ListHttpFunctions(listHttpFunctionsRequest, function(error, result) {
        
        ErrorCheck(error, 'ListHttpFunction');

        var functions = result.data["Functions"];
        
        for (const func of functions) {
            
            if (functionsData.filter(f => f.properties.name === func.FunctionName).length <= 0) {
                
                UnregisterHttpFunction(func.FunctionName);
            }
        }
    });
}

function GetAzureFunctionList() {
    
    var urlPath = 'https://management.azure.com/subscriptions/' + subscriptionId + '/resourceGroups/' + resourceGroup + '/providers/Microsoft.Web/sites/' + appName + '/functions?api-version=2022-03-01';
    fetch(urlPath, {
        method: 'GET',
        headers: {
            'Authorization': "Bearer " + accessData.accessToken
        }
    })
    .then(response => response.json())
    .then(response => {
        
        var data = response.value;
        
        if(unregisterUnusedFunctions.toLowerCase() === "true"){
            
            console.log('Unused Functions cleanup activated.');
            ClearUnusedFunctions(data);
        }
        
        for (const element of data) {
          GetAzureFunctionInvokeUrl(element);
        }
    });
}

function GetAzureFunctionInvokeUrl(item) {
    
    var functionName = item.properties.name;

    var urlPath = 'https://management.azure.com/subscriptions/' + subscriptionId + '/resourceGroups/' + resourceGroup + '/providers/Microsoft.Web/sites/' + appName + '/functions/' + functionName + '/listsecrets?api-version=2015-08-01'
    fetch(urlPath, {
        method: 'POST',
        headers: {
            'Authorization': "Bearer " + accessData.accessToken
        }
    })
    .then(response => response.json())
    .then(response => {
        var url = response.trigger_url;
        console.log(functionName + ' ' + url);
        RegisterHttpFunction(functionName, url);
    });
}

function RegisterHttpFunction(functionName, url) {
    
    var registerHttpFunctionRequest = { EntityToken: playFabEntityToken, FunctionName: functionName, FunctionUrl: url };
    
    playFabCloudScript.RegisterHttpFunction(registerHttpFunctionRequest, function(error, result) {
        ErrorCheck(error, 'Register ' + functionName);
    });
}

function UnregisterHttpFunction(functionName) {
    
    var unregisterFunctionRequest = { EntityToken: playFabEntityToken, FunctionName: functionName };
    
    playFabCloudScript.UnregisterFunction(unregisterFunctionRequest, function(error, result) {
                   
        ErrorCheck(error, 'Unregister ' + functionName);
    });
}

function ErrorCheck(error, caller)
{
    if (error == null) {
        console.log(caller + ' succeeded.');
    }
    else {
        core.setFailed('Get an error during ' + caller + '\n' + error);
    }
}

run();
