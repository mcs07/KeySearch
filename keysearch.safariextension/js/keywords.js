function pageLoaded() {
	store.upgrade();
	store.each(addLi);
	sortList(0);
	$('buttonContainer').set('styles', {backgroundImage: 'url('+ext.baseURI+'images/buttonBack.png)'});
	$('enabledBack').set('styles', {background: 'url('+ext.baseURI+'images/switch.png) 0px 0px'});
	$('enabled').set('styles', {background: 'url('+ext.baseURI+'images/switchContainer.png) 0px 0px'});
	$$('.ksCheckBox').set('styles', {backgroundImage: 'url('+ext.baseURI+'images/shortcutkeys.png)'});
	const plusButton = $('plusButton'),
		  actionButton = $('actionButton');
	plusButton.set('styles', {backgroundImage: 'url('+ext.baseURI+'images/plus.png)'});
	actionButton.set('styles', {backgroundImage: 'url('+ext.baseURI+'images/action.png)'});
	actionButton.selectedIndex = -1;
	plusButton.addEvent('click', function(event) {
		markCurrent($('new'));
		$$('aside')[0].scrollTop = $$('aside')[0].scrollHeight;
		bindNewForm();
	});
	plusButton.fireEvent('click');
	actionButton.addEvent('click', function(event) {
		safari.self.tab.dispatchMessage('openModalFromModal', this.options[this.selectedIndex].value);
	});
	$('helpButton').addEvents({
		mouseover: function(){
			$('urlTip').set('tween', {duration: 200}).fade('in');
		},
		mouseout: function(){
			$('urlTip').set('tween', {duration: 200}).fade('out');
		}
	});
}

function addLi(data) {
	var key = data.keyword;
	const ul = $('list');
	var li = new Element('li', {id: 'item-'+key}),
		link = new Element('a', {
			'class': 'selector' + (data.enabled ? '' : ' disabled'),
			href: '#'+key,
			text: nameTrunc(data.name),
			events: {
				click: function(event){
					markCurrent(this);
					var data = store.getItem(this.getAttribute('href').substr(1));
					bindEditForm(data);
				}
			}
		}),
		deleteLink = new Element('a', {
			'class': 'delete',
			href: '#delete'+key,
			text: '[delete]',
			events: {
				click: function(event){
					var li = this.getParent(),
						link = this.getPrevious();
					if (link.hasClass('current')) {
						var prev = li.getPrevious(),
							next = li.getNext(),
							target = $('plusButton');
						if (next) {
							target = next.getChildren('a')[0];
						} else if (prev) {
							target = prev.getChildren('a')[0];
						}
						target.fireEvent('click');
					}
					li.fade('out').get('tween').chain(function() {
						li.destroy();
					});
					store.removeItem(this.getAttribute('href').substr(7));
				}
			}
		});
	li.grab(link).grab(deleteLink).inject(ul);
	return li;
}

function bindEditForm(data) {
	setTitle('Editing Keyword: '+data.keyword)
	const form = $('form');
	form.keyword.set('value', data.keyword);
	form.name.set('value', data.name);
	form.url.set('value', data.url);
	form.shortcut.set('value', data.shortcut);
	form.enabled.getParent().set('styles', {display: 'block'});
	if (form.enabled.checked != data.enabled) {
		form.enabled.set('checked', data.enabled);
		switchVisual(form.enabled, 0);
	}
	if (data.keyword == 'default') {
		form.keyword.disabled = true;
		form.name.disabled = true;
		form.shortcutDisplay.disabled = true;
	} else {
		form.keyword.disabled = false;
		form.name.disabled = false;
		form.shortcutDisplay.disabled = false;
	}
	form.save.disabled = false;
	refreshShortcut();
	validateForm();
	
	var oldKey = data.keyword;
	form.removeEvents('submit');
	form.addEvent('submit', function(event){
		event.stop();
		data = constructDataFromForm(this);
		if (data.keyword && data.url) {
			store.removeItem(oldKey);
			store.setItem(data);
			key = data.keyword;
			li = $('item-'+oldKey);
			li.id = 'item-'+key;
			link = li.getChildren('a')[0];
			link.set('text', nameTrunc(data.name));
			link.set('href', '#'+key);
			link.removeClass('disabled');
			if (!data.enabled)
				link.addClass('disabled');
			deleteLink = li.getChildren('a')[1];
			deleteLink.set('href', '#delete'+key);			
			setTitle('Editing Keyword: '+key);
			sortList(1000);
		}
	});
}

