const { src, dest, series } = require('gulp');
const tap = require('gulp-tap');
const path = require('path');
const fs = require('fs');
const jsonToYaml = require('gulp-json-to-yaml');
const CONFIG = require('./config.json');
var resources = [];
var template = {};

function updateTemplate(fileName){
    var httpVerb = extractHttpVerb(fileName);
    var resourceName = extractResourceName(fileName, httpVerb);
    var resourceString = JSON.stringify(CONFIG.APIResourceTemplate);
    resourceString = resourceString.replace(/<ResourceFileName>/gi, fileName).replace(/<ResourceName>/gi, resourceName).replace(/<HttpVerb>/gi, httpVerb);
    resources.push(resourceString);
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
    return src('./functions/*.js')
            .pipe(tap(function(file){
                updateTemplate(path.parse(file.path).name);
            }));
}

function generateTemplate(cb){
    var temp = CONFIG.AWSMainTemplate;
    template = {...temp};
    template.Resources = [...resources];
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