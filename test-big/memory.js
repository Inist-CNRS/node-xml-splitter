var util = require('util');
var fs = require('fs');
var XMLSplitter = require('../')
var datafile = '/tmp/bigxmlsplitter';

exports.setUp = function (callback) {
  var data = '';
  data += '<Root>';
  for (i = 0; i < 1000000; i++) {
    data += '<Record>' + i + '</Record>';
  }
  data += '</Root>';  
  fs.writeFileSync(datafile, data);
  
  // try to free memory
  data = null;
  
  callback();
}

exports.t01 = function (test) {
  var xs = new XMLSplitter('//record', { regular: true });
  var i = 0;
  var mem_delta = 0;
  var mem_last  = process.memoryUsage().heapUsed/1024/1024;
  xs.on('data', function (node) {
      if ((i % 100000) == 0) {
        mem_delta = process.memoryUsage().heapUsed/1024/1024 - mem_last;
        mem_last  = process.memoryUsage().heapUsed/1024/1024;
        console.log(mem_last + '\t' + mem_delta);
        if (i > 100000*3) {
          //test.equal(mem_delta < 15, true);
          //test.equal(mem_last  < 30, true);
        }
      }
      i++
    }
  );
  
  xs.on('end', function (c) {
      test.done()
    }
  );

  var readstream = fs.createReadStream(datafile/*, {start: 90, end: 99}*/);
  xs.parseStream(readstream);
}
