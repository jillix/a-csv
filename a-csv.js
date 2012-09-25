var fs = require("fs");
var defDelimiter = ",";

// TODO parse csv from network stream

exports.parse = function (path, delimiter, rowHandler) {
    
    // ckeck arguments
    if (typeof delimiter == "function") {
        
        rowHandler = delimiter;
    }
    else if (typeof rowHandler != "function") {
        
        throw new Error("Callback is mandatory");
    }
    
    if (typeof delimiter != "string") {
        
        delimiter = defDelimiter;
    }
    
    if (typeof path != "string") {
        
        throw new Error("Invalid Path");
    }
    
    // open file
    fs.open(path, "r", function (err, fd) {
        
        if (err) {
            
            rowHandler(err);
        }
        else {
            
            // init values
            var length = 8129; //8kb
            var buffer = "";
            var position = 0;
            var current = -1;
            var rows = [];
            var handleRow = function () {
                
                // fire callbacks if there still rows to emit
                if (rows[++current]) {
                
                    // fire callback with row data
                    rowHandler(null, CSVToArray(rows[current], delimiter), handleRow);
                }
                
                // buffer, offset,
                else {
                    
                    fs.read(fd, length, position, "utf8", function (err, data, bytesRead) {
                        
                        if (err) {
                            
                            rowHandler(err);
                        }
                        else {
                            
                            // update position
                            position += bytesRead;
                            
                            // update buffer
                            buffer += data;
                            
                            // create rows
                            rows = buffer.split(/\n|\r/);
                            
                            // set buffer to the last "incomplete" row
                            buffer = rows.pop();
                            
                            if (bytesRead < length && rows.length == 0) {
                                
                                fs.close(fd, function() {
                                    
                                    // get last row if csv file has no \r or \n at the end
                                    if (buffer) {
                                        
                                        // fire callback with row data
                                        rowHandler(null, CSVToArray(buffer, delimiter), function() {
                                            
                                            // terminate csv parsing
                                            rowHandler(null, null, function () {});
                                        });
                                    }
                                    else {
                                        
                                        // terminate csv parsing
                                        rowHandler(null, null, function () {});
                                    }
                                });
                            }
                            else {
                                                                
                                // reset current row status
                                current = -1;
                            
                                handleRow();
                            }
                        }
                    });
                }
            };
            
            handleRow();
        }
    });
};

// TODO make stringify async

// array to string
exports.stringify = function (array, delimiter) {
    
    // make shure theres always a delimiter
    delimiter = delimiter || defDelimiter;
        
    var string = "";
    
    for (var i = 0, l = array.length; i < l; ++i) {
            
        var item = array[i];
        
        for (var i1 = 0, l1 = item.length; i1 < l1; ++i1) {
                
                var cell = item[i1] ? item[i1].toString() : "";
                
                if (cell) {
                    
                    cell = cell.replace('"', '\\"');
                    
                    if (cell.indexOf(delimiter) > -1) {
                        
                        cell = '"' + cell + '"';
                    }
                    
                    string += cell + delimiter;
                }
                else string += delimiter;
        }
        
        string += "\n\r";
    }
    
    return string;
};

// http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
// This will parse a delimited string into an array.
// The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
    
    // return if strData is empty
    if (!strData) {
        
        return null;
    }
    
    //convert to uft8
    strData = strData.toString("urf8");
    
    // Remove delimiter from the end of the string.
    if (strData.substr(-1) === strDelimiter) {
        
        strData = strData.slice(0, -1);
    }
    
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = strDelimiter || defDelimiter;
    
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp((
        
        // Delimiters.
        "(\\" + strDelimiter + "|^)" +
        
        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        
        // Standard fields.
        "([^\"\\" + strDelimiter + "]*))"
    ), "gi");
    
    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [];
    
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {
    
        // Let's check to see which kind of value we
        // captured (quoted or unquoted).
        var strMatchedValue;
        
        if (arrMatches[2]) {
            
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
        }
        else {
        
            // We found a non-quoted value.
            strMatchedValue = arrMatches[3];
        }
        
        // Now that we have our value string, let's add
        // it to the data array.
        arrData.push(strMatchedValue);
    }
     
    // Return the parsed data.
    return arrData;
}