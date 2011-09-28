const app = safari.application,
	  ext = safari.extension,
	  gbl = ext.globalPage.contentWindow;

window.addEventListener('keydown', function(e){ Pop.handleKeydown(e); }, false);
window.addEventListener('keypress', function(e){ Pop.handleKeypress(e); }, false);
window.addEventListener('popover', function(e){ Pop.popoverOpened(e); }, false);

var Pop = {

	popoverOpened: function(e){
		// Popover opened
	},
	
	handleKeydown: function(e){
		k = parseInt(e.keyIdentifier.replace('U+',''), 16);
	},
	
	handleKeypress: function(e){
		shortcut  = k;
		shortcut += e.shiftKey * 1000;
		shortcut += e.ctrlKey  * 10000;
		shortcut += e.altKey   * 100000;
		shortcut += e.metaKey  * 1000000;
		if (shortcut == ext.settings.shortcut) {
			safari.self.hide();
		} else if ($(e.target).is('#shortcut')) {
			setShortcut(shortcut);
			e.preventDefault();
			return false;
		} else if (safari.self.contentWindow.location.pathname.substr(-11) == 'search.html') {
			gbl.performKeyboard(shortcut, $('#keysearchField').val());
		}
		if (e.target.nodeName == "BODY") {
			e.preventDefault();
		}
	},
	
	transition: function(page, qString) {
		var url = ext.baseURI+page+'.html';
		switch(page) {
		case 'search':
			width = 554;
			height = 64;
			break;
		case 'settings':
			width = 404;
			height = 284;
			break;
		case 'keywords':
			width = 674;
			height = 304;
			break;
		case 'import':
			width = 484;
			height = 324;
			break;
		case 'export':
			width = 484;
			height = 324;
			break;
		case 'add':
			width = 504;
			height = 204;
			break;
		}
		if (arguments.length == 2) { url += '?'+encodeURIComponent(qString) };
		$('html').fadeOut(500, function() {
			safari.self.width = width;
			safari.self.height = height;
			safari.self.contentWindow.location.href = url;
		});	
	},
	
	shortcutInit: function() {
		$('#shortcut').focus(function() {
			$('#shortcutDisplay span').fadeOut(300);
			$('#shortcutDisplay em').fadeIn(300);
			$('#shortcutDisplay, #shortcut').animate({width: '300px'}, 300);
		}).blur(function() {
			$('#shortcutDisplay em').fadeOut(300);
			Pop.displayShortcut();
		});
		Pop.displayShortcut();
	},
	
	displayShortcut: function() {
		$('#shortcutDisplay span').remove();
		var shortcut = $('#shortcut').val();
		if (!shortcut) {
			$('<span class="kscText">Click to set shortcut</span>').appendTo('#shortcutDisplay').fadeIn(300);
			$('#shortcutDisplay, #shortcut').animate({width: '300px'}, 300);
			return;
		}
		shortcut =('0000000'+shortcut).slice(-7);
		var modCode = shortcut.substr(0,4),
			keyString = '';
		if (modCode.charAt(2) == 1) keyString += '<span class="key">Control</span>';
		if (modCode.charAt(1) == 1) keyString += '<span class="key">Option</span>';
		if (modCode.charAt(0) == 1) keyString += '<span class="key">Command</span>';
		if (modCode.charAt(3) == 1) keyString += '<span class="key">Shift</span>';
		keyString += '<span class="key" id="final">';
		keyString += String.fromCharCode(parseInt(shortcut.substring(4),10));
		keyString += '</span>';
		var deleteButton = $('<span class="delete">[delete]</span>').click(function() {
			$('#shortcut').val('');
			Pop.displayShortcut();
		});
		$('#shortcutDisplay').append($(keyString)).append(deleteButton).children('span').fadeIn(300);
		var widthSum = 14;
		$('#shortcutDisplay span').each(function() {widthSum += ($(this).outerWidth()+6);});
		$('#shortcutDisplay, #shortcut').animate({width: widthSum+'px'}, 300);
	}
	
};

$(function() {
	$('html').fadeIn(500);
	
	$('#back').click(function() {
		Pop.transition('search');
	});
});
