var inits = require('../');
var memdb = require('memdb');
var hyperlog = require('hyperlog');
var through = require('through2');
var test = require('tape');

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

test('live', function (t) {
    var idb = memdb({ valueEncoding: 'json' });
    var log = hyperlog(memdb(), { valueEncoding: 'json' });
    
    var histories = [
        [[{x:5}],[{x:6},{x:4}],[{x:10}]],
        [[{n:3}],[{n:4}],[{n:100},{n:101}]]
    ];
    t.plan(16 + 2);
    
    var r = inits(log, { live: true });
    r.pipe(through.obj(write));
    
    var exch = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
    r.on('change', function (ch) {
        t.equal(ch, exch.shift());
    });
    r.on('last', t.fail.bind(t));
    
    function write (row, enc, next) {
        t.deepEqual(fields(row), expected.shift());
        next();
    }
    
    histories.forEach(function (docs) {
        (function next (prev) {
            var p = 0;
            if (docs.length === 0) return;
            docs.shift().forEach(function (d) {
                p ++;
                log.add(prev, d, function (err, node) {
                    t.ifError(err);
                    if (--p === 0) next(node.key);
                });
            });
        })(null);
    });
});
