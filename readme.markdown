# hyperlog-inits

list the inits (originating documents) in a hyperlog feed

Think of an init is like the first commit after you do `git init`, but for
hyperlog feeds.

# example

``` js
var inits = require('hyperlog-inits');
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
```

output:

```
init= { change: 1,
  key: '7d1afe2dab0e5f96bb47cfb16a4a83beaa9ee440819baf80408d55fae4819dc6',
  log: 'cic42duir00001mdn13icnjau',
  seq: 1,
  value: [ { x: 5 } ],
  links: [] }
init= { change: 2,
  key: '5e543bc5e04a7db261dd797863bfc8d1a31d53531c35663b38417402713409d5',
  log: 'cic42duir00001mdn13icnjau',
  seq: 2,
  value: [ { n: 3 } ],
  links: [] }
```

# api

``` js
var inits = require('hyperlog-inits')
```

## var r = inits(log, opts={}, cb)

Return a readable object stream `r` of originating documents that have no links
from a hyperlog `log` instance.

If given, `cb(err, idocs, last)` fires with an array of originating documents,
`idocs` and the integer sequence of the last change, `last`.

The options `opts` are passed through directly to `log.createReadStream()`:

* `opts.live` - when `true`, keep the change log open. default: false
* `opts.since` - return changes after this sequence number. default: -1

## r.on('change', function (ch) {})

Every document read from the change stream generates a `'change'` event with the
sequence number `ch`.

## r.on('last', function (ch) {})

The last change at the end of a non-live change stream emits a change event
`'last'` with the sequence number `ch`.

# install

With [npm](https://npmjs.com) do:

```
npm install hyperlog-inits
```

# license

MIT
