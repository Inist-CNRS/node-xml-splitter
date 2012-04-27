var XMLSplitter = require('../');
exports['setUp'] = function (callback) {
	this.xs = new XMLSplitter;
	callback();
};
exports['t01'] = function (test) {

	this.xs.on('slice', function (node) {
			console.log(node)
			test.equal(node.$t, '1')
			test.done()
	})
	this.xs.parse('<record>1</record>')
}
