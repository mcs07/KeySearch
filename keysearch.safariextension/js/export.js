function pageLoaded() {
	var dataArray = new Array();
	store.each(function(data) {
		dataArray.push(data);
	});
	$('data').value = JSON.stringify(dataArray, null, 4);
}

function selectAll() {
	$('data').focus();
	$('data').select();
}

function handleKeyup(e) {
	if(e.which == 27)
		safari.self.tab.dispatchMessage('closeBox');
}

window.addEvent('domready', pageLoaded);
window.addEventListener("keyup", handleKeyup, false);
