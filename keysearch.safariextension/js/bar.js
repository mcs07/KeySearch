function init() {
	var version = ext.settings.version;
	switch (true) {
	case (version == undefined):
		store.addItem('wiki','Wikipedia','http://en.wikipedia.org/w/index.php?search=@@@',true);
		store.addItem('!','Open URL','http://@@@',true);
		store.addItem('amazon','Amazon','http://www.amazon.com/s/ref=nb_sb_noss?field-keywords=@@@&url=search-alias%3Daps&tag=moxt-20',true);
		store.addItem('image','Google Images','http://www.google.com/images?q=@@@',true);
		store.addItem('gmail','GMail','https://mail.google.com/mail/?shva=1#search/@@@',true);
		store.addItem('map','Google Maps','http://maps.google.com/maps?q=@@@',true);
		store.addItem('default','default','http://www.google.com/search?q=@@@',true);
		store.addItem('imdb','IMDb','http://www.imdb.com/find?s=all&q=@@@',true);
		store.addItem('youtube','YouTube','http://www.youtube.com/results?search_query=@@@',true);
		//app.openBrowserWindow();
		//app.activeBrowserWindow.activeTab.url = 'http://www.macosxtips.co.uk/keysearch/welcome';
		break;
	case (version < 151):
		//store.addItem('!','Open URL','http://@@@',true);
		//app.openBrowserWindow();
		//app.activeBrowserWindow.activeTab.url = 'http://www.macosxtips.co.uk/keysearch/welcome';
		// migrate old shortcut system to new one
		break;
	}
	ext.settings.version = 151;
	store.upgrade();
}

function performCommand(e) {
	if (safari.self.browserWindow != app.activeBrowserWindow)
		return;
	switch (e.command) {
	case 'keySearchButton':
		toggleBar();
		break;
	case 'keySearchContext':
		store.setItem(e.userInfo);
		app.activeBrowserWindow.activeTab.page.dispatchMessage('openModal', 'add');
		break;
	}	
}

function toggleBar() {
	if (safari.self.visible) {
		safari.self.hide();
	} else {
		focusBar();
	}
}

function focusBar(keyword) {
	if (!safari.self.visible) {
		safari.self.show();
	}
	var searchField = $('keywordSearchField');
	searchField.focus();
	if (keyword) {
		searchField.value = keyword+' ';
	} else {
		searchField.select();
	}
}

function validateCommand(e) {
	if (e.command == 'keySearchContext')
		e.target.disabled = (e.userInfo.url == 'noUrl') ? true : false;
}

function parseQuery(textEntered) {
	if (textEntered == '') {
		return {subtext:'KeySearch'};
	} else if (textEntered == '@settings' || textEntered == '@keywords' || textEntered == '@import' || textEntered == '@export') {
		return {url:textEntered, subtext:'Open '+textEntered+' Window'};
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
			data = store.getItem(key);
		if (data) {
			if (!data.enabled || key == 'default') data = null;
		}
		if (!data) {
			data = store.getItem('default');				
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
		openModal(url.substr(1));
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

function handleMessage(msg) {
	if (safari.self.browserWindow != app.activeBrowserWindow)
			return;
	switch (msg.name) {
	case 'parseQuery':
		app.activeBrowserWindow.activeTab.page.dispatchMessage('queryParsed', parseQuery(msg.message));
		break;
	case 'submitModal':
		if (msg.message.value == '')
			return;
		if (msg.message.command) {
			openUrl(parseQuery(msg.message.value).url, 'foreground');
		} else {
			openUrl(parseQuery(msg.message.value).url);
		}
		break;
	case 'performKeyboard':
		performKeyboard(msg.message);
		break;
	case 'getSetting':
		app.activeBrowserWindow.activeTab.page.dispatchMessage('returnSetting', {key:msg.message, value:ext.settings.getItem(msg.message),});
		break;
	case 'setSetting':
		ext.settings.setItem(msg.message.key, msg.message.value);
		break;
	case 'closeBox':
		app.activeBrowserWindow.activeTab.page.dispatchMessage('closeModal');
		break;
	case 'openModalFromModal':
		openModal(msg.message);
		break;
	}
}

function openModal(type) {
	var tab = app.activeBrowserWindow.activeTab;
	if (!tab.url || tab.url.substring(4,0) != 'http') {
		tab.url = ext.baseURI + type + '.html';
		return;
	}
	tab.page.dispatchMessage('openModal', type);
}

function performKeyboard(keyPressed) {
	// If a keyword's shortcut is pressed, show bar and fill keyword
	var keyword;
	store.each(function(data) {
		if (keyPressed == data.shortcut) {
			keyword = data.keyword;
		}
	})
	if (keyPressed == ext.settings.shortcut || keyword != undefined) {
		if (ext.settings.keyboardShortcutAction == 'toolbar') {
			focusBar(keyword);
		} else {
			app.activeBrowserWindow.activeTab.page.dispatchMessage('openModalSearch', keyword);
		}
	}
}

function handleKeydown(e) {
	k = parseInt(e.keyIdentifier.replace('U+',''), 16);
	if(e.which == 27)
		app.activeBrowserWindow.activeTab.page.dispatchMessage('closeModal');
}

function handleKeypress(e) {
	shortcut  = k;
	shortcut += e.shiftKey * 1000;
	shortcut += e.ctrlKey  * 10000;
	shortcut += e.altKey   * 100000;
	shortcut += e.metaKey  * 1000000;
	if(shortcut == ext.settings.shortcut) {
		safari.self.hide();
	} else {
		store.each(function(data) {
			if (shortcut == data.shortcut) {
				var searchField = $('keywordSearchField');
				var query = searchField.value.substr(searchField.value.split(' ')[0].length);
				searchField.value = data.keyword+query;
				searchField.focus();
			}
		})
	}
}

function searchKeyup(e) {
	$('subText').textContent = (e.srcElement.value == '') ? '' : parseQuery(e.srcElement.value).subtext;
}

function searchKeydown(e) {
	if(e.which == 27) {
		safari.self.hide();
	}
	if (e.which == 13) {
		if (e.metaKey) {
			openUrl(parseQuery(e.srcElement.value).url, 'foreground');
		} else {
			openUrl(parseQuery(e.srcElement.value).url);
		}
		if (ext.settings.afterSearch == 'toolbarHides') {
			safari.self.hide();
		}
	}
}

const app = safari.application,
	  ext  = safari.extension;
app.addEventListener('command', performCommand, false);
app.addEventListener('validate', validateCommand, false);
app.activeBrowserWindow.addEventListener('message', handleMessage, false);
window.addEventListener('keydown', handleKeydown, false);
window.addEventListener('keypress', handleKeypress, false);
