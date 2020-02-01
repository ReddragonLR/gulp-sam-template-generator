# gulp-sam-template-generator
Creates an AWS API-Lambda SAM template from project source

Ensure that your functions are named as per the convention:
<HTTPVERB>Resource

Works with the following recommended folder structure

+-- gulpfile.js

+-- functions

|   +-- DELETEResource.js

|   +-- GETResource.js

|   +-- PATCHResource.js

|   +-- POSTResource.js

|   +-- PUTResource.js
