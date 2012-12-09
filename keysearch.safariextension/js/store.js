var Store = {
    
    getItem: function(key) {
        var jsonString = safari.extension.settings.getItem('__'+key);
        if (jsonString) {
            var data = JSON.parse(jsonString);
            return data;
        }
    },
    
    setItem: function(data) {
        var jsonString = JSON.stringify(data);
        safari.extension.settings.setItem('__'+data.keyword, jsonString);
        return;
    },
    
    setCheckItem: function(data) {
    	if (safari.extension.settings.getItem('__'+data.keyword) !== null)
    		return 0;
        Store.setItem(data);
        return 1;
    },
    
	addItem: function(keyword, name, url, enabled) {
        var data = {keyword:keyword,name:name,url:url,enabled:enabled};
        Store.setItem(data);
        return;
    },
    
    addCheckItem: function(keyword, name, url, enabled) {
        var data = {keyword:keyword,name:name,url:url,enabled:enabled};
        Store.setCheckItem(data);
        return;
    },
    
    duplicateItem: function(keyword) {
    	var data = Store.getItem(keyword);
    	original = data.keyword;
    	suffix = 2;
    	while (!Store.setCheckItem(data)) {
    		data.keyword = original + suffix;
    		suffix += 1;
    	}
    	return data;
    },
    
    removeItem: function(key) {
        safari.extension.settings.removeItem('__'+key);
        return;
    },
    
    each: function(fn) {
    	for (keyword in safari.extension.settings) {
    		if (keyword.substr(0,2) == '__') {
    			var data = Store.getItem(keyword.substr(2));
				fn(data);
    		}
        }
        return;
    },
    
    upgrade: function() {
    
    	// Switch to ext.settings from localStorage (since 2.2.1)
    	for (var i=0; i < localStorage.length; i++) {
			var jsonString = localStorage.getItem(localStorage.key(i));
			if (jsonString) {
				var data = JSON.parse(jsonString);
				Store.setCheckItem(data);
			}
		}
		localStorage.clear()
    
    	// Add 'name' field if missing (since 1.3)
    	// Add 'shortcut' field if missing (since 1.5.1)
        Store.each(function(data) {
			if (!data.name) {
				data.name = data.keyword;
			}
			if (!data.shortcut) {
				data.shortcut = '';
			}
			Store.setItem(data);
        });
        return;
    },
    
    clear: function() {
    	safari.extension.settings.clear();
    	return;
    }
};
