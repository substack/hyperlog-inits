var through = require('through2'); 
var pump = require('pump');
var readonly = require('read-only-stream');
var once = require('once');

module.exports = function (log, opts, cb) {
    if (!opts) opts = {};
    if (typeof opts === 'function') {
        cb = opts;
        opts = {};
    }
    var inits = cb ? [] : null;
    cb = once(cb || noop);
    
    var r = log.createReadStream(opts)
    var last = -1;
    var tr = through.obj(write, end);
    var ro = readonly(tr);
    pump(r, tr);
    r.once('error', cb);
    return ro;
    
    function write (row, enc, next) {
        last = row.change;
        if (row.links && row.links.length === 0) {
            if (inits) inits.push(row);
            this.push(row);
        }
        next();
    }
    function end () {
        ro.emit('last', last);
        cb(null, inits, last);
    }
};

function noop () {}
