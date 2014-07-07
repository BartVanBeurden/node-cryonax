/**
	Cryonax Library
	@author Bart Van Beurden
	@date 30/05/2014
**/

// dependencies
var path = require("path");
var url = require("url");
var fs = require("fs-extra");
var documents = require("./documents.js");
var views = require("./views.js");
var Script = require("./script.js");

// cryonax
var cryonax = module.exports = {};
var utils = {};

// clear directory contents
utils.clearDirContentsSync = function(dirPath) {
	if (fs.existsSync(dirPath))
		fs.readdirSync(dirPath)
			.map(function(node) { return path.join(dirPath, node); })
			.forEach(fs.removeSync);
};

// convert markdown to html
utils.markdown = (function() {
	var marked = require("marked");
	var renderer = new marked.Renderer();
	
	// add embed tags to headings
	renderer.heading = function (text, level) {
		var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
		
		return '<h' + level + '>'
			+ '<a name="' + escapedText + '" class="anchor" href="#' + escapedText + '">' 
			+ '<span class="header-link"></span></a>' + text
			+ '</h' + level + '>';
	};
	
	marked.setOptions({
		renderer: renderer,
		gfm: true,
		tables: true,
		smartLists: true,
		smartypants: true,
		highlight: function(code, language) {
			return require("highlight.js").highlight(language, code).value;
		}
	});
	
	return marked;
})();

// strip HTML tags
utils.stripHTML = function(html) {
	// this is obviously a "naive" approach - we'd need a full html parser for correct code
	// strip closing phrasing html tags (since it's phrasing content, replace with a space)
	html = html.replace(/<\/(abbr|audio|b|bdo|br|button|canvas|cite|code|command|datalist|dfn|em|embed|i|iframe|img|input|kbd|keygen|label|mark|math|meter|noscript|object|output|progress|q|ruby|samp|script|select|small|span|strong|sub|sup|svg|textarea|time|var|video|wbr|a|area|del|ins|link|map|meta)[^>]*>/g, " ");
	// strip other html tags
	html = html.replace(/<[^>]*>/g, "");
	// trim spaces
	html = html.replace(/\s+/g, " ");
	
	return html;
};

/*
	get summary text
	@param {html} html text to summarize
	@param {length} maximum length of summary
	@param {continuedText} text to show the html was summarized (e.g. "[...]")
*/
utils.summary = function(html, length, continuedText) {
	continuedText = continuedText || "";
	html = utils.stripHTML(html);
	var text = html.substring(0, (html + " ").lastIndexOf(" ", length));
	return text == html
		? text
		: text + " " + continuedText;
};

// create view scope
utils.createViewScope = function(docs, views, config) {
	return {
		console: console,
		document: docs.findByPath,
		documents: docs.findAll,
		view: views.findByPath,
		markdown: utils.markdown,
		stripHTML: utils.stripHTML,
		summary: utils.summary,
		url: function(relativePath) { return url.resolve(config.url, relativePath).replace(/\\/g, "/"); }
	};
};

// create script scope
utils.createScriptScope = function(docs, views, config, outputPath) {
	var scope = utils.createViewScope(docs, views, config);
	scope.save = function(filePath, fileContent) {
		filePath = path.join(outputPath, filePath);
		fs.outputFileSync(filePath, fileContent);
	};
	return scope;
};

/**
	cryonax.init()
	Create a new cryonax website directory
	@param {outputPath} path to the site directory
**/
cryonax.init = function(outputPath) {
	fs.ensureDirSync(outputPath);
	utils.clearDirContentsSync(outputPath);
	fs.copySync(path.join(__dirname, "../data/init"), outputPath);
}

/**
	cryonax.example()
	Create a new cryonax website directory (using a full example site)
	@param {outputPath} path to the site directory
**/
cryonax.example = function(outputPath) {
	fs.ensureDirSync(outputPath);
	utils.clearDirContentsSync(outputPath);
	fs.copySync(path.join(__dirname, "../data/example"), outputPath);
};

/**
	cryonax.createDocument()
	Create a new cryonax document at {outputPath}/documents/{name}
	@param {outputPath} path to the root directory
	@param {name} name of the document
	@param {meta} document meta data
**/
cryonax.createDocument = function(outputPath, name, meta) {
	documents(outputPath).create(name, meta);
};

/**
	cryonax.createView()
	Create a new cryonax view at {outputPath}/views/{name}
**/
cryonax.createView = function(outputPath, name) {
	views(outputPath).create(name);
};

/**
	cryonax.build()
	Build a cryonax website
	@param {inputPath} path to the site directory
	@param {outputPath} path to the output directory
	@param {config} Configuration object
	@param {config.url} Root URL of website
**/
cryonax.build = function(inputPath, outputPath, config) {
	var docs = documents(inputPath);
	var vws = views(inputPath);
	
	// load docs, views
	var createScope = function() { return utils.createViewScope(docs, vws, config); }
	docs.load();
	vws.load(createScope);

	// create script
	var scriptPath = path.join(inputPath, "build.js");
	var scriptCode = fs.readFileSync(scriptPath, { encoding: "utf8" });
	var script = new Script(scriptCode, scriptPath);
	
	// execute script & copy static files
	fs.ensureDirSync(outputPath);
	utils.clearDirContentsSync(outputPath);
	fs.copySync(path.join(inputPath, "documents"), outputPath);
	script.run(utils.createScriptScope(docs, vws, config, outputPath));
};
