'use strict';
var XMLSplitter = require('../')

exports.setUp = function (callback) {
	callback()
}


exports.t01 = function (test) {
  var xs = new XMLSplitter('/record')
  xs.on('data', function (node) {
      test.equal(node['$t'], '1')
    }
  )
  xs.on('end', function (c) {
      test.equal(c, 1)
      test.done()
    }
  )
  xs.parseString('<Record>1</Record>')
}

exports.t02 = function (test) {
  var i = 0, xs = new XMLSplitter('//item')
  xs.on('data', function (node) {
      i++
      if (i === 1) {
        test.equal(node['$t'], '1')
      }
      else if (i == 2) {
        test.equal(node['$t'], '2')
      }
    }
  )
  xs.on('end', function (c) {
      test.equal(c, 2)
      test.done()
    }
  )
  xs.parseString('<record><item>1</item><item>2</item></record>')
}

exports.t03 = function (test) {
  var i = 0, xs = new XMLSplitter('//item')
  xs.on('data', function (node) {
      i++
      if (i === 1) {
        test.equal(node['value']['$t'], 'X')
      }
      else if (i == 2) {
        test.equal(node['value']['$t'], 'Y')
      }
    }
  )
  xs.on('end', function (c) {
      test.equal(c, 2)
      test.done()
    }
  )
  xs.parseString('<record><item><value>X</value></item><item><value>Y</value></item></record>')
}

exports.t04 = function (test) {
  var i = 0, xs = new XMLSplitter('//item', { regular: false })
  xs.on('data', function (node, path, name) {
      i++
      test.notEqual(typeof node, 'undefined');
      if (i === 1) {
        test.equal(node['value'], '1')
      }
      else if (i == 2) {
        test.equal(node['value'], '3')
      }
      else if (i == 3) {
        test.equal(node['value'], '2')
      }
    }
  )
  xs.on('end', function (c) {
      test.equal(c, 3)
      test.done()
    }
  )
  xs.parseString('<record><item value="1">A</item><item value="2"><record><item value="3">B</item></record></item></record>')

}

exports.t05 = function (test) {
  var i = 0, xs = new XMLSplitter('//(item|unit)')
  xs.on('data', function (node, tag, path) {
      i++
      if (i === 1) {
        test.equal(node['value']['$t'], 'X')
        test.equal(tag, 'item')
        test.equal(path, '/record/item')
      }
      else if (i == 2) {
        test.equal(node['value']['$t'], 'Y')
        test.equal(tag, 'unit')
        test.equal(path, '/record/unit')
      }
    }
  )
  xs.on('end', function (c) {
      test.equal(c, 2)
      test.done()
    }
  )
  xs.parseString('<record><item><value>X</value></item><unit><value>Y</value></unit></record>')
}

