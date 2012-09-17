var assert = require('assert');
var CSV = require("./node-csv");
var file = process.argv[2] || "test.csv";

CSV.parse(file, ";", function (err, row, next) {
    
    
});