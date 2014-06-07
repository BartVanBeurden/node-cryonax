/**
	cryonax script
	@author Bart Van Beurden
	@date 07/06/2014
**/

// dependencies
var vm = require("vm");
var req = require("require-like");
var path = require("path");

/**
	Script
	@param {code} String containing javascript code
	@param {p} (virtual) path to the script
**/
var Script = module.exports = function(code, p) {
	console.assert(typeof code == "string", "Script() - code must be a string");
	console.assert(typeof p == "string", "Script() - path must be a string");
	
	this.path = p;
	this.require = req(p);
	this.code = null;
	
	try {
		this.code = vm.createScript(code, p);
	} catch (exception) {
		console.log("ScriptError: " + exception.message);
		console.log("    at " + p);
		throw exception;
	}
}

/**
	Script#run()
	@param {globals} Global object for the script
**/
Script.prototype.run = function(globals) {
	console.assert(typeof globals == "object", "Script#run() - globals must be an object");

	// copy global objects
	globals.global = globals;
	globals.__filename = path.basename(this.path);
	globals.__dirname = path.basename(this.path);
	globals.console = console;
	globals.require = this.require;
	
	this.code.runInNewContext(vm.createContext(globals));
};