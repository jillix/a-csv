var fs = require("fs");

// TODO make a split pattern!

exports.parse = function (path, delimiter, rowHandler) {
    
    // ckeck arguments
    if (typeof delimiter == "function") {
        
        rowHandler = delimiter;
    }
    else if (typeof rowHandler != "function") {
        
        throw new Error("Callback is mandatory");
    }
    
    if (typeof delimiter != "string") {
        
        delimiter = ";";
    }
    
    if (typeof path != "string") {
        
        throw new Error("Invalid Path");
    }
    
    // open file
    fs.open(path, 'r', function (err, fd) {
        
        if (err) {
            
            rowHandler(err);
        }
        else {
            
            // init values
            var length = 8129; //8kb
            var buffer = "";
            var position = 0;
            var current = 0;
            var rows = [];
            var last = false;
            var handleRow = function () {
                
                // end if last is true
                if (last) {
                    
                    // close file
                    fs.close(fd, function(err) {
                        
                        rowHandler(err, null);
                    });
                }
                
                // fire callbacks if there still rows to emit
                else if (current + 1 < rows.length) {
                    
                    // increment pointer
                    ++current;
                    
                    // fire callback with row data
                    rowHandler(null, rows[current].split(delimiter), handleRow);
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
                            rows = buffer.split("\n");
                            
                            // reset current row status
                            current = -1;
                            
                            // if there are rows..
                            if (rows.length > 1) {
                                
                                //set buffer to the last "incomplete" row
                                buffer = rows.pop();
                                
                                //increment pointer
                                ++current;
                                
                                //fire callback with row data
                                rowHandler(null, rows[current].split(delimiter), handleRow);
                            }
                            
                            // check if it's the last row
                            else if (bytesRead != length) {
                                
                                // TODO check if there are more then one row left
                                
                                // ensure that in the next round is finish
                                last = true;
                                
                                // fire callback with last row
                                rowHandler(null, rows[0].split(delimiter), handleRow);
                            }
                        }
                    });
                }
            };
            
            handleRow();
        }
    });
};

//array to string
exports.stringify = function (array, separator) {

    if (!separator) {
        
        separator = ";";
    }
        
    var string = "";
    
    for (var i = 0, l = array.length; i < l; ++i) {
            
        var item = array[i];
        
        for (var i1 = 0, l1 = item.length; i1 < l1; ++i1) {
                
                var cell = item[i1] ? item[i1].toString() : "";
                
                if (cell) {
                    
                    string += cell.replace(/"/g, '\"') + separator;
                }
                else string += separator;
        }
        
        string += "\r";
    }
    
    return string;
};

// http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");
    
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp((
        
        // Delimiters.
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
        
        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        
        // Standard fields.
        "([^\"\\" + strDelimiter + "\\r\\n]*))"
    ), "gi");
    
    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];
    
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){
    
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];
        
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);
        }
        
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        var strMatchedValue;
        if (arrMatches[2]) {
            
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[2].replace(
                new RegExp( "\"\"", "g" ),
                "\""
            );
         
        } else {
        
            // We found a non-quoted value.
            strMatchedValue = arrMatches[3];
        }
        
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }
     
    // Return the parsed data.
    return arrData;
}