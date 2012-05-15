$(function() {
	safari.self.width = 554;
	safari.self.height = 64;

	var ksField = $('#keysearchField'),
		keyword = decodeURIComponent(window.location.search.substring(1));
	
	if (keyword) {
		ksField.val(keyword+' ');
		ksField.focus();
	}

	ksField.keypress(function(e) {
  		if (e.which == 13) {
			if (e.metaKey) {
				gbl.openUrl(gbl.parseQuery(e.srcElement.value).url, 'foreground');
			} else {
				gbl.openUrl(gbl.parseQuery(e.srcElement.value).url);
			}
			if ($('#keysearchField').val().substr(0,1) != '@') {
				safari.self.hide();
			}
		}
	});
	
	$('#searchSettings').prop('selectedIndex', -1).click(function() {
		if ($(this).val()) {
			Pop.transition($(this).val(), 800, 500);
		}
	});
	
	$('#helpButton').click(function() {
		gbl.openUrl('http://www.macosxtips.co.uk/keysearch/help', 'foreground');
		safari.self.hide();
	});
});
