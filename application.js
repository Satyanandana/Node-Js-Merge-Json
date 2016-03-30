#!/usr/bin/env node

'use strict';

// Required modules to compile the application
var Promise = require("bluebird");
var fs = require('fs');
var filendir = require('filendir');
var jsonUtility = require("./jsonUtility");
var readline = require('readline');
Promise.promisifyAll(fs);


var args = process.argv.slice(2); // pops the first two arguments passed node,apprication.js
var inputFiles = []; // arrray to hold input file paths
var outputFiles = []; // array to hold output file path
var otherArgs = []; // array to hold invalid arguments
var validArguments = false; // boolean to hold whether the arguments are valid

/* Enter the if block if number of arguments are divisible by 2*/
if (args.length % 2 === 0) {
    // Iterating args.length divided by 2 time checking 2 arguments in each iteration	
    args.forEach(function(element, index, array) {
        if (index % 2 === 0) {
            var filePath = array[index + 1];
            var isString = (typeof filePath === 'string');
            // if the i th argument matches with '-i' and  the i+1 th argument is a string.
            if (element === "-i" && isString) {
                // Push the i+1 th argument into inputFiles array
                inputFiles.push(filePath);
                validArguments = true;
            }
            // if the i th argument matches with '-o' and  the i+1 th argument is a string and outputFiles.length is equal to 0.  
            else if (element === "-o" && isString && outputFiles.length ===
                0) {
                // Push the i+1 th argument into outputFiles array
                outputFiles.push(filePath);
                validArguments = true;
            }
            // if the i th argument matches with '-i' and  the i+1 th argument is not a string.  
            else if (element === "-i" && !isString) {
                // set validArguments to false and print message to console
                console.error(filePath +
                    "   is not a valid input file path");
                otherArgs.push("Element : " + element +
                    " , filepath : " + filePath);
                validArguments = false;
            }
            // if the i th argument matches with '-o' and  the i+1 th argument is not a string.
            else if (element === "-o" && !isString) {
                // set validArguments to false and print message to console
                console.error(filePath +
                    "   is not a valid output file path");
                otherArgs.push("Element : " + element +
                    " , filepath : " + filePath);
                validArguments = false;
            } else {
                // set validArguments to false and print message to console
                otherArgs.push("Element : " + element +
                    " , filepath : " + filePath);
                validArguments = false;
            }
        }
    });
    // Here we check whether there are one or more -i arguments, but only one -o argument and 0 invalid arguments"
    if (outputFiles.length !== 1 || inputFiles.length === 0 || otherArgs.length >
        0) {
        // set validArguments to false and print message to console
        validArguments = false;
        console.error(
            "There may be one or more -i arguments, but only one -o argument"
        );
        console.error("Invalid arguments list");
        console.error(otherArgs);
    }
    // Enter the else block if number of arguments are not divisible by 2
} else {
    // set validArguments to false and print message to console
    validArguments = false;
    console.error("Invalid or wrong number of arguments");
}
// here if all the argument are valid proceed further
if (validArguments) {

    /*calling function to get data from input file paths 
    ,merge the JSON data and finally write the JSON to an output file or console.
    This function calls the other functions in nested callbacks .mergeInputJsonData >> writeFileOrDisplay
	*/
   
    getJsonData(function(data) {
        writeFileOrDisplay(data);
    });
    
}


// This function reads the json data from input file paths.
function getJsonData(callback) {
        var mergedData; // variable to hold the merded json object
        var validInput = false; //Boolean to check the input is valid after reading all the files.
        var counter = inputFiles.length;
        var jasonArray = []; // array to hold the JSON data in order.
        inputFiles.forEach(function(element, index, array) {

            fs.readFileAsync(element, 'utf8')
                .then(JSON.parse)
                .then(function(data) {
                    jasonArray[index] = data;
                    counter--; // decrement the counter after reading each file
					// After reading all the files successfully merge the jasonArray to  mergedData object if 
                    if (counter === 0) {
                        if (validInput) {
                            mergedData = jsonUtility.mergeArrayOFJSON(
                                jasonArray);
						    // After getting the merged data call the callback function
                            callback(mergedData);
                        }
                    }
                    validInput = true;
                })
                .catch(SyntaxError, function(e) {
                    validInput = false;
                    counter--; // decrement the counter after reading each file
                    console.error(element +
                        ' contains invalid jason data');
                    return false;
                })
                .catch(function(e) {
                    validInput = false;
                    counter--; // decrement the counter after reading each file
                    if (e.code === 'ENOENT') {
                        console.error(element + ' is not found');
                    } else {
                        throw e;
                    }
                });

        });
    }
	
	
// This function writes the merged JSON data to out file or display on console if the output fie path is '-'
function writeFileOrDisplay(data) {
    var outputPath = outputFiles[0];
    // Enters the if block if the output file path is equal to '-'
    if (outputPath === "-") {
        console.error("");
        // Convert the JSON data to string with 4 space format and write it to console
        process.stdout.write(JSON.stringify(data, null, '    '));
    }
    // Enters the else block if the file path is not equal to '-'
    else {

        var directoryPath = getFileDirectory(outputPath);
        fs.stat(directoryPath, function(err) {

            if (err) {
				var rl1 = readline.createInterface({
                              input: process.openStdin(),
                              output: process.stdout
                                                 });
                console.error("Unable to find the directory : " + directoryPath);
                rl1.question("What you like to create this directory? [Y/N]",function(answer) {
                        if (answer === 'Y') {
                            writeJsonFile(outputPath, data);
                        } else {
                            console.error(
                                "program ended without writing to output file"
                            );
                        }
                        rl1.close();
                    });
            } else {
                writeJsonFile(outputPath, data);
            }


        });


    }
}


// This is a utility function to get directory path out of file path.
function getFileDirectory(filePath) {

    if (filePath.indexOf("/") !== -1) { // windows
        return filePath.substring(0, filePath.lastIndexOf('/'));
    } else if (filePath.indexOf("\\") !== -1) { // unix
        return filePath.substring(0, filePath.lastIndexOf('\\'));
    } else {
        return "./"; //current directory
    }
}

function writeJsonFile(path, data) {
    // Creates necessary directories & file w.r.t the give file path if they doesnt exist and writes the JSON data to file
    filendir.wa(path, JSON.stringify(data, null, '    '), function(err) {
        if (!err) {
            // if no error print success message to console     
            console.error("wrote to " + path + " file successfully");
        } else {
            console.error("Unable to write data to " + path);
        }
    });

}