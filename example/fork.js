var inits = require('../');
var memdb = require('memdb');
var hyperlog = require('hyperlog');

var idb = memdb({ valueEncoding: 'json' });
var log = hyperlog(memdb(), { valueEncoding: 'json' });

var r = inits(log, { live: true });
r.on('data', function (row) {
    console.log('init=', row);
});

var histories = [
    [[{x:5}],[{x:6},{x:4}],{x:10}],
    [[{n:3}],[{n:4}],[{n:100},{n:101}]]
];

histories.forEach(function (docs) {
    (function next (prev) {
        if (docs.length === 0) return;
        log.add(prev, docs.shift(), function (err, node) {
            next(node.key);
        });
    })(null);
});
