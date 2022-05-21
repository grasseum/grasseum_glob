const module_src_index =require("./util/readfilesindir");
const structkit = require("structkit");
const fs = require('fs')

const verifyFileCount =async function(data){

        let raw_count = [];
        structkit.each(data,function(key,value){

            module_src_index(value, function(file){
                if(raw_count.indexOf(file.path) ===-1 ){
                    raw_count.push(file.path)
                }
            });

        })
    let rawFileCount =0; 
   return new Promise( (resolve) =>{

    let interval = setInterval(() => {
        
        if( rawFileCount === structkit.count(raw_count)  ){
            clearInterval(interval);
            resolve(structkit.count(raw_count))
        }else{
            rawFileCount = structkit.count(raw_count)
        }
    }, 500);
   } )
}

module.exports = function (data, callback) {
    let list_file = [];
    if (structkit.has(data)) {
        const files = structkit.toArray(data)

        verifyFileCount(files).then( (rawFileCount) =>{
            
        structkit.each(files,function(key,value){

            module_src_index(value, function(file){
                
                if (list_file.indexOf(file.path) ===-1  ) {
                    
                    list_file.push(file.path)
                    callback(file,{
                        isFirstPath: structkit.count(list_file)-1===0,
                        isLastPath: structkit.count(list_file)>=rawFileCount,
                    })

                }
            });

        })
    })

    }

};
