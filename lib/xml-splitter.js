'use strict';
var sax = require('sax'),
    fs = require('fs'),
    util = require('util'),
    events = require('events')
;

function XMLSplitter(options) {

	if (!(this instanceof XMLSplitter)) {
		return new XMLSplitter()
	}

	events.EventEmitter.call(this)


  var self = this
  var tagname =  'row'

  self.result = {}
  self.stack = []
  self.cdata = ''

  self.stream = require("sax").createStream(false, {})

  self.stream.onerror = function (e) {
    // an error happened.
  }
  self.stream.onprocessinginstruction = function (pi) {
  }
  self.stream.ontext = function (v) {
    self.cvalue('$t', v)
  }
  self.stream.oncomment = function (v) {
    self.cvalue('$c', v)
  }
  self.stream.oncdata = function (v) {
    self.cdata += v
  }
  self.stream.onopencdata = function () {
    self.cdata = ''
  }
  self.stream.onclosecdata = function () {
    self.cvalue('$cd', self.cdata)
    self.cdata = ''
  }
  self.stream.onopentag = function (node) {
    if (self.stack.length === 1 && node.name === tagname) {
      self.result = self.cattr(node.attributes);
      self.stack.push(this.result);
    }
    else {
      self.stack.push(self.cvalue(node.name, self.cattr(node.attributes)))
    }
  }
  self.stream.onclosetag = function (tag) {
	  var l = self.stack.pop()
	  console.log('CLOSE', tag, l, util.inspect(self.stack, false, null, true))
  if (tag === 'TRUC') self.stack = [{}]
  }
  self.stream.onready = function () {
    var l = self.stack.pop() 
    self.emit('slice', l)
  }
  self.stream.onend = function () {
  }
}
util.inherits(XMLSplitter, events.EventEmitter)

XMLSplitter.prototype.parse = function (string, encoding) {
  var self = this
  self.stream.end(string, encoding || 'utf8')
}

XMLSplitter.prototype.cvalue = function (n, v) {
  var self = this
  n = n.replace(':', '$')
  var o = self.stack[self.stack.length - 1]
  if (o == undefined) {
    o = {}
    o[n] = v
    return o[n]
  }
  else if (o[n] == undefined) {
    o[n] = v
    return o[n]
  }
  else if (!Array.isArray(o[n])) {
    var x = o[n]
    o[n] = new Array(x, v)
    return o[n][1]
  }
  else {
    var i = o[n].push(v)
    return o[n][i - 1]
  }
}

XMLSplitter.prototype.cattr = function (o) {
  var self = this
  var r = {};
  for (var key in o) {
    if (o.hasOwnProperty(key) && o[key]) {
      r[key.replace(':', '$')] = o[key];
    }
  }
  return r;
}

module.exports = XMLSplitter
