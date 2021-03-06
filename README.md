# gulp-sam-template-generator
Creates an AWS API-Lambda SAM template from project source

Ensure that your functions are named as per the convention:
HTTPVERBResource

Works with the following recommended folder structure
```
+-- gulpfile.js
+-- config.json (where the config below should live)
+-- functions (FunctionsFolderPath in config.js will determine the folder name here)
|   +-- DELETEResource.js
|   +-- GETResource.js
|   +-- PATCHResource.js
|   +-- POSTResource.js
|   +-- PUTResource.js
```

It's important to note that this gulpfile relies on naming conventions. Your functions themselves must all export handler named handler:

```
exports.handler
```

# Usage
For now, simply copy the gulpfile.js and config.json into you project until I convert this into a proper NPM Gulp-Plugin Module

Suggested Config
```
{
    "APIResourceTemplate":
    {
        "AWSLambdaName": "AWS::Serverless::Function",
        "LambdaTrigger": "Api",
        "LambdaDynamoDBPolicy": "AmazonDynamoDBReadOnlyAccess"
    },
    "AWSMainTemplate": 
    {
        "AWSTemplateFormatVersion": "2010-09-09",
        "Transform": "AWS::Serverless-2016-10-31",
        "Description": "SAM template generated by Gulp",
        "Globals":
        {
            "Function":
            {
                "MemorySize": 128,
                "Runtime": "nodejs12.x",
                "Timeout": 5
            }
        },
        "Resources":{}
    },
    "FunctionsFolderPath": "./functions"
}
```
# Post template.yaml generation
Once Gulp has generated your template file then perform the following:
```
aws cloudformation package --template-file template.yaml --output-template-file sam-template.yaml --s3-bucket <your deployment bucket name>
```
This will provide you with a cloudformation script that you can use to deploy your serverless stack. Then you the following to deploy your stack

```
aws cloudformation deploy --template-file sam-template.yaml --stack-name <YOUR STACK NAME> --capabilities CAPABILITY_IAM
```
The ```capabilities``` section add the required roles to your stack as well. Should you need to remove your stack then everything associated with the stack is removed as well. This makes for a clean sweep if need be.

Happy hacking...
