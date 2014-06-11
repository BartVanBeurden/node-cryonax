/*
	Example build script for a blog
*/

// render index page
save("index.html", view("index.html").render(document("index.md")));