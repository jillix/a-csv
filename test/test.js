var assert = require('assert');
var CSV = require("../node-csv");
var file = process.argv[2] || "/test.csv";

CSV.parse(__dirname + file, ";", function (err, row, next) {
    
    console.log(row);
});