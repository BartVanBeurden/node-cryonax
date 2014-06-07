/*
	Example build script for a blog
*/

var noise = require("noise");

// render index page
noise.save("index.html", noise.view("index.html").render(noise.document("index.md")));