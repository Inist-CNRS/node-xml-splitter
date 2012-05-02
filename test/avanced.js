var XMLSplitter = require('../')

exports.setUp = function (callback) {
	callback()
}


exports.t01 = function (test) {
  var xs = new XMLSplitter(['/record', '/item'])
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
  var i = 0, xs = new XMLSplitter(['/record/item1', '/record/item2'])
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
  xs.parseString('<record><item1>1</item1><item2>2</item2></record>')
}
