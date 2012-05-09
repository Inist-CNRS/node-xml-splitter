'use strict';
var sax = require('sax'),
    fs = require('fs'),
    util = require('util'),
    events = require('events')
//    ,debug = require('debug')('XS')
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
    var k = {}, pattern
    k.xpath = s.toLowerCase()
    pattern = '^'
    k.xpath.split('/').forEach(function(item, indice) {
        if (indice === 0) return
        if (item === '') {
          pattern += '.*'
        }
        else if (item === '*') {
          pattern += '/' + '[^/]+'
        }
        else {
          pattern += '/' + item
        }
    })
    pattern += '$'
    k.regex = new RegExp(pattern)
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
  self.stack    = []
  self.path     = []
  self.cdata    = ''
  self.knifes   = []
  self.counter  = 0
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
  //  console.log(self.knifes)


  // Sax's handles
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
    self.path.push(node.name.toLowerCase())

    var p = '/'+self.path.join('/')

    if (self.stack.length === 1 && node.name === tagname) {
      self.stack.push({});
    }
    else {
      self.stack.push(self.cvalue(node.name, self.cattr(node.attributes)))
    }

  }
  self.stream.onclosetag = function (tag) {
    var p = '/' + self.path.join('/')
    var l = self.stack.pop()
    var n = tag.replace(':', '$')

    var t2 = self.knifes.reduce(function (prev, cur) { 
        return (prev === true || cur.regex.test(p)) 
      }, false)

    if (t2) {
//      debug('='+p, n, util.inspect(l, false, null, true))
      self.emit('data', l, n, p)
      for (var prop in l) { if (l.hasOwnProperty(prop)) { delete l[prop] } }
      self.counter++
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
