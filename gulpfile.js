const { src, dest, series } = require('gulp');
const tap = require('gulp-tap');
const path = require('path');
const fs = require('fs');
const jsonToYaml = require('gulp-json-to-yaml');
const CONFIG = require('./config.json');
var template = {};
var resources = {};

// Consts
const PLUGIN_NAME = 'gulp-sam-template-generator';

function updateTemplate(fileName){
    var lambda = {};
    var lambdaProps = {};
    var lambdaEvents = {};
    var lambdaEvent = {};
    var lambdaEventProps = {};

    var httpVerb = extractHttpVerb(fileName);
    var resourceName = extractResourceName(fileName, httpVerb);
    lambdaEventProps["Path"] = `/${resourceName}`;
    lambdaEventProps["Method"] = httpVerb;
    lambdaEvent["Type"] = CONFIG.APIResourceTemplate.LambdaTrigger;
    lambdaEvent["Properties"] = {...lambdaEventProps};
    lambdaEvents[fileName] = {...lambdaEvent};
    lambdaProps["Handler"] = `./functions/${fileName}.handler`;
    lambdaProps["Policies"] = CONFIG.APIResourceTemplate.LambdaDynamoDBPolicy;
    lambdaProps["Events"] = {...lambdaEvents};
    lambda["Type"] = CONFIG.APIResourceTemplate.AWSLambdaName;
    lambda["Properties"] = {...lambdaProps};
    resources[fileName] = {...lambda};
}

function extractHttpVerb(fileName){
  if (fileName.startsWith('GET'))
    return 'GET';
  if (fileName.startsWith('POST'))
    return 'POST';
  if (fileName.startsWith('DELETE'))
    return 'DELETE';
  if (fileName.startsWith('PUT'))
    return 'PUT';
  if (fileName.startsWith('PATCH'))
    return 'PATCH';
  return 'NONE';
}

function extractResourceName(fileName, partOfNameToRemove){
  var resourceName =  fileName.replace(partOfNameToRemove, '');
return camelCase(resourceName);
}

function camelCase(str) { 
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) 
    { 
        return index == 0 ? word.toLowerCase() : word.toUpperCase(); 
    }).replace(/\s+/g, ''); 
}

function updateResources(){
    return src(`./${CONFIG.FunctionsFolderPath}/*.js`)
            .pipe(tap(function(file){
                updateTemplate(path.parse(file.path).name);
            }));
}

function generateTemplate(cb){
    template = {...CONFIG.AWSMainTemplate};
    template.Resources = {...resources};
    cb();
}

function deleteExistingTemplateJsonFile(cb){
    if (fs.existsSync('./template.json')) {
        fs.unlinkSync('./template.json');
    }
    cb();
}

function createTemplateJsonFile(cb){
    try {
        fs.appendFileSync('./template.json', JSON.stringify(template));
    } catch (err) {
        /* Handle the error */
    }
    cb();
}

function deleteExistingYamlFile(cb){
    if (fs.existsSync('./template.yaml')) {
        fs.unlinkSync('./template.yaml');
    }
    cb();
}

function recreateYamlTemplate(cb){
    return src('./template.json')
        .pipe(jsonToYaml())
        .pipe(dest('./'))
}

exports.default = series(updateResources, generateTemplate, deleteExistingTemplateJsonFile, createTemplateJsonFile, deleteExistingYamlFile, recreateYamlTemplate);