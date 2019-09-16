#!/usr/bin/env node

const 	prompt	   	= require('prompt'),
		fs 			= require('fs');

prompt.start();
prompt.get({
	"properties": {
		"file": {
			"description": "where the file is located you want to color",
			"default": "test.txt",
			"required": true
		}
	}
}, function (err, result) {
	if (err) throw err;
	var filename = result.file

	var file_arr = filename.split('.');
	var ext = file_arr.splice(file_arr.length - 1, 1)[0];
	var name = file_arr.join('.');

	fs.readFile(filename, 'utf8', function(err, data) {
		if (err) throw err;
		format("&b&cyanOK: " + filename);

		if(filename !== 'test.txt')
		{
			format("&b&limePlease note: the colors you see below are an approximation.");
			format("&i&pinkDifferent IRC clients display colors differently. (as do different terminals.");
		}
	
		console.log('\x1b[0m', '------------------ START FILE ------------------ ');

		var lines = data.split(/\r?\n/);
		var new_data = lines.map(format)

		fs.writeFile(name + '_c0lor.txt', new_data, function(err, data) {
			if (err) throw err;
			console.log('\x1b[0m', '------------------ END FILE ------------------ ');
			format("&b&cyanSAVED: " + name + '_c0lor.txt');
		});
	});
});

var cobj = {
	'\u00030':  { match: ['0', 'white'], term: '\x1b[37m' },
	'\u00031':  { match: ['1', 'black'], term: '\x1b[30m' },
	'\u00032':  { match: ['2', 'navy', 'darkblue'], term: '\x1b[34m' },
	'\u00033':  { match: ['3', 'green', 'darkgreen', 'forest'], term: '\x1b[32m' },
	'\u00034':  { match: ['4', 'red'], term: '\x1b[91m' },
	'\u00035':  { match: ['5', 'brown', 'maroon', 'darkred'], term: '\x1b[31m' },
	'\u00036':  { match: ['6', 'purple', 'violet'], term: '\x1b[35m' },
	'\u00037':  { match: ['7', 'olive', 'orange'], term: '\x1b[33m' },
	'\u00038':  { match: ['8', 'yellow'], term: '\x1b[93m' },
	'\u00039':  { match: ['9', 'lightgreen', 'lime'], term: '\x1b[92m' },
	'\u000310': { match: ['10', 'teal'], term: '\x1b[36m' },
	'\u000311': { match: ['11', 'cyan', 'aqua'], term: '\x1b[96m' },
	'\u000312': { match: ['12', 'blue', 'royal'], term: '\x1b[94m' },
	'\u000313': { match: ['13', 'pink', 'lightpurple', 'fuchsia'], term: '\x1b[35m' },
	'\u000314': { match: ['14', 'gray', 'grey'], term: '\x1b[90m' },
	'\u000315': { match: ['15', 'lightgray', 'lightgrey', 'silver'], term: '\x1b[37m' },
	'\u001f':   { match: ['underline', 'u'], term: '\x1b[4m' },
	'\u0016':   { match: ['italic', 'i'], term: '\x1b[3m' },
	'\u0002':   { match: ['bold', 'b'], term: '\x1b[1m' },
	'\u000f':   { match: ['reset', 'r'], term: '\x1b[0m' }
};
var cobj_keys = Object.keys(cobj);

var format = function(str){
	

	var col_count = 0;
	var console_str = str;
	for(var c = cobj_keys.length - 1; c >= 0; c--) 
	{ 
		var cid = cobj_keys[c];
		for(var i = 0; i < cobj[cid].match.length; i++) 
		{
			var reg_col = new RegExp('&' + cobj[cid].match[i], 'g');
			if(str.match(reg_col) !== null)
			{
				col_count++;
				str = str.replace(reg_col, cid);

				var reg_con = new RegExp('&' + cobj[cid].match[i], 'g');
				console_str = console_str.replace(reg_con, cobj[cid].term)
			}
		}
	}

	console_str += (col_count > 0 ? '\x1b[0m' : '');
	console.log(console_str);

	return str + (col_count > 0 ? '\u000f' : '') + '\n';
}