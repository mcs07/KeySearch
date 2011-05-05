function handleMessage(msg) {
	if (window !== window.top) 
		return;
	switch (msg.name) {
	case 'openModal':
		openModal(msg.message);
		break;
	case 'closeModal':
		closeModal();
		break;
	case 'openModalSearch':
		openModalSearch(msg.message);
		break;
	case 'queryParsed':
		$('_____subText').textContent = msg.message.subtext;
		break;
	}
}

closeModal = function () {
	if (open == 'none')
		return;
	open = 'none';
	previewContainer = $('_____previewContainer');
	dimmer = $('_____dimmer')
	previewContainer.fade('out').get('tween').chain(function() {
		previewContainer.dispose();
	});
	if (dimmer) {
		dimmer.fade('out').get('tween').chain(function() {
			dimmer.dispose();
		});
	}
	return false;
}

function openModal(type) {
	if (open == type) {
		closeModal();
		return;
	}
	if (open != 'none')
		closeModal();
	open = type;
	switch(type) {
	case 'keywords':
		var width=700, height=400;
		break;
	case 'add':
		var width=500, height=200;
		break;
	case 'settings':
		var width=500, height=300;
		break;
	case 'import':
	case 'export':
		var width=500, height=340;
		break;
	}
	var dimmer = new Element('div', {
		id: '_____dimmer',
		styles: {width: '100% !important', height: '100% !important', backgroundColor: 'rgba(0,0,0,0.3) !important', position: 'fixed !important', zIndex: '99998 !important', top: '0 !important', left: '0 !important', margin: '0 !important', padding: '0 !important', visibility: 'hidden', opacity: '0'},
		events: {click: closeModal}
	});
	var previewContainer = new Element('div', {
		id: '_____previewContainer',
		styles: {width: width+'px !important', height: height+'px !important', backgroundColor: 'transparent !important', border: 'solid 6px rgba(0,0,0,0.5) !important', borderRadius: '4px !important', position: 'fixed !important', zIndex: '99999 !important', top: '50% !important', left: '50% !important', marginLeft: '-'+width/2+'px !important', marginTop: '-'+height/2+'px !important', padding: '0 !important', visibility: 'hidden', opacity: '0'}
	});
	var iframe = new IFrame({
		src: ext.baseURI + type + '.html',
		scrolling: 'no',
		styles: {width: width+'px !important', height: height+'px !important', border: 'none !important', margin: '0 !important', padding: '0 !important'}
	})
	iframe.inject(previewContainer, 'top');
	var closeLink = new Element('button', {
		id: '_____closeLink',
		textContent: '',
		styles: {display: 'block !important', position: 'absolute !important', top: '-10px !important', right: '-10px !important', padding: '0 !important', margin: '0 !important', width: '24px !important', height: '24px !important', background: 'url('+ext.baseURI+'images/close.png) no-repeat !important', borderStyle: 'none !important', zIndex: '100000 !important'},
		events: {click: closeModal}
	}).inject(previewContainer, 'top');
	dimmer.inject($(document.body)).set('tween', {duration: 300}).fade('in');
	previewContainer.inject($(document.body)).set('tween', {duration: 300}).fade('in');
}

