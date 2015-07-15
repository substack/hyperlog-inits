var inits = require('../');
var memdb = require('memdb');
var hyperlog = require('hyperlog');

var idb = memdb({ valueEncoding: 'json' });
var log = hyperlog(memdb(), { valueEncoding: 'json' });

var histories = [
    [[{x:5}],[{x:6},{x:4}],{x:10}],
    [[{n:3}],[{n:4}],[{n:100},{n:101}]]
];

var pending = 1;
histories.forEach(function (docs) {
    pending ++;
    (function next (prev) {
        if (docs.length === 0) return done();
        log.add(prev, docs.shift(), function (err, node) {
            next(node.key);
        });
    })(null);
});
done();

function done () {
    if (-- pending !== 0) return;
    inits(log, function (err, inits, last) {
        inits.forEach(function (row) {
            console.log(row);
        });
    });
}
