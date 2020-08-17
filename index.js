var module_src_index =require("./util/readfilesindir")
var validation = require("./util/validation");
var compt = require("compts");
var fs = require('fs');
var path = require('path');
module.exports = function(data,func){
    if(compt._.has(data)){
        data.forEach(function(v){
            module_src_index(v,func)
        });
    }
   

}
