#!/usr/bin/env node

// dependencies
var program = require("commander");
var promptly = require("promptly");
var path = require("path");
var cryonax = require("../index.js");

/**
	program
**/
program
	.version("0.2.12")
	.usage("<command> [options]");
	
/**
	command: init
	initialize a new website
**/
program.command("init")
	.description("initialize a new website")
	.option("-o, --output <path>", "Path to the website directory, defaults to .")
	.action(function(cmd) {
		cryonax.init(cmd.output || process.cwd());
	});

/**
	command: example
	initialize a new website (full example)
**/
program.command("example")
	.description("initialize a new example website")
	.option("-o, --output <path>", "Path to the website directory, defaults to .")
	.action(function(cmd) {
		cryonax.example(cmd.output || process.cwd());
	});
	
/**
	command: build
	build a website
**/
program.command("build")
	.description("build a website")
	.option("-i, --input <path>", "Path to the website directory, defaults to .")
	.option("-o, --output <path>", "Path to the output directory, defaults to ./out")
	.option("-u, --url <root>", "Path to the root URL, defaults to /")
	.action(function(cmd) {
		cryonax.build(
			cmd.input || process.cwd(),
			cmd.output || path.join(process.cwd(), "./out"),
			{ url: cmd.url || "/" }
		);
	});
	
/**
	command: doc
	create a new document
**/
program.command("doc")
	.description("create a new document")
	.option("-o, --output <path>", "Path to the output directory, defaults to .")
	.action(function(cmd) {
		promptly.prompt("name:", function(error, name) {
		promptly.prompt("type: (blog)", { default: "blog" }, function(error, type) {
		promptly.prompt("title:", function(error, title) {
			cryonax.createDocument(cmd.output || process.cwd(), name, {
				"type": type,
				"title": title,
				"date": new Date()
			});
		})})});
	});
	
/**
	command: view
	create a new view
**/
program.command("view")
	.description("create a new view")
	.option("-o, --output <path>", "Path to the output directory, defaults to .")
	.action(function(cmd) {
		promptly.prompt("name:", function(error, name) {
			cryonax.createView(cmd.output || process.cwd(), name);
		});
	});
	
// execute program
program.parse(process.argv);