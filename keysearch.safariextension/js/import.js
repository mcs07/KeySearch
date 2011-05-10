function importSubmit(form) {
	form.importButton.disabled = true;
	var progress = $('progress'),
		spinner = $('spinner');
	progress.innerHTML = 'Importing...';
	progress.style.display = 'inline';
	spinner.style.display = 'inline';
	
	var dataString = form.data.value;
	if (!dataString || dataString === '') {
		progress.innerHTML = '0 Keywords Imported';
		spinner.style.display='none';
		form.importButton.disabled = false;
		return;
	}
	
	var type = form.typeSelect.options[form.typeSelect.selectedIndex].value;
	switch(type) {
	case 'ff':
		importFF(dataString);
		break;
	case 'kw':
		importKW(dataString);
		break;
	case 'ks':
		importKS(dataString);
		break;
	}
	
	if (keysArray.length > 0)
		addToStorage();
		
	var message = numberImported+' Keywords Imported';
	setTimeout(function(){cleanUp(message)},1000);
}

// Import from Firefox
function importFF(dataString) {
	try {
		var data = JSON.parse(dataString);
		traverseFF(data);
	} catch(e) {
		cleanUp('Error: Unable to parse JSON');
		return;
	}	
}
function traverseFF(o) {
	for (i in o) {
		if (typeof(o[i]) == 'object' && o[i]) {
			if ('keyword' in o[i]) {
				processFF(o[i]);
		   	} else {
			   	traverseFF(o[i]);
			}
		}
	}
}
function processFF(bookmarkObj) {
	keysArray[keysArray.length] = {
		name: bookmarkObj.title,  
		keyword: bookmarkObj.keyword.replace(/\s/g, ''), 
		url: bookmarkObj.uri.replace(/%s/i, '@@@'),
		enabled: true,
	};
}

// Import from Keywurl
function importKW(dataString) {
	parser=new DOMParser();
	try {
		var xmlDoc = parser.parseFromString(dataString,'text/xml');
		var xmlArray = xmlDoc.childNodes[1].childNodes[1].childNodes[3].childNodes;
		for (i=1; i<xmlArray.length; i+=4) {
			var key = xmlArray[i].childNodes[0].nodeValue;
			var url = xmlArray[i+2].childNodes[11].childNodes[0].nodeValue;
			processKW(key, url);
  		}
	} catch(e) {
		cleanUp('Error: Unable to parse plist');
		return;
	}
}
function processKW(key, url) {
	keysArray[keysArray.length] = {
		name: key,  
		keyword: key.replace(/\s/g, ''), 
		url: url.replace(/\{query\}|\{input\}|\{1\}/, '@@@').replace(/\{.*?\}/g, ''),
		enabled: true,
	};
}

// Import from KeySearch
function importKS(dataString) {
	try {
		keysArray = JSON.parse(dataString);
	} catch(e) {
		cleanUp('Error: Unable to parse JSON');
		return;
	}
}

// Add data to local storage under key (don't overwrite)
function addToStorage() {
	for (var i=0; i<keysArray.length; i++) {
		numberImported += store.setCheckItem(keysArray[i]);
	}
}

// Remove spinner, display message, clear array, enable button
function cleanUp(msg) {
	$('progress').innerHTML = msg;
	$('spinner').style.display= 'none';
	$('importButton').disabled = false;
	keysArray = [];
	numberImported = 0;
}

function typeChanged(select) {
	var type = select.options[select.selectedIndex].value,
		inst = $('instructions');
	switch(type) {
	case 'ff':
		inst.innerHTML = '1. Open Firefox and choose Show All Bookmarks (&#8679;&#8984;B).<br />2. Select Backup from the  Import and Backup menu.<br />3. Open the saved file with a text editor like TextEdit.<br />4. Copy and paste the contents into the box below.'
		break;
	case 'kw':
		inst.innerHTML = '1. In the Finder, go to ~/Library/Application Support/Keywurl.<br />2. Open Keywords.plist with a text editor like TextEdit.<br />3. Copy and paste the contents into the box below.'
		break;
	case 'ks':
		inst.innerHTML = '1. Find your saved KeySearch backup file.<br />2. Open it with a text editor like TextEdit.<br />3. Copy and paste the contents into the box below.'
		break;
	}
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
window.addEventListener('keyup', handleKeyup, false);
var keysArray = new Array();
var numberImported = 0;
