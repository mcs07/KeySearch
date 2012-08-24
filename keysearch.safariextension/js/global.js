// TODO: Context menu for add keyword

// Runs once per browser session
$(function() {
	var prevVersion = ext.settings.version;
	switch (true) {
	case (prevVersion == 211):	// No upgrade
		return;
	case (prevVersion == undefined): // New installation
		_gaq.push(['_trackEvent', 'Install', 'New']);	// Put empty shortcut argument in
		Store.addItem('wiki','Wikipedia','http://en.wikipedia.org/w/index.php?search=@@@',true);
		Store.addItem('!','Open URL','http://@@@',true);
		Store.addItem('amazon','Amazon','http://www.amazon.com/s/ref=nb_sb_noss?field-keywords=@@@&url=search-alias%3Daps&tag=moxt-20',true);
		Store.addItem('image','Google Images','http://www.google.com/images?q=@@@',true);
		Store.addItem('gmail','GMail','https://mail.google.com/mail/?shva=1#search/@@@',true);
		Store.addItem('map','Google Maps','http://maps.google.com/maps?q=@@@',true);
		Store.addItem('default','default','http://www.google.com/search?q=@@@',true);
		Store.addItem('imdb','IMDb','http://www.imdb.com/find?s=all&q=@@@',true);
		Store.addItem('youtube','YouTube','http://www.youtube.com/results?search_query=@@@',true);
		Store.addItem('fb','FaceBook','https://www.facebook.com/search.php?q=@@@',true);
		Store.addItem('r','reddit','http://www.reddit.com/search?q=@@@',true);
		// TODO: Check if Windows, if so change shortcut to something else
		break;
	case (prevVersion < 151): // Upgrading from before 1.5.1
		_gaq.push(['_trackEvent', 'Install', '<151']);
		var oldShortcut  = ext.settings.keyboardShortcut.charCodeAt(0);
		oldShortcut += (ext.settings.useShift == 'useShift')     * 1000;
		oldShortcut += (ext.settings.useControl == 'useControl') * 10000;
		oldShortcut += (ext.settings.useOption == 'useOption')   * 100000;
		oldShortcut += (ext.settings.useCommand == 'useCommand') * 1000000;
		ext.settings.shortcut = oldShortcut;
		break;
	case (prevVersion == 151): // Upgrading from 1.5.1
		_gaq.push(['_trackEvent', 'Install', '151']);
		break;
	case (prevVersion == 200): // Upgrading from 2.0
		_gaq.push(['_trackEvent', 'Install', '200']);
		break;
	case (prevVersion == 210): // Upgrading from 2.1
		_gaq.push(['_trackEvent', 'Install', '210']);
		break;
	}
	// After all upgrades and new installations:
	ext.settings.version = 211;
	Store.upgrade();
});

// Handle messages received from injected script
function handleMessage(msg) {
	switch (msg.name) {
	case 'performKeyboard':
		performKeyboard(msg.message);
		break;
	case 'parseQuery':
		app.activeBrowserWindow.activeTab.page.dispatchMessage('queryParsed', parseQuery(msg.message));
		break;
	case 'submitHUD':
		if (msg.message.value == '')
			return;
		if (msg.message.command) {
			openUrl(parseQuery(msg.message.value).url, 'foreground');
		} else {
			openUrl(parseQuery(msg.message.value).url);
		}
		break;
	}
}

// Checks keypress against stored shortcuts, shows popover and fills with keyword if necessary
function performKeyboard(keyPressed, fieldVal) {
	var keyword;
	Store.each(function(data) {
		if (keyPressed == data.shortcut) {
			keyword = data.keyword;
		}
	})
	if (keyPressed == ext.settings.shortcut || keyword != undefined) {
		if (ext.settings.shortcutAction == 'popover') {
			$(ext.toolbarItems).each(function() {
				if (this.browserWindow == app.activeBrowserWindow) {
					this.showPopover();
				}
			});
			if (keyword) {
				var query = keyword;
				if (fieldVal) {
					query += fieldVal.substr(fieldVal.split(' ')[0].length);
				}
				popWindow.Pop.transition('search', query);
			}
		} else {
			app.activeBrowserWindow.activeTab.page.dispatchMessage('showHUD', keyword);
		}
	}
}

