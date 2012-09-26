var fs = require("fs");
var iconv = require("iconv-lite");

// TODO parse csv from network stream
exports.parse = function (path, options, rowHandler) {
    
    // ckeck arguments
    if (typeof options == "function") {
        
        rowHandler = options;
    }
    else if (typeof rowHandler != "function") {
        
        throw new Error("Callback is mandatory");
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
            
            // default values
            var delimiter = options.delimiter || ",";
            var length = options.bufferSize || 8 * 1024;
            var charset = options.charset || "utf8";
            
            // init values
            var buffer = new Buffer(length);
            var strBuffer = "";
            var current = -1;
            var rows = [];
            var theEnd = false;
            var size = 0;
            var handleRow = function () {
                
                // fire rowHandler if there still rows to emit
                if (typeof rows[++current] != "undefined") {
                
                    // fire callback with row data
                    rowHandler(null, CSVRowToArray(rows[current], delimiter), handleRow);
                }
                
                // if no more rows are left and the end is reached,
                // close file end send empty callback
                else if (theEnd) {
                    
                    fs.close(fd, function() {
                    
                        // end recursive function calls
                        rowHandler(null, null, function () {}, size);
                    });
                }
                
                // read a bit more
                else {
                    
                    // fill buffer with emptiness
                    buffer.fill("");
                    
                    fs.read(fd, buffer, 0, length, null, function (err, bytesRead, buffer) {
                        
                        if (err) {
                            
                            rowHandler(err);
                        }
                        else {
                            
                            size += bytesRead;
                            
                            // reset current row status
                            current = -1;
                            
                            // update string buffer
                            if (charset == "utf8") {
                                
                                strBuffer += buffer.toString();
                            }
                            // convert string to utf8
                            else {
                                
                                // TODO recognize charset
                                strBuffer += iconv.decode(buffer, charset);
                            }
                            
                            // convert line endings
                            strBuffer = strBuffer.replace(/\r\n|\n\r|\r/g, "\n");
                            
                            // create rows
                            rows = strBuffer.split(/\n/);
                            
                            // set buffer to the last "incomplete" row
                            strBuffer = rows.pop();
                            
                            // indicate that no more data will be read from file
                            if (bytesRead < length) {
                                
                                theEnd = true;
                            }
                            
                            // continue
                            handleRow();
                        }
                    });
                }
            };
            
            // start parsing
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
                    
                    cell = cell.replace('"', '\"');
                    
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
function CSVRowToArray(strData, strDelimiter) {
    
    // return if strData is an empty string
    if (strData === "") {
        
        return "";
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
    var arrMatches = objPattern.exec(strData);
    
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