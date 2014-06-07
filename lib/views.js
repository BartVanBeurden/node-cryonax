/**
	noise view
	@author Bart Van Beurden
	@date 07/06/2014
**/

// dependencies
require("oo-native-ext");
var fs = require("fs-extra");
var path = require("path");
var ejs = require("./ejs.js");

/**
	View
	@param {p} path to the view (relative to "path/views/")
	@param {renderer} Function that takes a model and renders the view to HTML
	@param {createScope}
**/
var View = function(p, renderer, createScope) {
	this.path = p;
	this.name = path.basename(p).replace(/\..+$/, "");
	this.render = function(model) {
		var scope = createScope();
		scope.model = model;
		return renderer(scope);
	};
};

/**
	initialize view database on dirPath
	@param {dirPath} path to the root view directory
**/
module.exports = function(dirPath) {
	var array = [];
	var index = {};
	var rootPath = path.join(dirPath, "views");
	
	/**
		load view in memory
		@param {viewPath} path to the view to load
		@param {createScope} function that creates a new scope
	**/
	var loadView = function(viewPath, createScope) {
		var renderer = ejs(viewPath);
		var view = new View(path.relative(rootPath, viewPath), renderer, createScope);
		array.push(view);
		index[view.path] = view;
	};
	
	/**
		load all views in memory
		@param {dirPath} path to directory containing the views (relative to rootPath)
		@param {createScope} function that creates a new scope when rendering views
	**/
	var load = function(dirPath, createScope) {
		if (arguments.length == 1) {
			createScope = dirPath;
			dirPath = rootPath;
		}
		
		fs.readdirSync(dirPath).forEach(function(node) {
			var nodePath = path.join(dirPath, node);
			var stats = fs.statSync(nodePath);
			if (stats.isFile()) loadView(nodePath, createScope);
			if (stats.isDirectory()) load(nodePath, createScope);
		});
	};
	
	/**
		create a new view
		@param {name} name of the view
	**/
	var create = function(name) {
		var viewName = path.basename(name);
		if (viewName.indexOf(".") == -1) viewName += ".html";
		
		var viewPath = path.join(rootPath, path.dirname(name), viewName);
		var viewContents = [
			"<%",
			"%>",
			"<div></div>"
		].join("\n");
		
		fs.outputFileSync(viewPath, viewContents);
	};
	
	/**
		retrieve all views
	**/
	var findAll = function() { 
		return array;
	};
	
	/**
		retrieve view by path
		@param {viewPath} path to view
	**/
	var findByPath = function(viewPath) {
		return index[path.normalize(viewPath)] || null;
	};
	
	return {
		load: load,
		findAll: findAll,
		findByPath: findByPath,
		create: create
	};

}.memoize();