function bindNewForm() {
	setTitle('New Keyword');
	const form = $('form');
	form.keyword.set('value', '');
	form.name.set('value', '');
	form.url.set('value', '');
	form.shortcut.set('value', '');
	form.enabled.set('checked', true);
	form.enabled.getParent().set('styles', {display: 'none'});
	switchVisual(form.enabled, 0)
	form.save.disabled = true;
	form.name.disabled = false;
	form.keyword.disabled = false;
	form.shortcutDisplay.disabled = false;
	refreshShortcut();
	validateForm();
	
	form.removeEvents('submit');
	form.addEvent('submit', function(event){
		event.stop();
		var data = constructDataFromForm(this);
		if (data.keyword && data.url) {
			store.setItem(data);
			var li = addLi(data);
			li.getChildren('a')[0].fireEvent('click');
			sortList(1000);
		}
	});
}

function setTitle(title) {
	$('title').set('text', title);
}

function nameTrunc(name) {
	if (name.length > 22) {
		name = name.substr(0,20).replace(/^\s+|\s+$/g,'') + '...';
	}
	return name;
}

function markCurrent(element) {
	$$('.current').each(function(c){
		c.removeClass('current');
	});
	if (typeof element === 'string')
		element = $('item-'+element).getChildren('a')[0];
	element.addClass('current');
}

function constructDataFromForm(form) {
	return {
		keyword: form.keyword.value.split(' ').join(''),
		name: (form.name.value == '') ? form.keyword.value : form.name.value,
		url: form.url.value,
		enabled: form.enabled.checked,
		shortcut: form.shortcut.value
	}
}

function sortList(dur) {
	var names = $$('li .selector').get('text');
	var liArray = new Array();
	for (var i=0; i < names.length; i++) {
		item = {pos: i, name: names[i]}
		liArray.push(item);
	}
	liArray.sort(function(a, b){
		var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
		if (a.name == 'default')
			return -1 
		if (b.name == 'default')
			return 1
		if (nameA < nameB)
			return -1 
		if (nameA > nameB)
			return 1
		return 0
	});
	var newOrder = new Array();
	for (var i=0; i < liArray.length; i++) {
		newOrder[i] = liArray[i].pos;
	}
	var mysort = new Fx.Sort($$('aside li'), {
		duration: dur
	});
	mysort.sort(newOrder).chain(function() {
		mysort.rearrangeDOM();
	});
}

function validateForm() {
	const form = $('form'),
		  desc = $('keywordDescription');

	if (!form.keyword.value) {
		form.save.disabled = true;
		desc.textContent = '';
		return;
	}
	if (store.getItem(form.keyword.value) && form.keyword.value != $$('.current')[0].getAttribute('href').substr(1)) {
		desc.textContent = 'Keyword must be unique';
		form.save.disabled = true;
		return;
	}
	if (form.keyword.value.split(' ')[1]) {
		desc.textContent = 'Keyword must be a single word';
		form.save.disabled = true;
		return;
	}
	if (form.keyword.value.substr(0,1) == '>') {
		desc.textContent = 'Keyword must not start with >';
		form.save.disabled = true;
		return;
	}
	desc.textContent = '';

	if (!form.keyword.value || !form.url.value) {
		form.save.disabled = true;
		return;
	}
	form.save.disabled = false;
	
}

function setName(form) {
	if (form.name.value == '') {
		form.name.value = form.keyword.value;
	}
}

function switchVisual(enabled, dur) {
	enabledBack = enabled.getParent();
	enabledBack.set('tween', {
		property: 'background-position',
		duration: dur
	});
	if (enabled.get('checked') == true) {
		enabledBack.tween('0px 0px');
	} else {
		enabledBack.tween('-53px 0px');
	}
}

function switchChange(enabled) {
	switchVisual(enabled, 400);
	var current = $$('.current')[0];
	data = store.getItem(current.getAttribute('href').substr(1));
	data.enabled = enabled.get('checked');
	store.setItem(data);
	current.removeClass('disabled');
	if (!data.enabled)
		current.addClass('disabled');
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
	e.srcElement.getNext().value = shortcut;
	refreshShortcut();
	e.target.blur();
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

function refreshShortcut() {
	shortcut = ('0000000'+$('shortcut').value.toString()).slice(-7);
	var modCode = shortcut.substring(0,4),
		keyString = '';
	if (modCode.charAt(3) == 1) keyString += '⇧';
	if (modCode.charAt(2) == 1) keyString += '⌃';
	if (modCode.charAt(1) == 1) keyString += '⌥';
	if (modCode.charAt(0) == 1) keyString += '⌘';
	keyString += String.fromCharCode(parseInt(shortcut.substring(4),10));
	$('shortcutDisplay').value = keyString;
	
	// Make keyString 'none' if shortcut is null?
}

function handleKeyup(e) {
	if(e.which == 27)
		safari.self.tab.dispatchMessage('closeBox');
}

const ext  = safari.extension;
window.addEvent('domready', pageLoaded, false);
window.addEventListener('keyup', handleKeyup, false);

/*
 * This file contains code based upon code in the 
 * User CSS Safari Extension by  Kridsada Thanabulpong,
 * which is released under the MIT license
 * 
 * User CSS: http://code.grid.in.th/
 * MIT license: http://www.opensource.org/licenses/mit-license.php
 * 
 */
