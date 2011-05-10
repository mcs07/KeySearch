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

var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-125911-9']);
	_gaq.push(['_trackPageview']);
(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
window.addEvent('domready', pageLoaded);
window.addEventListener("keyup", handleKeyup, false);
