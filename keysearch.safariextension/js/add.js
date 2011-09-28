$(function() {
	var keyword = $('#keyword'),
		buttonSelect = $('#buttonSelect'),
		save = $('#save'),
		data = Store.getItem('>temp');
	Store.removeItem('>temp');
	for (i = 0; i<data.buttons.length; i++) {
		buttonSelect.append('<option>'+data.buttons[i].value+'</option>')
	}
	if (data.buttons.length > 1) {
		$('#dropDown').show();
	}
	keyword.focus();
	
	keyword.keyup(function() {
		validate();
	});
	
	save.click(function() {
		this.disabled = true;
		data.keyword = keyword.val();
		data.name = keyword.val();
		data.enabled = true;
		if (button = data.buttons[buttonSelect.attr('selectedIndex')]) {
			data.url = data.url+'&'+button.name+'='+button.value;
		}
		delete data.buttons;
		Store.setItem(data);
		Pop.transition('search');
		safari.self.hide();
	});
	
	function validate() {
		const keyword = $('#keyword').val(),
			  save = $('#save'),
			  desc = $('#keyDesc');
		if (keyword == '') {
			save.attr('disabled', true);
			desc.text('');
		} else if (keyword.indexOf(' ') != -1) {
			desc.text('Keyword must not contain spaces');
			save.attr('disabled', true);
		} else if (keyword.substr(0,1) == '>') {
			desc.text('Keyword must not start with >');
			save.attr('disabled', true);
		} else if (Store.getItem(keyword)) {
			desc.text('Keyword must be unique');
			save.attr('disabled', true);
		} else {
			desc.text('');
			save.attr('disabled', false);
		}
	}

});