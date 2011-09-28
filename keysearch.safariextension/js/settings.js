$(function() {
	$('#shortcut').val(ext.settings.shortcut); 	
 	$('#'+ext.settings.resultsType).prop('checked', true);
 	$('#'+ext.settings.shortcutAction).prop('checked', true);
 	$('input[type="radio"]').click(function() {
 		ext.settings.setItem($(this).attr('name'), $(this).attr('id'));
 	});
 	Pop.shortcutInit();
});

function setShortcut(shortcut) {
	var ksc = $('#shortcut');
 	ext.settings.shortcut = shortcut;
 	ksc.val(shortcut).blur();
}