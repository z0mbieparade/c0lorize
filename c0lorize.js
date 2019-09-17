#!/usr/bin/env node

const 	prompt	   	= require('prompt'),
		fs 			= require('fs');

let 	reset = true,
		search = {},
		fg_arr = [],
		bg_arr = [],
		style_arr = [];

let colors = [
	{ unicode: '\u00030',  irc: '00', term: 37, match: ['0', 'white'] },
	{ unicode: '\u00031',  irc: '01', term: 30, match: ['1', 'black'] },
	{ unicode: '\u00032',  irc: '02', term: 34, match: ['2', 'navy', 'darkblue'] },
	{ unicode: '\u00033',  irc: '03', term: 32, match: ['3', 'green', 'darkgreen', 'forest'] },
	{ unicode: '\u00034',  irc: '04', term: 91, match: ['4', 'red'] },
	{ unicode: '\u00035',  irc: '05', term: 31, match: ['5', 'brown', 'maroon', 'darkred'] },
	{ unicode: '\u00036',  irc: '06', term: 35, match: ['6', 'purple', 'violet'] },
	{ unicode: '\u00037',  irc: '07', term: 33, match: ['7', 'olive', 'orange'] },
	{ unicode: '\u00038',  irc: '08', term: 93, match: ['8', 'yellow'] },
	{ unicode: '\u00039',  irc: '09', term: 92, match: ['9', 'lightgreen', 'lime'] },
	{ unicode: '\u000310', irc: '10', term: 36, match: ['10', 'teal'] },
	{ unicode: '\u000311', irc: '11', term: 96, match: ['11', 'cyan', 'aqua'] },
	{ unicode: '\u000312', irc: '12', term: 94, match: ['12', 'blue', 'royal'] },
	{ unicode: '\u000313', irc: '13', term: 95, match: ['13', 'pink', 'lightpurple', 'fuchsia'] },
	{ unicode: '\u000314', irc: '14', term: 90, match: ['14', 'gray', 'grey'] },
	{ unicode: '\u000315', irc: '15', term: 37, match: ['15', 'lightgray', 'lightgrey', 'silver'] }
].reverse();

let styles = [
	{ unicode: '\u001f', term: 4, match: ['underline', 'u'] },
	{ unicode: '\u0016', term: 3, match: ['italic', 'i'] },
	{ unicode: '\u0002', term: 1, match: ['bold', 'b'] },
	{ unicode: '\u000f', term: 0, match: ['reset', 'r'] }
]

colors.forEach(function(c, i)
{
	fg_arr.push(c.match.join('|&'));
	bg_arr.push(c.match.join('|&bg'));
	c.match.forEach(function(m)
	{
		search['&' + m] = { unicode: c.unicode, irc: c.irc, esc: '\x1b[' + c.term + 'm', type: 'fg'}
		search['&bg' + m] = { unicode: c.unicode, irc: c.irc, esc: '\x1b[' + (c.term + 10)  + 'm', type: 'bg'}
	})
})

styles.forEach(function(s, i)
{
	style_arr.push(s.match.join('|&'));
	s.match.forEach(function(m)
	{
		search['&' + m] = { unicode: s.unicode, esc: '\x1b[' + s.term + 'm', type: 'style' };
	})
})

let format_str = fg_arr.join('|&') + '|&bg' + bg_arr.join('|&bg') + '|&' + style_arr.join('|&');
let format_regex = new RegExp('(&' + format_str + ')(?=.)*', 'g')

prompt.start();
prompt.get({
	"properties": {
		"file": {
			"description": "where the file is located you want to color",
			"default": "test.txt",
			"required": true
		},
		"reset": {
			"description": "add a reset at the end of every line with colors or style",
			"default": true,
			"type": "boolean",
			"required": true
		}
	}
}, function (err, result) {
	if (err) throw err;

	let filename = result.file;
		reset = result.reset;

	let file_arr = filename.split('.');
	let ext = file_arr.splice(file_arr.length - 1, 1)[0];
	let name = file_arr.join('.');

	fs.readFile(filename, 'utf8', function(err, data) {
		if (err) throw err;
		split("&b&cyanOK: " + filename);

		if(filename !== 'test.txt')
		{
			split("&b&9Please note: the colors you see below are an approximation.");
			split("&9Different IRC clients display colors differently. (as do different terminals.");
		}
	
		split('&r  ------------------ START FILE ------------------');

		var lines = data.split(/\r?\n/);
		var new_data = lines.map(split).join('');

		fs.writeFile(name + '_c0lor.txt', new_data, function(err, data) {
			if (err) throw err;
			split('&r  ------------------ END FILE ------------------');
			split("&b&cyanSAVED: " + name + '_c0lor.txt&r');
		});
	});
});


let current_style = {fg: null, bg: null},
	since_last_fg = null;

var split = function(str, line)
{
	if(!str)
	{
		console.log(str);
		return '\n';
	}

	if(reset)
	{
		current_style = {fg: null, bg: null};
		since_last_fg = null;
	}

	let txt_str = '',
		con_str = '';

	let str_split = str.split(format_regex).forEach(function(x)
	{
		if(x)
		{
			if(x.match(/^&/) && search[x])
			{
				if(search[x].type === 'fg')
				{
					since_last_fg = 0;
					current_style.fg = search[x];

					txt_str += search[x].unicode;
					con_str += search[x].esc;
				}
				else if(search[x].type === 'bg')
				{
					current_style.bg = search[x];
					if(since_last_fg !== null) since_last_fg++;

					if(since_last_fg === 1)
					{
						txt_str += ',' + search[x].irc;
						con_str += search[x].esc;
					}
					else if(current_style.fg !== null)
					{
						txt_str += current_style.fg.unicode + ',' + search[x].irc;
						con_str += search[x].esc;
					}
					else
					{
						txt_str += '\u00031,' + search[x].irc;
						con_str += '\x1b[30m' + search[x].esc;
					}
				}
				else
				{
					if(since_last_fg !== null) since_last_fg++;

					txt_str += search[x].unicode;
					con_str += search[x].esc;
				}
			}
			else
			{
				if(since_last_fg !== null) since_last_fg++;

				txt_str += x;
				con_str += x;
			}
		}
	})

	if(reset && (current_style.fg !== null || current_style.bg !== null))
	{
		txt_str += '\u000f';
		con_str += '\x1b[0m';
	}

	txt_str += '\n';

	console.log(con_str);
	return txt_str;
}