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
	if (err) { return onErr(err); }
	var filename = result.file

	var file_arr = filename.split('.');
	var ext = file_arr.splice(file_arr.length - 1, 1)[0];
	var name = file_arr.join('.');

	console.log(name, ext)


	fs.readFile(filename, 'utf8', function(err, data) {
		if (err) throw err;
		console.log('OK: ' + filename);
		

		var lines = data.split(/\r?\n/);
		var new_data = lines.map(format)

		console.log(new_data)

		fs.writeFile(name + '_c0lor.txt', new_data, function(err, data) {
			if (err) throw err;
			console.log('file saved: ' + name + '_c0lor.txt');
		});
	});
});

var format = function(str){
	var cobj = {
		'\u00030':  [ '0', 'white'],
		'\u00031':  [ '1', 'black'],
		'\u00032':  [ '2', 'navy', 'darkblue'],
		'\u00033':  [ '3', 'green', 'darkgreen', 'forest'],
		'\u00034':  [ '4', 'red'],
		'\u00035':  [ '5', 'brown', 'maroon', 'darkred'],
		'\u00036':  [ '6', 'purple', 'violet'],
		'\u00037':  [ '7', 'olive', 'orange'],
		'\u00038':  [ '8', 'yellow'],
		'\u00039':  [ '9', 'lightgreen', 'lime'],
		'\u000310': [ '10', 'teal'],
		'\u000311': [ '11', 'cyan', 'aqua'],
		'\u000312': [ '12', 'blue', 'royal'],
		'\u000313': [ '13', 'pink', 'lightpurple', 'fuchsia'],
		'\u000314': [ '14', 'gray', 'grey'],
		'\u000315': [ '15', 'lightgray', 'lightgrey', 'silver'],
		'\u001f':   ['underline', 'u'],
		'\u0016':   ['italic', 'i'],
		'\u0002':   ['bold', 'b'],
		'\u000f':   ['reset', 'r']
	};

	var col_count = 0;
	for(var cid in cobj){
		for(var i = 0; i < cobj[cid].length; i++){
			var reg_col = new RegExp('&' + cobj[cid][i], 'g');
			if(str.match(reg_col) !== null) col_count++;
			str = str.replace(reg_col, cid);
		}
	}

	return str + (col_count > 0 ? '\u000f' : '') + '\n';
}