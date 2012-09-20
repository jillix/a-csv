var assert = require('assert');
var CSV = require("../a-csv");
var file = "/test.csv";

describe("CSV Module", function () {
    
    describe("parse", function () {
        
        it("should parse witout error", function(done) {
            
            CSV.parse(__dirname + file, ";", function (err, row, next) {
                
                if (err) {
                    
                    return done(err);
                }
                
                if (row && !(row instanceof Array)) {
                    
                    throw new Error("row should be an array");
                }
                
                if (!row) {
                    
                    assert.deepEqual(null, row, "row should be null, to indicate the end of parsing");
                    done();
                }
                
                next();
            });
        });
    });
});