function openModalSearch(keyword) {
	if (open == 'search') {
		if (keyword) {
			var searchField = $('_____keywordSearchField');
			var query = searchField.value.substr(searchField.value.split(' ')[0].length);
			searchField.value = keyword+query;
			searchField.focus();
		} else {
			closeModal();
	   	}
	   	return;
   	}
	if (open != 'none') {
		closeModal();
	}
	open = 'search';
	var previewContainer = new Element('div', {
		id: '_____previewContainer',
		styles: {width: '100% !important', height: '80px !important', backgroundColor: 'rgba(33,33,33,0.65) !important', position: 'fixed !important', zIndex: '99999 !important', bottom: '0 !important', left: '0 !important', margin: '0 !important', padding: '0 !important', visibility: 'hidden', opacity: '0'}
	});
	var keywordSearchField = new Element('input', {
		id: '_____keywordSearchField',
		type: 'text',
		name: '_____keywordSearchField',
		value: '',
		styles: {width: '98% !important', height: '80px !important', background: 'none !important', top: '0 !important', left: '0 !important', margin: '0 !important', padding: '5px 10px !important', color: '#fff !important', lineHeight: '20px !important', border: 'none !important', webkitBoxShadow: 'none !important', outline: 'none !important', fontSize: '50px !important', fontFamily: '"Lucida Grande" !important'}
	}).inject(previewContainer, 'top');
	var subText = new Element('span', {
		id: '_____subText',
		textContent: 'KeySearch',
		styles: {position: 'absolute !important', top: '0px !important', right: '0px !important', background: 'none !important', color: '#fff !important', fontSize: '14px !important', lineHeight: '20px !important', fontFamily: '"Lucida Grande" !important', margin: '2px 10px 0 0 !important', overflow: 'hidden !important'}
	}).inject(previewContainer, 'top');
	previewContainer.inject($(document.body)).set('tween', {duration: 150}).fade('in').get('tween').chain(function() {
		keywordSearchField.focus();
		if(keyword)
			keywordSearchField.value = keyword+' ';
	});
}

function handleKeyup(e) {
	if(e.srcElement.id == '_____keywordSearchField') {
		if (e.srcElement.value == '') {
				$('_____subText').textContent = 'KeySearch';
		} else {
			safari.self.tab.dispatchMessage('parseQuery', 	e.srcElement.value);
		}
	}
}

function handleKeydown(e) {
	k = parseInt(e.keyIdentifier.replace('U+',''), 16);
	if(e.srcElement.id == '_____keywordSearchField') {
		if (e.which == 13) {
			safari.self.tab.dispatchMessage('submitModal', {value:$('_____keywordSearchField').value, command:e.metaKey});
			closeModal();	
		}
	}
	if(e.which == 27)
		closeModal();
}

function handleKeypress(e) {
	shortcut  = k;
	shortcut += e.shiftKey * 1000;
	shortcut += e.ctrlKey  * 10000;
	shortcut += e.altKey   * 100000;
	shortcut += e.metaKey  * 1000000;
	if(e.srcElement.id != 'keyboardShortcut')
		safari.self.tab.dispatchMessage('performKeyboard', shortcut);
}

function handleContextMenu(e) {	
	var clickedField = e.target;
	if (clickedField.nodeName == 'INPUT' && clickedField.type == 'text') {
		if (!clickedField.form)
			return;
		var a = new Element('a', {href: clickedField.form.getAttribute('action')}),
			url = a.href,
			fieldValue = clickedField.value;
		clickedField.value = '@@@';
		var queryString = clickedField.form.toQueryString().replace('%40%40%40','@@@');
		clickedField.value = fieldValue;
		url=url+'?'+queryString;
		var buttons = clickedField.form.getElements('button, input[type="submit"]');
		var buttonNameValues = new Array();
		for ( var i=0; i<buttons.length; i++) {
			if( buttons[i].getAttribute('name') && buttons[i].getAttribute('value')) {
				buttonNameValues.push( {
					name: buttons[i].getAttribute('name'),
					value: buttons[i].getAttribute('value')
				} );
			}
		}
		var userInfo = {
			keyword: '>temp',
			url: url,
			buttons: buttonNameValues,
			enabled: false,
		};
		safari.self.tab.setContextMenuEventUserInfo(e, userInfo);
	} else {
		safari.self.tab.setContextMenuEventUserInfo(e, {url:'noUrl'});
	}
}

const ext = safari.extension;
var open ='none';
safari.self.addEventListener('message', handleMessage, false);
window.addEventListener('keydown', handleKeydown, false);
window.addEventListener('keypress', handleKeypress, false);
window.addEventListener('keyup', handleKeyup, false);
window.addEventListener('contextmenu', handleContextMenu, false);
