'use strict';
var sax = require('sax'),
    fs = require('fs'),
    util = require('util'),
    events = require('events'),
    clone = require('clone')
//    ,debug = require('debug')('XS')
;


function dispose(o) {
  for (var p in o) {
    if (o.hasOwnProperty(p)) {
      if (isNaN(parseInt(p))) {
        dispose(o[p]);
      }
      delete o[p]
    }
  }
}
function wash(o) {
  for (var p in o) {
    if (o.hasOwnProperty(p)) {
      if (isNaN(parseInt(p))) {
        // wash(o[p], d - 1); A revoir ???
        throw new Error('Not implemented ...');
      }
      if (Object.keys(o[p]).length) {
        delete o[p]
      }
    }
  }
}





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
    k.xpath.split('/').forEach(function (item, indice) {
        if (indice === 0) {
          return
        }
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

function XMLSplitter(knife, opt) {

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
  self.track    = []
  self.stream   = require("sax").createStream(true, {trim : true})
  self.opt      = opt || {}
  self.regular  = (self.opt.regular === undefined ? true : (self.opt.regular === true))
  self.ignoreError = (self.opt.ignoreError === undefined ? false : (self.opt.ignoreError === true))

  // Adding this function, avoid this execption :
  //
  // stream.js:74
  //    dest.destroy();
  //         ^
  //TypeError: Object #<SAXStream> has no method 'destroy'
  //    at IncomingMessage.onclose (stream.js:74:10)
  //    at IncomingMessage.EventEmitter.emit (events.js:115:20)
  //    at abortIncoming (http.js:1641:11)
  //    at Socket.serverSocketCloseListener (http.js:1651:5)
  //    at Socket.EventEmitter.emit (events.js:115:20)
  //    at Socket._destroy.destroyed (net.js:358:10)
  //    at process.startup.processNextTick.process._tickCallback (node.js:244:9)
  self.stream.destroy = function() {
    self.emit('close',  new Error('The stream seem to be destroyed'))
  }



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

  // Stream's handle
  self.stream.on('close', function (e) {
      self.emit('close', e)
  })

  // Sax's handles
  self.stream.on('error', function (e) {
      this._parser.error = null
      this._parser.resume()
      if (!self.ignoreError) { 
        self.emit('error', e)
      }
    }
  )
  self.stream.on('processinginstruction', function (pi) {
  })
  self.stream.on('text', function (v) {
    self.cvalue('$t', v)
  })
  self.stream.on('comment', function (v) {
    self.cvalue('$c', v)
  })
  self.stream.on('cdata', function (v) {
    self.cdata += v
  })
  self.stream.on('opencdata', function () {
    self.cdata = ''
  })
  self.stream.on('closecdata', function () {
    self.cvalue('$cd', self.cdata)
    self.cdata = ''
  })
  self.stream.on('opentag', function (node) {
    self.path.push(node.name.toLowerCase())

    var p = '/' + self.path.join('/')

    self.track.push(self.knifes.reduce(function (prev, cur) {
          return (prev === true || cur.regex.test(p))
        }, false))

    // avoids memory inflation
    if (!self.track.some(function (x) { return x })) {
      self.stack.push({})
      return
    }

    if (self.stack.length === 1 && node.name === tagname) {
      self.stack.push({})
    }
    else {
      self.stack.push(self.cvalue(node.name, self.cattr(node.attributes)))
    }

  })
  self.stream.on('closetag', function (tag) {
    var p = '/' + self.path.join('/')
    var l = self.stack.pop()
    var n = tag.replace(':', '$')


    self.track.pop()
    var t2 = self.knifes.reduce(function (prev, cur) {
        return (prev === true || cur.regex.test(p))
      }, false)

    if (t2) {
      self.emit('data', clone(l, false), n, p)
      if (self.regular) {
        //      debug('1='+p, n, util.inspect(l, false, null, true))
        //      debug('2='+p, n, util.inspect(self.stack, false, null, true))
        //dispose(l)
        l = null
        wash(self.stack)
        //      debug('3='+p, n, util.inspect(self.stack, false, null, true))
        //      debug('4=', self.path.length)
      }
      self.counter++
    }
    self.path.pop()
    if (self.path.length === 0) {
      self.emit('end', self.counter)
    }
  })
  self.stream.on('ready', function () {
    self.stack.pop()
  })
  self.stream.on('end', function () {
      if (self.stack.length !== 0) {
        self.emit('end', self.counter)
      }
    }
  )
}
util.inherits(XMLSplitter, events.EventEmitter)

XMLSplitter.prototype.parseString = function (string, encoding) {
  var self = this
  self.stream.end(string, encoding || 'utf8')
}

XMLSplitter.prototype.parseStream = function (stream) {
  var self = this
  stream.pipe(self.stream)
}

XMLSplitter.prototype.cvalue = function (n, v) {
  var self = this
  n = n.replace(':', '$')
  var o = self.stack[self.stack.length - 1]
  if (o === undefined) {
    o = {}
    o[n] = v
    return o[n]
  }
  else if (o[n] === undefined) {
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
      delete o[key]
    }
  }
  return r;
}

module.exports = XMLSplitter
