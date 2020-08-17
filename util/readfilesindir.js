const fs = require("fs");
const path = require("path");
var compt = require("compts");
var validation =require("grasseum_glob/util/validation")
function srcDir(path_var,func){
   

    if(process.platform == "win32"){
        this.reg_split = "\\"
       path_var = path_var.replace(this.reg_split,"/")
    }else{
        this.reg_split = "/"
    }
    this.loc_path =validation.cleanDirPath(path_var);
    this.loc_path_split =validation.cleanDirPath(path_var).split("/");
  
  
    this.func = func;

    this.srcDirInit()

   // this.srcDirFile(path_var,this.func)
}

srcDir.prototype.srcDirInit = function(){  
        if( this.loc_path_split.length > 0 ){
            if(/(\*|\!)/g.test( this.loc_path )){
          
                var let_data = [];
                var main = this;
                this.loc_path_split.forEach(function(v,k){
                   

                    if(/\*/g.test( v ) == false){

                        let_data.push(v)
                    }
                })
             
                if(let_data.length ==0){
                    this.srcDirFile( "." )
                }else{
                    //this.srcDirFile( let_data.join(this.reg_split) )
                    this.srcDirFile( let_data.join("/") )
                }
               // this.srcDirFile( let_data.join(this.reg_split) )
                
            }else{
                //ary_join.push(loc_path[0]);
                //loc_path.shift();
                this.srcDirFile(this.loc_path)
            }
        }
       // 
      
    
}




srcDir.prototype.cleanFilePath = function( paths ){  

    var str_path = validation.cleanDirPath(paths);
    var split_str_path = str_path.split("/")
    if( split_str_path.length >0 ){
        str_path = split_str_path.slice(0, split_str_path.length-1).join("/")
        return str_path
    }else
    return str_path

}      
srcDir.prototype.validateDir = function(paths){    
    var boll= false;

    var dir_split =validation.cleanDirPath(paths).split("/");
    if (this.loc_path_split.length >= dir_split.length){
        boll = true;
    }
 
    if (boll){
        var str_path = validation.cleanDirPath(paths).split("/");
        var main = this;
        this.loc_path_split.forEach(function(v,k){


              if(dir_split.length > k){
                  if(validation.regexpMatch( v,str_path[k] )  == false){
                    boll = false;
                  }
              }
              
        })


    }
    return boll;
}

srcDir.prototype.validateFile = function(paths){    
    var boll= false;

    var dir_split =paths.split("/");

    if (this.loc_path_split.length >= dir_split.length){
        boll = true;
    }

    if (boll){
        var str_path = validation.cleanDirPath(paths).split("/");
        var main = this;
        this.loc_path_split.forEach(function(v,k){

          if(validation.regexpMatch( v,str_path[k] ) == false){
            boll = false;
          }
           
        })


    }

    return boll;
}
srcDir.prototype.srcDirFile = function(paths){    
     
     var main = this;
    fs.lstat(paths, function(err, stats){
                
                
        if (err == null){
            
        
        if(stats.isFile()){
           
          let raw_basename = validation.cleanPathname(path.basename(paths))
          if(main.validateFile( paths ) && compt._.indexOf(["grassfile.js","grasshttp.js"],raw_basename ) ==-1){
          
            main.func({"path":validation.cleanPathname(paths),
                        "type":"file",
                        "stat":stats,
                        "filename": raw_basename,
                        "directory":validation.cleanPathname(path.dirname(paths))
                        });
                   
          }
            
        }
        else if(stats.isDirectory()){ 
            

            fs.readdir(paths,function(errs,files){
                if(errs==null){
                    //if (paths =="."){
                    //    paths = process.cwd();
                    //}
                    files.forEach(function(sin_file) {
                       
                        var local_path = path.join(paths,sin_file);
                        if(main.validateDir( local_path ))
                        main.srcDirFile( local_path )
                    
                    })
                }else{
                    console.log("error",errs)
                }
            })
        }
        else{
            console.log("Invalid filesystem")
        }
        }else{
            console.log("error",err,":",this.path_var)
        }
    })
}

module.exports = function( loc,func){
    var n =new srcDir(loc,func)
}