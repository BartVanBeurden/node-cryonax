/**
	Embedded JS
	@author Bart Van Beurden
	@date 30/05/2014
**/

// dependencies
var fs = require("fs-extra");
var Script = require("./script");

/**
	Create a new EJS script
	@param {path} path to the EJS script
**/
var EJS = module.exports = function(path) {
	// parse EJS code into pure javascript code
	// this converts all regular HTML to print("html") statements
	// ideally we would use a full parser but let's just assume that comments do not contain <% or %> tags.
	var code = fs.readFileSync(path, { encoding: "utf8" })
		.split(/<%\s*|\s*%>/)
		.map(function(text, index) {
			if (index % 2 == 1) return text;
			return "print(" + JSON.stringify(text) + ");";
		})
		.join("\n");
		
	// compile the script
	var script = new Script(code, path);
	
	/**
		Run EJS script
		@param {globals} Global object to be used
		@returns output HTML code
	**/
	return function(globals) {
		var buffer = "";
		globals.print = function(str) { buffer += str; }
		script.run(globals);
		return buffer;
	};
};