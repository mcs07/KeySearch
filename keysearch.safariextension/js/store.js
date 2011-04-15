var store = {
    
    getItem: function(key) {
        var jsonString = localStorage.getItem(key);
        if (jsonString) {
            var data = JSON.parse(jsonString);
            return data;
        }
    },
    
    setItem: function(data) {
        var jsonString = JSON.stringify(data);
        localStorage.setItem(data.keyword, jsonString);
        return;
    },
    
    setCheckItem: function(data) {
    	if (localStorage.getItem(data.keyword) !== null)
    		return 0;
        store.setItem(data);
        return 1;
    },
    
	addItem: function(keyword, name, url, enabled) {
        var data = {keyword:keyword,name:name,url:url,enabled:enabled};
        store.setItem(data);
        return;
    },
    
    addCheckItem: function(keyword, name, url, enabled) {
        var data = {keyword:keyword,name:name,url:url,enabled:enabled};
        store.setCheckItem(data);
        return;
    },
    
    removeItem: function(key) {
        localStorage.removeItem(key);
        return;
    },
    
    each: function(fn) {
    	for (var i=0; i < localStorage.length; i++) {
        	var data = store.getItem(localStorage.key(i));
            fn(data);
        }
        return;
    },
    
    upgrade: function() {
        store.each(function(data) {
			if (!data.name) {
				data.name = data.keyword;
				store.setItem(data);
			}
        });
        return;
    },
    
    clear: function() {
    	localStorage.clear();
    	return;
    }
};