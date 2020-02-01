// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'eu-west-1'});

exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            result: GetSupportedCountriesFromDB()
        })
    }
}

function GetSupportedCountriesFromDB(){
    // Create DynamoDB document client
    var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
    
    var params = {
        TableName: 'CityAlertsSupportedLocations',
        Select: 'SPECIFIC_ATTRIBUTES',
        AttributesToGet: ['Country']
    };
    var result = [];
    docClient.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            const distinctCountries = [...new Set(data.Items.map(x => x.Country))];
            result = distinctCountries;
        }
    });
    return result;
}