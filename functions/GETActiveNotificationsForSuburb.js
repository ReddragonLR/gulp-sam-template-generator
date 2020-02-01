// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'eu-west-1'});

exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            result: GetActiveNotificationsForSuburbFromDB()
        })
    }
}

function GetActiveNotificationsForSuburbFromDB(){
    // Create DynamoDB document client
    var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
    
    var params = {
        TableName: 'CityAlerts',
        KeyConditionExpression: "LocationId = :val",
        ExpressionAttributeValues: {":val": "7a055eba-0bcf-4a09-be43-55fe1fcd4c35"},
    };
    var result = [];
    docClient.query(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            result = data;
        }
    });
    return result;
}