# XML Splitter for NodeJS

[![Build Status](https://secure.travis-ci.org/lindory-project/node-xml-splitter.png?branch=master)](http://travis-ci.org/lindory-project/node-xml-splitter)

It's native and full Javascript class, that provide a easy way to split **huge** XML with one or more paths.

# Installation

With [npm](http://npmjs.org) do:

    $ npm install xml-splitter


# Examples

## Basic
```javascript
	var XMLSplitter = require('xml-splitter')

	xs = new XMLSplitter('/root/item')
	xs.on('data', function(data) {
        console.log(data)
    })
    xs.on('end', function(counter) {
        console.log(counter+' slices !')
    })
    xs.parseString('<root><item><id>1</id></item><item><id>2</id></item></root>')
```
Output:
	
    { id: { '$t': '1' } }
    { id: { '$t': '2' } }
    2 slices !

## Multi-paths
```javascript
	var XMLSplitter = require('xml-splitter')

	xs = new XMLSplitter(['/root/item', '/root/entry'])
	xs.on('data', function(data) {
        console.log(data)
    })
    xs.on('end', function(counter) {
        console.log(counter+' slices !')
    })
    xs.parseString('<root><item><id>1</id></item><entry><id>2</id></entry></root>')
```
Output:
	
    { id: { '$t': '1' } }
    { id: { '$t': '2' } }
    2 slices !

	
## Streaming
```javascript
    var XMLSplitter = require('xml-splitter')

	xs = new XMLSplitter('/root/item')
	xs.on('data', function(data) {
        console.log(data)
    })
    xs.on('end', function(counter) {
        console.log(counter+' slices !')
    })
    xs.parseStream(process.stdin) // or process.stdin.pipe(xs.stream)
```

# Tests

Use [nodeunit](https://github.com/caolan/nodeunit) to run the tests.

    $ npm install nodeunit
    $ nodeunit test

# API Documentation

## Methods

### constructor XMLSplitter(cutter)
Create an new splitter, **cutter** is a string or an array of strings that contains path

### parseString(string, encoding)
Split XML within a string

### parseStream(stream)
Split XML within a stream

## Events

### data
Emit on each slice.

### end
Emit on the end of the XML parsing

## XPath's operators

The XPath standard is not supported, only basic paths (included namespaces) and fews operotors is implemented :

* / : /record, /record/item
* // : //para, /root//item
* \* : /root/*/item, /root/item/*

I do not think I will implement more operators.

# Also

* https://github.com/jahewson/node-big-xml
* https://github.com/DamonOehlman/xmlslicer

# License

[MIT/X11](./LICENSE)
