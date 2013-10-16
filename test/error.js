var XMLSplitter = require('../')

exports.setUp = function (callback) {
  callback()
}


exports.t01 = function (test) {
  var xs = new XMLSplitter('/record/item')
  var er = false
  xs.on('error', function (e) {
      er = true
    }
  )
  xs.on('end', function (c) {
      test.equal(er , true)
      test.equal(c , 2)
      test.done()
  })
  xs.parseString('<Record><item>1</item><item>2</item><item</Record>')
}

exports.t02 = function (test) {
  var xs = new XMLSplitter('//item', {ignoreError : true})
  var er = false;
  xs.on('error', function(e) {
      er = true;
    }
  )
  xs.on('end', function (c) {
      test.equal(er , false)
      test.equal(c , 2)
      test.done()
  })
  xs.parseString('<Record><item>1</item><item>2</item>')
}
/* */

