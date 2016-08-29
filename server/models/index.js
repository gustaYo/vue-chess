
module.exports = function(mongoose) {
    var fs = require('fs')
    var walk = function(path) {
        fs.readdirSync(path).forEach(function(file) {
            var newPath = path + '/' + file;
            var stat = fs.statSync(newPath);
            if (stat.isFile()) {
                if (/(.*)\.(js|coffee)/.test(file)) {
                    if (file != 'index.js') {
                        require(newPath)(mongoose);
                    }
                }
            } else if (stat.isDirectory()) {
                // walk(newPath);
            }
        });
    };
    var models_path = __dirname;
    walk(models_path);
}