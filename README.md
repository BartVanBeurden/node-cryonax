# Installation

	npm install cryonax -g

# Usage

Create a new website in current directory
	
	cryonax init
	cryonax init -o path/to/dir
	
Create a sample website (blog)

	cryonax example
	cryonax example -o path/to/dir
	
Create a new document

	cryonax doc
	cryonax doc -o path/to/dir
	
Create a new view

	cryonax view
	cryonax view -o path/to/dir
	
Build website in current directory

	cryonax build
	cryonax build -i path/to/dir -o path/to/output
	
# Documents

A cryonax document is a text file with (markdown) content and meta data that can be queried.

A document looks like this:

	---
	{
		"type": "blog",
		"title": "First entry!",
		"date": "Date(2 february 2014)",
		"labels": ["politics", "opinion"]
	}
	---
	
	the content of my blog post
	
At the top of the document is a meta-data section. Meta data is represented as a JSON object.  
In addition to regular JSON data types, you can use "Date()" to create a Date object.

# Views

A cryonax view is a HTML template with embedded javascript in `<%` and `%>` tags.

	<h1><% print(model.meta.title); %></h1>
	
is rendered as

	<h1>First entry!</h1>

# Build Script

The cryonax build script is named "build.js" and contains instructions to generate your website.

# API

## console
## require()
## document(path)

Retrieve a document by path

	var doc = document("blog/2014/first-post.md");
	
### Properties

- `doc.name` - the filename of the document
- `doc.meta` - the metadata associated with the document (e.g. `doc.meta.title`)
- `doc.content` - the rest of the document contents

## documents()

Retrieve all documents

	var articles = documents()
		.filter(function(doc) { return doc.meta.type == "blog"; });
		
## view(path)

Retrieve a view by path

	var template = view("blog/article.html");
	
### Properties

- `view.name` - the filename of the view

### Methods

- `view.render(model)` - render the view, returns a string

### Example

```javascript
// build.js
view("page/head.html").render({ title: "My Blog" });
    
// page/head.html
<h1><% print(model.title); %></h1>
```
    
## markdown(text)

Convert markdown to html

    var html = markdown(document("about.md").content);
	
Cryonax uses `marked` as default markdown parser. If you want to use your own markdown parser, you'll have to `require` it yourself.  
Cryonax uses `highlight.js` as syntax highlighter by default.
	
## summary(html, length, continuedText)

Retrieve a summary of a section of html

- `html` The HTML text to summarize
- `length` The maximum length of the summary
- `continuedText` Text to append to the summary if the html was clipped

	var html = markdown(document("about.md").content);
	var text = summary(html, 10, "[...]");
	// text = "Lorem ipsum [...]"

## print(text)

Outputs a string (only available in views)

## save(path, contents)

Save a file (only available in build.js)
