$(function() {
	$('#shortcut').val(ext.settings.shortcut); 	
 	$('#'+ext.settings.resultsType).prop('checked', true);
 	$('#'+ext.settings.shortcutAction).prop('checked', true);
 	$('#enableAddressBar').prop('checked', ext.settings.enableAddressBar);
 	$('input[type="radio"]').click(function() {
 		ext.settings.setItem($(this).attr('name'), $(this).attr('id'));
 	});
 	$('input[type="checkbox"]').click(function() {
 		ext.settings.setItem($(this).attr('name'), $(this).prop('checked'));
 	});
 	Pop.shortcutInit();
});

function setShortcut(shortcut) {
	var ksc = $('#shortcut');
 	ext.settings.shortcut = shortcut;
 	ksc.val(shortcut).blur();
}
