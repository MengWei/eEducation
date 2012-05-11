var fs = require('fs'),
	util = require('util'),
	cwd = process.cwd() + '/',
	INFO = 0,
	DEBUG = 1,
	WARNING = 2,
	ERROR = 3,
	TRACE = 4,
	INIT = 6,
	type = ['INFO', 'DEBUG', 'WARNING', 'ERROR', 'TRACE', '', 'LOG_INIT'],
	colors = [38, 34, 35, 31, 32, 36, 33];

exports.INFO = INFO;
exports.DEBUG = DEBUG;
exports.WARNING = WARNING;
exports.ERROR = ERROR;
exports.TRACE = TRACE;

var posRegExp = [/^    at .+$/mg, /^.*?\(?(\/.+?:\d+).*$/];
var getPos = function (fix) {
	fix = fix ? fix : 0;
	try {
		throw new Error();
	} catch(e) {
		return e.stack.match(posRegExp[0])[3+fix].replace(posRegExp[1], '$1').replace(cwd, '');
	}
}

var pad2 = function (num) {
	return num > 9 ? num : '0' + num;
}

var getTime = function () {
	var t = new Date();
	return [t.getFullYear(), '-', pad2(t.getMonth() + 1) , '-', pad2(t.getDate()), ' ',
		pad2(t.getHours()), ':', pad2(t.getMinutes()), ':', pad2(t.getSeconds())].join('');
}

var formatRegExp = /%[sdj]/g;


var head = '\x1B[', foot = '\x1B[0m';
var formatLog = function (log, color) {
	var tag = '';
	if (color) {
		tag = colors[5]+'m';
		color = colors[log.type]+'m';
	}
	var msg = util.format.apply(this, log.msg);
	return [log.time, ' [', head, color, type[log.type], foot, '] [', head, tag, log.pos, foot, '] ', msg, "\r\n"].join('');
}
var argsToArray = function (args) {
	var arr = [];
	for (var i = 0; i < args.length; i++) {
		arr[i] = args[i];
	}
	return arr;
}

var Log = function(level, options) {
	this.level = level ? level : INFO;
	options = options ? options : {};
	this.file = options.file;

	if (this.file) {
		this.stream = fs.createWriteStream(this.file, {
			flags: 'a',
			encoding: null,
			mode: 0666
		});
		var self = this;
		process.on('exit', function(){
			self.stream.end();
		})
	}
	process.stdout.write(formatLog({
		type: INIT,
		pos: getPos(),
		time: getTime(),
		msg: ['LOG_INIT level: %s; file: "%s".', type[this.level], this.file ? this.file : '']
	}, true));
}
Log.prototype.log = function (type, msg) {
	if (type < this.level){
		return;
	}
	var log = {type:type, msg:msg, time:getTime(), pos:getPos()};
	process.stdout.write(formatLog(log, true));
	this.stream && this.stream.write(formatLog(log));
}

exports.create = function(level, options){
	if (typeof(level) == "string") {
		level = type[level];
	}
	var l = new Log(level, options);
	return {
		level : l.level,
		file : l.file,
		info : function(msg) {
			l.log(INFO, arguments);
		},
		debug : function(msg) {
			l.log(DEBUG, arguments);
		},
		warning : function(msg) {
			l.log(WARNING, arguments);
		},
		warn : function(msg) {
			l.log(WARNING, arguments);
		},
		error : function(msg) {
			l.log(ERROR, arguments);
		},
		trace : function(msg) {
			l.log(TRACE, arguments);
		}
	}
}
