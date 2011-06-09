function pageLoaded() {
	safari.application.dispatchMessage('getSetting', 'keyboardShortcutAction');
	safari.application.dispatchMessage('getSetting', 'afterSearch');
	safari.application.dispatchMessage('getSetting', 'resultsType');
	safari.application.dispatchMessage('getSetting', 'shortcut');
}

function handleMessage(msg) {
	if (msg.name == 'returnSetting') {
		if (msg.message.key == 'shortcut') {
			$('keyboardShortcut').value = parseShortcut(msg.message.value);
			_gaq.push(['_trackEvent', 'Shortcut', msg.message.value]);
		} else {
			$(msg.message.value).checked = true;
			_gaq.push(['_trackEvent', 'Setting', msg.message.value]);
		}
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

function radioClicked(radio) {
	safari.self.tab.dispatchMessage('setSetting', {key:radio.name, value:radio.id});
}

function shortcutFocus(field) {
	field.set('styles', {color:'#888'});
	if (!field.value)
		field.value = 'Type Shortcut';
}

function shortcutBlur(field) {
	field.set('styles', {color:'#000'});
	if (field.value == 'Type Shortcut')
		field.value = '';
}

function shortcutKeydown(e) {
	keyPressed =  parseInt(e.keyIdentifier.replace('U+',''), 16);
}

function shortcutKeypress(e) {
	shortcut  = keyPressed;
	shortcut += e.shiftKey * 1000;
	shortcut += e.ctrlKey  * 10000;
	shortcut += e.altKey   * 100000;
	shortcut += e.metaKey  * 1000000;
	safari.self.tab.dispatchMessage('setSetting', {key:'shortcut', value:shortcut});
	safari.self.tab.dispatchMessage('getSetting', 'shortcut');
	e.target.blur();
}

function handleKeydown(e) {
	if(e.which == 27)
		safari.self.tab.dispatchMessage('closeBox');
}

var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-125911-9']);
	_gaq.push(['_trackPageview']);
(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
safari.self.addEventListener('message', handleMessage, false);
window.addEvent('domready', pageLoaded);
window.addEventListener('keydown', handleKeydown);
