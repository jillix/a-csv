A nodejs CSV parser

##### install via npm: #####
    npm install a-csv
    
##### example: #####
    var CSV = require("a-csv");
    var file = "test.csv";
    var options = {
        delimiter: ";",
        charset: "win1250"
    };

    CSV.parse(file, options, function (err, row, next) {
                    
        if (err) {
            return console.log(err);
        }
        
        if (row !== null) {
            console.log(row);
            next();
        }
        else {
            console.log("finish");
        }
    });