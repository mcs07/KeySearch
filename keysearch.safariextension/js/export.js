$(function() {
	var exportField = $('#data');
	var dataArray = new Array();
	Store.each(function(data) {
		dataArray.push(data);
	});
	exportField.val(JSON.stringify(dataArray, null, 4));
	
	exportField.click(function() {
		this.focus();
		this.select();
	});
	
});