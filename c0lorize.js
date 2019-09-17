#!/usr/bin/env node

const 	prompt	   	= require('prompt'),
		fs 			= require('fs');

let 	filename = 'test.txt',
		reset = true,
		correct = true,
		html = false,
		open_tag_count 	= 0,
		search = {},
		fg_arr = [],
		bg_arr = [],
		style_arr = [],
		html_style = {
			'body': { 'font-family': 'monospace', 'white-space': 'pre', 'font-size': '14px', 'line-height': '16px' },
			'.b': { 'font-weight': 'bold' },
			'.i': { 'font-style': 'italic' },
			'.u': { 'text-decoration': 'underline' },
			'.r': { 'color': 'initial', 'background-color': 'initial','font-weight': 'normal', 'font-style': 'initial', 'text-decoration': 'none' } 
		},
		style_str = '';

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
	{ unicode: '\u00039',  irc: '09', term: 92, match: ['9', 'lime', 'lightgreen'] },
	{ unicode: '\u000310', irc: '10', term: 36, match: ['10', 'teal'] },
	{ unicode: '\u000311', irc: '11', term: 96, match: ['11', 'cyan', 'aqua'] },
	{ unicode: '\u000312', irc: '12', term: 94, match: ['12', 'blue', 'royal'] },
	{ unicode: '\u000313', irc: '13', term: 95, match: ['13', 'fuchsia', 'pink', 'lightpurple'] },
	{ unicode: '\u000314', irc: '14', term: 90, match: ['14', 'gray', 'grey'] },
	{ unicode: '\u000315', irc: '15', term: 37, match: ['15', 'lightgray', 'lightgrey', 'silver'] }
].reverse();

let styles = [
	{ unicode: '\u001f', irc: 'u', term: 4, match: ['underline', 'u'] },
	{ unicode: '\u0016', irc: 'i',  term: 3, match: ['italic', 'i'] },
	{ unicode: '\u0002', irc: 'b',  term: 1, match: ['bold', 'b'] },
	{ unicode: '\u000f', irc: 'r',  term: 0, match: ['reset', 'r'] }
]

colors.forEach(function(c, i)
{
	fg_arr.push(c.match.join('|&'));
	bg_arr.push(c.match.join('|&bg'));

	html_style['.fg' + c.irc] = { 'color': c.match[1] };
	html_style['.bg' + c.irc] = { 'background-color': c.match[1] };

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
		search['&' + m] = { unicode: s.unicode, irc: s.irc, esc: '\x1b[' + s.term + 'm', type: 'style' };
	})
})

for(var key in html_style)
{
	style_str += key + '{';

	for(var attr in html_style[key])
	{
		style_str += attr + ': ' + html_style[key][attr] + ';'
	}

	style_str += '}\n';
}

let format_str = fg_arr.join('|&') + '|&bg' + bg_arr.join('|&bg') + '|&' + style_arr.join('|&');
let format_regex = new RegExp('(&' + format_str + ')(?=.)*', 'g')

if(process.argv && process.argv.length > 2)
{
	filename = process.argv[2];
	reset = process.argv[3] === undefined ? true : (process.argv[3] === 'false' ? false : true);
	correct = process.argv[4] === undefined ? true : (process.argv[4] === 'false' ? false : true);
	html = process.argv[5] === undefined ? false : (process.argv[5] === 'true' ? true : false);
}

var init = function()
{
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

		var txt_data = '';
		var html_data = '<!DOCTYPE html>\n<head>\n<meta http-equiv="Content-Type" content="text/html; charset=utf-8">\n';
			html_data += '<style>' + style_str + '</style>\n<title>' + name + '</title>\n</head>\n<body>\n';

		open_tag_count = 0;
		data.split(/\r?\n/).forEach(function(str, line)
		{
			var formated = split(str, line);

			txt_data += formated.txt;

			if(html)
			{
				html_data += formated.html;
			}
		});

		if(!reset)
		{
			for(var i = 0; i < open_tag_count; i++)
			{
				html_data += '</span>';
			}
			open_tag_count = 0;
		}

		html_data += '</body>\n</html>';

		write_txt(name, txt_data, function(){
			split('&r  ------------------ END FILE ------------------');
			split("&b&cyanSAVED: " + name + '_c0lor.txt&r');

			if(html)
			{
				write_html(name, html_data, function()
				{
					split("&b&cyanSAVED: " + name + '_c0lor.html&r');
				})
			}
		})
	});
}

var write_txt = function(name, data, callback)
{
	fs.writeFile(name + '_c0lor.txt', data, function(err, data) {
		if (err) throw err;
		callback();
	});
}

var write_html = function(name, data, callback)
{
	fs.writeFile(name + '_c0lor.html', data, function(err, data) {
		if (err) throw err;
		callback();
	});
}

 //we need to track the last fg color, because unicode can't do a bg color without one.
let current_style 	= {fg: null, bg: null},
	since_last_fg 	= null;

var split = function(str, line)
{
	if(!str)
	{
		console.log(str);
		return {txt: '\n', html: '<br />\n'};
	}

	if(reset)
	{
		current_style = {fg: null, bg: null};
		since_last_fg = null;
	}

	let txt_str = '',
		html_str = '',
		con_str = '';

	str.split(format_regex).forEach(function(x)
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
					html_str += '<span class="fg' + search[x].irc + '">';
					open_tag_count++;
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

					html_str += '<span class="bg' + search[x].irc + '">';
					open_tag_count++;
				}
				else
				{
					if(since_last_fg !== null) since_last_fg++;

					txt_str += search[x].unicode;
					con_str += search[x].esc;
					html_str += '<span class="' + search[x].irc + '">';
					open_tag_count++;
				}
			}
			else
			{
				if(since_last_fg !== null) since_last_fg++;

				txt_str += x;
				con_str += x;
				html_str += x;
			}
		}
	})

	if(correct)
	{
		txt_str = txt_str.replace(/\\/g,'\\\\');
	}

	if(reset && (current_style.fg !== null || current_style.bg !== null))
	{
		txt_str += '\u000f';
		con_str += '\x1b[0m';

		for(var i = 0; i < open_tag_count; i++)
		{
			html_str += '</span>';
		}
	}

	txt_str += '\n';
	html_str += '<br />\n';

	console.log(con_str);
	return {txt: txt_str, html: html_str};
}

if(process.argv.length < 6) //skip prompt if args are in cmd line
{
	prompt.start();
	prompt.get({
		"properties": {
			"file": {
				"description": "where the file is located you want to color",
				"default": filename,
				"required": true
			},
			"reset": {
				"description": "add a reset at the end of every line with colors or style",
				"default": reset,
				"type": "boolean",
				"required": true
			},
			"correct": {
				"description": "some irc clients ignore double slashes \\\\ attempt to correct?",
				"default": correct,
				"type": "boolean",
				"required": true
			},
			"html": {
				"description": "would you like to generate HTML also?",
				"default": html,
				"type": "boolean",
				"required": true
			}
		}
	}, function (err, result) {
		if (err) throw err;

		filename 	= result.file,
		reset 		= result.reset,
		correct 	= result.correct,
		html 		= result.html;

		init();
	});
}
else
{
	init();
}