const fs = require("fs");

const path = require("path");
const structkit = require("structkit");
const grasseumCore = require("grasseum_console");

const {unixpath} = require('pathassist');

const ValidRegexpFolderLookup = /(\*|!)/g;
/**
 * Glob reading
 *
 * @param {number|Object|string} pathVar The first number in an addition.
 * @param {number|Object|string} func The second number in an addition.
 * @returns {null} Returns the total.
 * @example
 *
 * new SrcDir(pathVar,func)
 *
 */
function SrcDir (pathVar, func) {


    if (process.platform === "win32") {

        this.reg_split = "\\";
        pathVar = pathVar.replace(this.reg_split, "/");

    } else {

        this.reg_split = "/";

    }
    this.loc_path =unixpath.cleanDirPath(pathVar);
    this.loc_path_split =unixpath.cleanDirPath(pathVar).split("/");

    this.func = func;

    this.scanDirListValue =[];
    this.srcDirInit();

}
SrcDir.prototype.scanDirList =  function (inc,complete_func) {

    const that = this;
    if(this.loc_path_split.length > inc){
        const folderIndexName =   this.loc_path_split[inc];  

        if ((ValidRegexpFolderLookup).test(folderIndexName)) {

            const folderIndexNameList = structkit.toArray( structkit.getValue (structkit.limit(this.loc_path_split ,0,inc -1 ) )  );
          
            fs.readdir(folderIndexNameList.join("/") ,(error,stats) =>{  
               if(structkit.has(error) == false){
                structkit.each(stats,function(key,val){
                    const valArrayFolder = structkit.arrayConcat( structkit.clone( folderIndexNameList) ,val);
                    if( unixpath.regexpMatch(folderIndexName, val) ){
                        if(structkit.has( that.scanDirListValue ,key)){
                            that.scanDirListValue[key] =  valArrayFolder;
                        }else{
                             
                            that.scanDirListValue.push(valArrayFolder);
                        }
                    }
                    
                });
               }
                
                this.scanDirList(inc+1,complete_func);
            }); 
           

        }else{
           
            if(this.scanDirListValue.length ==0 ){
                this.scanDirListValue.push([folderIndexName]);
            }else{
                this.scanDirListValue.forEach((value,key) =>{
                    that.scanDirListValue[key] =  structkit.arrayConcat(value,folderIndexName);
                });
            }
            this.scanDirList(inc+1,complete_func);
        }
    }else{
        complete_func();
    }
    
}
SrcDir.prototype.srcDirInit =   async function () {

    if (this.loc_path_split.length > 0) {
        const that = this;
        if ((ValidRegexpFolderLookup).test(this.loc_path)) {
               

                this.scanDirList(0,function(){
                   
                   that.scanDirListValue.forEach( (value) =>{
                    that.srcDirFile(value.join("/"));
                   });
                });
        } else {

            /*
             * Ary_join.push(loc_path[0]);
             * loc_path.shift();
             */
            this.srcDirFile(this.loc_path);

        }

    }
    //


};


SrcDir.prototype.cleanFilePath = function (paths) {

    let str_path = unixpath.cleanDirPath(paths);
    const split_str_path = str_path.split("/");

    if (split_str_path.length >0) {

        str_path = split_str_path.slice(0, split_str_path.length-1).join("/");

        return str_path;

    }

    return str_path;

};
SrcDir.prototype.validateDir = function (paths) {

    let boll= false;

    const dirSplit =unixpath.cleanDirPath(paths).split("/");

    if (this.loc_path_split.length >= dirSplit.length) {

        boll = true;

    }

    if (boll) {

        const str_path = unixpath.cleanDirPath(paths).split("/");

        this.loc_path_split.forEach(function (value, key) {


            if (dirSplit.length > key) {

                if (unixpath.regexpMatch(value, str_path[key]) === false) {

                    boll = false;

                }

            }

        });


    }

    return boll;

};

SrcDir.prototype.validateFile = function (paths) {

    let boll= false;

    const dirSplit =paths.split("/");

    if (this.loc_path_split.length >= dirSplit.length) {

        boll = true;

    }

    if (boll) {

        const str_path = unixpath.cleanDirPath(paths).split("/");

        this.loc_path_split.forEach(function (value, key) {

            if (unixpath.regexpMatch(value, str_path[key]) === false) {

                boll = false;

            }

        });


    }

    return boll;

};
SrcDir.prototype.srcDirFile = function (paths) {

    const that = this;

    fs.lstat(paths, function (err, stats) {


        if (err === null) {


            if (stats.isFile()) {

                const raw_basename = unixpath.cleanPathname(path.basename(paths));

                if (that.validateFile(paths) && structkit.indexOf([
                    "grassfile.js",
                    "grasshttp.js"
                ], raw_basename) ===-1) {

                    that.func({"directory": unixpath.cleanPathname(path.dirname(paths)),
                        "filename": raw_basename,
                        "path": unixpath.cleanPathname(paths),
                        "stat": stats,
                        "type": "file"});

                }

            } else if (stats.isDirectory()) {


                fs.readdir(paths, function (errs, files) {

                    if (errs===null) {

                        /*
                         * If (paths =="."){
                         *     paths = process.cwd();
                         * }
                         */
                        files.forEach(function (sin_file) {

                            const local_path = path.join(paths, sin_file);

                            if (that.validateDir(local_path)) {

                                that.srcDirFile(local_path);

                            }

                        });

                    } else {

                        console.log("error", errs);

                    }

                });

            } else {

                grasseumCore.logRed("Invalid filesystem");

            }

        } else {

            grasseumCore.logRed("error", err.toString(), ":", this.path_var);

        }

    });

};

module.exports = function (loc, func) {

    const src =new SrcDir(loc, func);


    return src;

};
