'use strict';
var sax = require('sax'),
    fs = require('fs'),
    util = require('util'),
    events = require('events')
;
function within(arr1, arr2) {
  for (var i = 0; i < arr1.length; i++)  {
    if (arr1.indexOf(i) !== arr2.indexOf(i)) {
      return false
    }
  }
  return true
}

function string2path(s)
{
  if (typeof s === 'string') {
    var k = {}
    k.v = s.toLowerCase()
    k.a = k.v.split('/')
    if (k.a[0] === '')  {
      k.a.shift()
    }
    return k
  }
}


function XMLSplitter(knife) {

  if (!(this instanceof XMLSplitter)) {
    return new XMLSplitter()
  }

  events.EventEmitter.call(this)


  var self = this
  var tagname = 'row'

  // Propreties
  self.result   = {}
  self.stack    = []
  self.path     = []
  self.cdata    = ''
  self.knifes   = []
  self.counter  = 0
  self.tracker  = false
  self.stream   = require("sax").createStream(true, {trim:true})

  // Polymoprphisme
  if (Array.isArray(knife)) {
    knife.forEach(function (item) {
        self.knifes.push(string2path(item))
      }
    )
  }
  else {
    self.knifes.push(string2path(knife))
  }
  if (self.knifes.length === 0) {
    throw new Error('Invalid Parameter')
  }



  // Sax's handles
  self.stream.onerror = function (e) {
    // an error happened.
  }
  self.stream.onprocessinginstruction = function (pi) {
  }
  self.stream.ontext = function (v) {
    if (self.tracker === false) {
      return
    }
    self.cvalue('$t', v)
  }
  self.stream.oncomment = function (v) {
    if (self.tracker === false) {
      return
    }
    self.cvalue('$c', v)
  }
  self.stream.oncdata = function (v) {
    if (self.tracker === false) {
      return
    }
    self.cdata += v
  }
  self.stream.onopencdata = function () {
    if (self.tracker === false) {
      return
    }
    self.cdata = ''
  }
  self.stream.onclosecdata = function () {
    if (self.tracker === false) {
      return
    }
    self.cvalue('$cd', self.cdata)
    self.cdata = ''
  }
  self.stream.onopentag = function (node) {
    self.path.push(node.name.toLowerCase())


    // Find a path
    var t1 = self.knifes.reduce(function (prev, cur) { return (prev === true || self.path.length >= cur.a.length) }, false)
    var t2 = self.knifes.reduce(function (prev, cur) { return (prev === true || within(cur, self.path)) }, false)
    
    if (t1 === false || t2 === false) {
      self.tracker = false
      return
    }

    self.tracker = true

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
    var p = self.path.reduce(function (prev, cur) { return prev + '/' + cur  }, '')

    if (self.knifes.some(function checkPath(x) { return (x.v === p) })) {
      self.emit('data', l, tag.replace(':', '$'), p)
      self.counter++
      self.stack = [{}]
    }
    self.path.pop()
    if (self.path.length === 0) {
      self.emit('end', self.counter)
    }
  }
  self.stream.onready = function () {
    var l = self.stack.pop() 
  }
  self.stream.onend = function () {
  }
}
util.inherits(XMLSplitter, events.EventEmitter)

XMLSplitter.prototype.parseString = function (string, encoding) {
  var self = this
  self.stream.end(string, encoding || 'utf8')
}

XMLSplitter.prototype.parseStream = function (stream) {
  var self = this;
  stream.pipe(self.stream);
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
