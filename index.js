const module_src_index =require("./util/readfilesindir");
const structkit = require("structkit");

module.exports = function (data, func) {

    if (structkit.has(data)) {

        data.forEach(function (value) {

            module_src_index(value, func);

        });

    }


};
