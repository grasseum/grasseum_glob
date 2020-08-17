exports.regexpMatch = function( regexp,paths ){  

  
    if (/^\*$/g.test(regexp) ){
        regexp= regexp.replace(/\*/g,"([\\w\\d\\s\-\\_\\@]{1,})")       
        regexp= regexp.replace(/\./g,"\\.")
        var reg = new RegExp(""+regexp+"","g")
        
    }else{
        regexp= regexp.replace(/\*/g,"([\\w\\d\\s\-\\_\\@]{1,})")       
        regexp= regexp.replace(/\./g,"\\.")
        var reg = new RegExp("^"+regexp+"$","g")
    }
   



    return reg.test(paths)
}

exports.cleanDirPath = function( paths ){  

    var str_path = paths.replace(/\/$/g,"");
    if(process.platform == "win32"){
        str_path = str_path.replace(/\\/g,"/")
    }
    return str_path

}

exports.cleanPathname = function( paths ){  

   
    if(process.platform == "win32"){
        paths = paths.replace(/\\/g,"/")
    }
    return paths

}