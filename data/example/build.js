/**
	Example build script for a blog
	@author Bart Van Beurden
**/

var path = require("path");

// render all blog posts
// this renders "/blog/2014/my-first-entry/index.html"
documents()
	.filter(function(doc) { return doc.meta.type == "blog"; })
	.forEach(function(doc) {
		console.log("rendering document", '"' + doc.path + '"');
		var url = doc.path.replace(/\.[^\.]+$/, "/index.html");
		var content = view("blog/article.page.html").render(doc);
		save(url, content);
	});
	
// render all label pages
// this renders "/blog/labels/games/index.html"
documents()
	.filter(function(doc) { return doc.meta.type == "blog"; })
	.reduce(function(labels, doc) {
		var lbls = doc.meta.labels.filter(function(lbl) { return labels.indexOf(lbl) == -1; });
		return labels.concat(lbls);
	}, [])
	.forEach(function(label) { 
		console.log("rendering label", '"' + label + '"');
		var url = "/blog/labels/" + label + "/index.html";
		var content = view("blog/label.page.html").render(label);
		save(url, content);
	});
	
// render year index
// this renders "/blog/2014/index.html"
documents()
	.filter(function(doc) { return doc.meta.type == "blog"; })
	.reduce(function(years, doc) {
		var y = (new Date(doc.meta.date)).getFullYear();
		years[y] = years[y] || [];
		years[y].push(doc);
		return years;
	}, [])
	.forEach(function(docs, year) { 
		console.log("rendering year", '"' + year + '"');
		var url = "/blog/" + year + "/index.html";
		var content = view("blog/year.page.html").render({ year: year, docs: docs });
		save(url, content);
	});
	
// render pure static pages
documents()
	.filter(function(doc) { return doc.meta.type == "static"; })
	.forEach(function(doc) {
		var url = "/" + doc.name + "/index.html";
		var content = view("static.page.html").render(doc);
		save(url, content);
	});

// render index
// this renders "/blog/index.html"
save("/blog/index.html", view("index.page.html").render());
save("/index.html", view("index.page.html").render());
