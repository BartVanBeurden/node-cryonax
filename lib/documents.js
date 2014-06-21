/**
	cryonax document
	@author Bart Van Beurden
	@date 29/05/2014
**/

// dependencies
var fs = require("fs-extra");
var path = require("path");
var utils = require("./utils.js");

/**
	Document
	@param {p} path to the document (relative to "site/documents/")
	@param {meta} Object - document meta data
	@param {content} document contents (string)
**/
var Document = function(p, meta, content) {
	this.path = p;
	this.name = path.basename(p).replace(/\..+$/, "");
	this.meta = meta;
	this.content = content;
};

/*
	Parse meta data
	Converts date strings into JS Date
	@param {obj} Meta Object
*/
Document.parseMeta = function(obj) {
	var matches = null;
	for (var key in obj) if (obj.hasOwnProperty(key)) {
		var value = obj[key];
		if (typeof value == "string") {
			// parse dates
			if (matches = value.match(/^Date\((.+)\)$/)) {
				var date = new Date(matches[1]);
				if (!isNaN(date.getTime())) obj[key] = date;
			}
		} else if (typeof value == "object") {
			Document.parseMeta(value);
		}
	}
	return obj;
};

/*
	Stringify meta data
	Converts JS Date into date string
	@param {obj} Meta Object
*/
Document.stringifyMeta = function(obj) {
	for (var key in obj) if (obj.hasOwnProperty(key)) {
		var value = obj[key];
		if (value instanceof Date) {
			obj[key] = "Date(" + value.toDateString() + ")";
		} else if (typeof value == "object") {
			Document.stringifyMeta(value);
		}
	}
	return obj;
};

/**
	initialize document database on dirPath
	@param {dirPath} path to the root document directory
**/
module.exports = utils.memoize(function(dirPath) {
	var array = [];
	var index = {};
	var rootPath = path.join(dirPath, "documents");
	
	/**
		load document in memory
		@param {docPath} path to the document to load
	**/
	var loadDoc = function(docPath) {
		// read document file
		var data = fs.readFileSync(docPath, { encoding: "utf8" });
		
		// detect meta header
		var begin = data.indexOf("---") + 3;
		var end = data.indexOf("---", begin);
		
		// get meta data
		var meta = begin == 2
			? { type: "default" }
			: Document.parseMeta(JSON.parse(data.substring(begin, end)));
			
		// get content
		var content = begin == 2
			? data
			: data.substring(end + 3);
		
		var doc = new Document(path.relative(rootPath, docPath), meta, content);
		array.push(doc);
		index[doc.path] = doc;
	};
	
	/**
		load all documents in memory
	**/
	var load = function(dirPath) {
		dirPath = dirPath || rootPath;
		fs.readdirSync(dirPath).forEach(function(node) {
			var nodePath = path.join(dirPath, node);
			var stats = fs.statSync(nodePath);
			if (stats.isFile() && path.extname(nodePath).match(/^\.(md|txt|html?)$/)) loadDoc(nodePath); // only load "text" documents
			if (stats.isDirectory()) load(nodePath)
		});
	};
	
	
	/**
		create a new document
	**/
	var create = function(name, meta) {
		var docName = path.basename(name);
		if (docName.indexOf(".") == -1) docName += ".md";
		
		var docPath = path.join(rootPath, path.dirname(name), docName);
		var docContents = [
			"---",
			JSON.stringify(Document.stringifyMeta(meta), null, "\t"), // meta data
			"---",
			"",
			"content"
		].join("\n");
		
		fs.outputFileSync(docPath, docContents);
	};
	
	/**
		retrieve all documents
	**/
	var findAll = function() { 
		return array;
	};
	
	/**
		retrieve document by path
		@param {docPath} path to document
	**/
	var findByPath = function(docPath) {
		return index[path.normalize(docPath)] || null;
	};
	
	return {
		load: load,
		findAll: findAll,
		findByPath: findByPath,
		create: create
	};
	
});
