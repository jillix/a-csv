A nodejs CSV parser.

##### Install via npm #####
    npm install a-csv
    
##### Example #####
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
            return next();
        }
        
        console.log("finish");
    });

####License

"THE BEER-WARE LICENSE" (Revision 42):

adrian@ottiker.com wrote this code. As long as you retain this notice you
can do whatever you want with this stuff. If we meet some day, and you think
this stuff is worth it, you can buy me a beer in return.
