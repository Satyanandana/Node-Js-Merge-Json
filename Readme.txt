Operational Specifications

The filepath arguments must be preceeded by switches:
-i: the path to an input file
-o: the path to an output file
There may be one or more -i arguments, but only one -o argument. Arguments may be in any order, but each switch must be followed by a filepath. Filepaths may be absolute or relative to the working directory at the time of command line execution.
For example, the application may be invoked like this:
node application.js -i path/to/file -i path/to/another/file -o path/to/yet/another/file
Input files should contain JSON object data. The output file should be encoded as valid JSON, pretty-printed with tabs represented by four space characters.
Operational Example

The objects provided as input should be merged in the order they are specified on the command line. If multiple objects contain the same property, values from later objects should overwrite that property. Given these JSON input files in the following order:

Error handling :

If there are any error conditions during the runtime of this application, an appropriate error message should be written to stderr. Error conditions may include, but are not limited to:
Invalid number of arguments, or no arguments, are provided on the command line.
Filepath is invalid or refers to something other than a file (e.g. a directory or a UNIX domain socket.)
Input file does not contain a valid JSON object.
Output filepath is not writeable.


Accept a hyphen (-) to represent standard output when used as the output filepath. For example:
$ node application.js -i input.json -o -
...would write the resulting object to stdout instead of a file.


tests :

node application.js -i input0.json -i input1.json -o output.json -i input2.json

node application.js -i input0.json -i input1.json -o output.json -i -o -


