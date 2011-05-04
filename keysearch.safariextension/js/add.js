function pageLoaded() {
	data = store.getItem('>temp');
	store.removeItem('>temp');
	for (i = 0; i<data.buttons.length; i++) {
		var newOption = new Element('option', {
			text: data.buttons[i].value
		});
		$('buttonSelect').add(newOption, null);
	}
	if (data.buttons.length > 1) {
		$('dropDown').style.display = 'block';
	}
	validateForm();
}

function submitKeyword() {
	$('form').save.disabled = true;
	data.keyword = form.keyword.value;
	data.name = form.keyword.value;
	data.enabled = true;
	if (button = data.buttons[$('buttonSelect').selectedIndex]) {
		data.url = data.url+'&'+button.name+'='+button.value;
	}
	delete data.buttons;
	store.setItem(data);
	safari.self.tab.dispatchMessage('closeBox');
}

function validateForm() {
	const form = $('form'),
		  desc = $('keyDesc');
	if (form.keyword.value == '') {
		form.save.disabled = true;
		desc.textContent = ' ';
	} else if (store.getItem(form.keyword.value)) {
		desc.textContent = 'Keyword must be unique';
		form.save.disabled = true;
	}else if (form.keyword.value.split(' ')[1]) {
		desc.textContent = 'Keyword must be a single word';
		form.save.disabled = true;
	}else if (form.keyword.value.substr(0,1) == '>') {
		desc.textContent = 'Keyword must not start with >';
		form.save.disabled = true;
	} else {
		desc.textContent = ' ';
		form.save.disabled = false;
	}
}

function handleKeyup(e) {
	if(e.which == 27)
		safari.self.tab.dispatchMessage('closeBox');
}

window.addEvent('domready', pageLoaded, false);
window.addEventListener('keyup', handleKeyup, false);
var data = new Object();
