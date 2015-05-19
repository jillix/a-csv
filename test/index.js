// Dependencies
var Assert = require("assert")
  , CSV = require("../lib")
  ;

// Expectations
const EXPECT = {
  HEADERS: [
    ["Name", "Age", "Location"]
  , ["Alice", "15", "Europe"]
  , ["Bob", "17", "Asia"]
  , ["Carol", "70", "Africa"]
  ]
  , NO_HEADERS: [
    ["Alice", "15", "Europe"]
  , ["Bob", "17", "Asia"]
  , ["Carol", "70", "Africa"]
  ]
};

it("should parse the csv file, with default options", function (cb) {
    var rows = [];
    CSV.parse(__dirname + "/headers.csv", function (err, row, next) {

        if (err) {
            return cb(err);
        }

        if (row === null) {
            console.log(rows);
            Assert.deepEqual(rows, EXPECT.HEADERS);
            return cb();
        }

        rows.push(row);
        next();
    });
});

it("should parse the csv file, handling the headers", function (cb) {
    var rows = [];
    CSV.parse(__dirname + "/headers.csv", { headers: true }, function (err, row, next) {

        if (err) {
            return cb(err);
        }

        if (row === null) {
            Assert.deepEqual(rows, EXPECT.NO_HEADERS);
            return cb();
        }

        rows.push(row);
        next();
    });
});
