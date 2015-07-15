var inits = require('../');
var memdb = require('memdb');
var hyperlog = require('hyperlog');
var test = require('tape');
var through = require('through2');

function fields (row) {
    return {
        change: row.change,
        key: row.key,
        seq: row.seq,
        value: row.value,
        links: row.links
    };
}

var expected = [
    {
        change: 1,
        key: 'c4eff94629f079b1f6d20b29682c05ce7d8c29a7562c34bc1f67e4579f3d7a77',
        seq: 1,
        value: { x: 5 },
        links: []
    },
    {
        change: 2,
        key: '10de19234e539776bd2574a6e027411fbfbd0137ea9cdb3c1adf7ae039b51c06',
        seq: 2,
        value: { n: 3 },
        links: []
    }
];

test('fork opts', function (t) {
    var idb = memdb({ valueEncoding: 'json' });
    var log = hyperlog(memdb(), { valueEncoding: 'json' });
    
    var histories = [
        [[{x:5}],[{x:6},{x:4}],[{x:10}]],
        [[{n:3}],[{n:4}],[{n:100},{n:101}]]
    ];
    t.plan(4 + 4 + 2);
    
    var pending = 0;
    histories.forEach(function (docs) {
        pending ++;
        (function next (prev) {
            if (docs.length === 0) return done();
            var p = 0;
            docs.shift().forEach(function (d) {
                p ++;
                log.add(prev, d, function (err, node) {
                    t.ifError(err);
                    if (--p === 0) next(node.key);
                });
            });
        })(null);
    });
    
    function done () {
        if (-- pending !== 0) return;
        var r = inits(log);
        r.pipe(through.obj(function (row, enc, next) {
            t.deepEqual(fields(row), expected.shift());
            next();
        }));
    }
});