// Converts the entered text into {key, query, url, subtext}
function parseQuery(textEntered) {
	if (textEntered == '') {
		return {subtext:'KeySearch'};
	} else if (textEntered == '@settings' || textEntered == '@keywords' || textEntered == '@import' || textEntered == '@export') {
		return {key:textEntered, query:textEntered, url:textEntered, subtext:'Open '+textEntered+' Window'};
	} else if (textEntered.substr(0,1) == '>') {
		var key = textEntered.split(' ')[0],
			siteToSearch = (key.length == 1) ? app.activeBrowserWindow.activeTab.url.match(/:\/\/(www\.)?(.[^/:]+)/)[2] : key.substr(1),
			subtext = 'Searching: '+siteToSearch+' (using Google) For: '+textEntered.substr(key.length+1),
			query = 'site:'+siteToSearch+' '+textEntered.substr(key.length+1),
			url = 'http://www.google.com/search?q='+encodeURIComponent(query).replace(/%20/g,'+');
		return {key:key, query:query, url:url, subtext:subtext};
	} else {
		var key = textEntered.split(' ')[0],
			query = textEntered.substr(key.length+1),
			data = Store.getItem(key);
		if (data) {
			if (!data.enabled || key == 'default') data = null;
		}
		if (!data) {
			data = Store.getItem('default');				
			if (!data.enabled) return;
			query = (query == '') ? key : (key+' '+query)
			key = 'default';									
		}
		url = data.url.replace('@@@', encodeURIComponent(query).replace(/%20/g,'+'));
		try {
			subtext = 'Searching: '+url.match(/:\/\/(www\.)?(.[^/:]+)/)[2]+' For: '+query;
		} catch(e) {
			subtext = '';
		}
		return {key:key, query:query, url:url, subtext:subtext};
	}
}

function openUrl(url, override) {
	if (url == '@settings' || url == '@keywords' || url == '@import' || url == '@export') {
		$(ext.toolbarItems).each(function() {
			if (this.browserWindow == app.activeBrowserWindow) {
				this.showPopover();
			}
		});
		popWindow.Pop.transition(url.substr(1));
		return;
	}
	var resultsType = override ? override : ext.settings.resultsType;
	switch (resultsType) {
	case 'foreground':
		app.activeBrowserWindow.openTab('foreground').url = url;
		break;
	case 'background':
		app.activeBrowserWindow.openTab('background').url = url;
		break;
	case 'new':
		app.openBrowserWindow();
		app.activeBrowserWindow.activeTab.url = url;
		break;
	case 'current':
		app.activeBrowserWindow.activeTab.url = url;
		break;
	}
}

function parseShortcut(shortcut) {
	shortcut = ('0000000'+shortcut.toString()).slice(-7);
	var modCode = shortcut.substring(0,4),
		keyString = '';
	if (modCode.charAt(3) == 1) keyString += '⇧';
	if (modCode.charAt(2) == 1) keyString += '⌃';
	if (modCode.charAt(1) == 1) keyString += '⌥';
	if (modCode.charAt(0) == 1) keyString += '⌘';
	keyString += String.fromCharCode(parseInt(shortcut.substring(4),10))
	return keyString;
}

function performCommand(e) {
	if (e.command == 'keySearchContext') {
		Store.setItem(e.userInfo);
		$(ext.toolbarItems).each(function() {
			if (this.browserWindow == app.activeBrowserWindow) {
				this.showPopover();
			}
		});
		popWindow.Pop.transition('add');
	}	
}

function validateCommand(e) {
	if (e.userInfo && e.userInfo.url == 'noUrl') {
		e.target.disabled = true;
	} else {
		e.target.disabled = false;
	}
}

// Accepts keysearch input via the address bar in Safari 5.1
function handleBeforeNavigate(e) {
	if (!safari.application.privateBrowsing) {
		 var url = e.url;
		if (!ext.settings.enableAddressBar || !url || !(url.indexOf('http://') == 0 && url.substr(-1) === '/')) {
			return;
		}
		url = punycode.ToUnicode(decodeURIComponent(url.replace(/^http:\/\//, '').replace(/\/$/, '')));
		parseResults = parseQuery(url);
		if (parseResults.key != 'default') {
			e.target.url = parseResults.url;
		}
		var match = url.match(/^((www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}?|localhost|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))(:[1-9][0-9]*)?($|\/.*)/)
		if (!match) {
			e.target.url = parseResults.url;
		}
	}
}

// Accept search input via the address bar in Safari 6
function handleBeforeSearch(e) {
	var textEntered = e.query;
	if (ext.settings.enableAddressBar && textEntered) {
		e.preventDefault();
		e.target.url = parseQuery(textEntered).url;
	}
}

// Abbreviations
const app = safari.application,
	  ext = safari.extension;
	  popWindow = ext.popovers[0].contentWindow;
	  
// Event listeners
app.addEventListener('message', handleMessage, false);
app.addEventListener('command', performCommand, false);
app.addEventListener('validate', validateCommand, false);
app.addEventListener('beforeSearch', handleBeforeSearch, false);
app.addEventListener('beforeNavigate', handleBeforeNavigate, false);

// Google Analytics
var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-125911-9']);
	_gaq.push(['_trackPageview']);
(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
