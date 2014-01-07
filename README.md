# XML Splitter for NodeJS

[![Build Status](https://secure.travis-ci.org/touv/node-xml-splitter.png?branch=master)](http://travis-ci.org/touv/node-xml-splitter)

It's native and full Javascript class, that provides an easy way to split **huge** XML data with one or more paths.

## Contributors

  * [Nicolas Thouvenin](https://github.com/touv) 
  * [Stéphane Gully](https://github.com/kerphi)
  * [Alison Rowland](https://github.com/arowla)

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

### constructor XMLSplitter(cutter, options)
Create an new splitter, **cutter** is a string or an array of strings that contains path.
Options are :

* **regular** : To indicate if the cutter is applied to not nested XML parts. By default is true (to optimize the memory consumation)
* **ignoreError** : To NOT emit error event when an XML Error was met . By default is false.

### parseString(string, encoding)
Split XML within a string

### parseStream(stream)
Split XML within a stream


## Events

### data
Emits three elements on each slice: the data node (object), the node's tag name (string), and the node's path (string). For example:

````
var xs = new XMLSplitter('//(item|unit)')
xs.on('data', function (node, tag, path) {
    console.log(node);
    console.log(tag);
    console.log(path);
})
xs.parseString('<record><item><value>X</value></item><unit><value>Y</value></unit></record>')
````
Output:

````
{ value: { '$t': 'X' } }
item
/record/item
{ value: { '$t': 'Y' } }
unit
/record/unit
````

### close
Emit if the stream emit the close event OR if the stream is destroyed

### end
Emit on the end of the XML parsing

### error
Emit when something bad happened


## XPath's operators

The XPath standard is not supported, only basic paths (included namespaces) and fews operotors is implemented :

* / : /record, /record/item
* // : //para, /root//item
* \* : /root/\*/item, /root/item/\*
* | : /(record|item), /root/(item|unit)

I do not think I will implement more operators.

# Also

* https://github.com/jahewson/node-big-xml
* https://github.com/DamonOehlman/xmlslicer

# License

[MIT/X11](./LICENSE)


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/touv/node-xml-splitter/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

