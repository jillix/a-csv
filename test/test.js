var assert = require('assert');
var CSV = require("../node-csv");
var file = process.argv[2] || "/test.csv";

CSV.parse(__dirname + file, ";", function (err, row, next) {
    
    if (err) {
        
        console.log(err);
    }
    
    if (row) {
        
        console.log(row);
    }
    
    else {
        
        console.log("END");
    }
    
    next();
});