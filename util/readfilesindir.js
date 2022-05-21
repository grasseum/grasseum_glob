const fs = require("fs");

const path = require("path");
const structkit = require("structkit");
const grasseumCore = require("grasseum_console");

const {unixpath} = require('path-assist');

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
SrcDir.prototype.scanDirList =  async function (inc,complete_func) {

    const that = this;
    if(this.loc_path_split.length > inc){
        const folderIndexName =   this.loc_path_split[inc].trim();  
        const testss = /(\*|!)/g.test(folderIndexName)
        if (testss) {
           
      
        try{
           
             let incKey =0;
           await that.scanDirListValue.forEach( async (mv,mk) =>{


                const pathVariable = mv.join("/");

  
               
               const fsLstat = fs.lstatSync( pathVariable);


               if (fsLstat.isFile()) {
                   //if("src/module/index.esm.js"===pathVariable)
                   //console.log(pathVariable,"::pathVariable_file",inc,this.loc_path_split.length)
                  // this.loc_path_split=structkit.delimiter(this.loc_path_split ,0, inc);
                  // await  that.scanDirList(inc+4,complete_func);
                }
               if(fsLstat.isDirectory()){
                //console.log(pathVariable,"::pathVariable_dir")
                const readDir = await fs.readdirSync( pathVariable );
                    
                 await readDir.forEach( async function(  val , key) {
                    const valArrayFolder = structkit.arrayConcat( structkit.clone( mv) ,val);
                        if(structkit.has( that.scanDirListValue ,incKey)){
                            that.scanDirListValue[incKey] =  valArrayFolder;
                        }else{
                             
                            that.scanDirListValue.push(valArrayFolder);
                        }
                        incKey+=1;
                    
                });
                

               }
               await  that.scanDirList(inc+1,complete_func);
                
           } )
          

        }
        catch(error){
            console.log( error, ":Error")
        }    
         
             
        }else{
            if(this.scanDirListValue.length ==0 ){
                this.scanDirListValue.push([folderIndexName]);
            }else{
                this.scanDirListValue.forEach((value,key) =>{
                    
                     that.scanDirListValue[key] =  structkit.arrayConcat(value,folderIndexName);
                });
            }
            await this.scanDirList(inc+1,complete_func); 
        
        }   
    }else{
        complete_func();
    }
    
}
SrcDir.prototype.srcDirInit =  async  function () {

    if (this.loc_path_split.length > 0) {
        const that = this;
        const testss = /(\*|!)/g.test(that.loc_path) 
        if (testss) {
               
               
            await this.scanDirList(0,function(){
                   
                   that.scanDirListValue.forEach( (value) =>{
                          
                            that.srcDirFile(value.join("/"));
                        
                   });
                });
        } else {
           
            this.srcDirFile(this.loc_path);

        }

    }
    

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

                if (that.validateFile(paths) ) {

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

            grasseumCore.logRed("error", err.toString(), this.path_var );

        }

    });

};

module.exports = function (loc, func) {

    const src =new SrcDir(loc, func);


    return src;

};
