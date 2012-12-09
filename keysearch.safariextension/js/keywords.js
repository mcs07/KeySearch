$(function() {
	Store.upgrade();
	Store.each(addToList);
	sortList(0);
	$('#enabled').iphoneStyle({resizeContainer: false, resizeHandle: false});
	$('#plusButton').click(function() {
		markCurrent($('#new'));
		$('nav').prop('scrollTop', $('nav').prop('scrollHeight'));
		bindNewForm();
	}).click();
	$('#actionButton').prop('selectedIndex', -1).click(function() {
		if ($(this).val()) {
			Pop.transition($(this).val());
		}
	});
	$('form input').bind('keyup change', validate);
	$('#keyword').blur(function() {
		var name = $('#name');
		if (!name.val()) {
			name.val($(this).val());
		}
	});
	Pop.shortcutInit();
});

function addToList(data) {
	$('ul').append(
		$('<li id="item-'+data.keyword+'">').append(
			$('<span class="listLink'+(data.enabled?'':' disabled')+'" data-keyword="'+data.keyword+'">'+data.name+'</span>').click(function() {
				markCurrent($(this));
				var data = Store.getItem($(this).attr('data-keyword'));
				bindEditForm(data);
			}),
			$('<span class="delete" data-keyword="'+data.keyword+'">[delete]</span>').click(function(){
				var li = $(this).parent(),
					link = $(this).prev();
				if (link.hasClass('current')) {
					var prev = li.prev(),
						next = li.next(),
						target = $('#plusButton');
					if (next[0]) {
						target = next.children('span').eq(0);
					} else if (prev[0]) {
						target = prev.children('span').eq(0);
					}
					target.click();
				}
				li.fadeOut(400, function() {
					li.remove();
				}); 
				Store.removeItem($(this).attr('data-keyword'));
			})
		)
	)
}

function bindEditForm(data) {
	const form = dataToForm(data);
	$('.iPhoneCheckContainer').show();
	$('#keyword').width(200);
	$('#save').attr('disabled', true);
	if (data.keyword == 'default') {
		$('#name, #keyword, #shortcut').attr('disabled', true);
	} else {
		$('#name, #keyword, #shortcut').attr('disabled', false);
	}
	Pop.displayShortcut();
	validate();
 	var oldKey = data.keyword;
 	form.unbind('submit').bind('submit', function(){
 		data = formToData(this);
 		if (data.keyword && data.url) {
 			Store.removeItem(oldKey);
 			Store.setItem(data);
 			key = data.keyword;
 			var li = $('#item-'+oldKey);
 			li.attr('id', 'item-'+key);
 			var link = li.children('span').eq(0);
 			link.text(data.name);
 			link.attr('data-keyword', key);
 			link.removeClass('disabled');
 			if (!data.enabled)
 				link.addClass('disabled');
 			deleteLink = li.children('span').eq(1);
 			deleteLink.attr('data-keyword', key);			
 			oldKey = key;
 			sortList(1000);
 		}
 		return false;
 	});
}

function bindNewForm() {
	const form = $('form'),
		  enabled = $('#enabled');
	form[0].reset();
	$('#save').attr('disabled', true);
	$('#name, #keyword, #shortcut').attr('disabled', false);
	enabled.prop('checked', true).change();
	$('.iPhoneCheckContainer').hide();
	$('#keyword').width(296);
	Pop.displayShortcut();
	validate();
	form.unbind('submit').bind('submit', function(){
		var data = formToData(this);
		if (data.keyword && data.url) {
			Store.setItem(data);
			addToList(data);
			$('#item-'+data.keyword).children('span').eq(0).click();
			sortList(1000);
		}
		return false;
	});
}

function markCurrent(element) {
	$('.current').removeClass('current');
	element.addClass('current');
}

function formToData(form) {
	var data = {};
	$(':input', form).not('#save, #shortcutDisplay').each(function(i, n) {
		if (n.type == 'checkbox') {
			data[n.name] = $(n).prop('checked');
		} else {
			data[n.name] = $(n).val();
		}
	});
	return data;
}

function dataToForm(data) {
	const form = $('form');
	$.each(data, function(i, n) {
		var el = $('#'+i);
		if (el.attr('type') == 'checkbox') {
			if (el.prop('checked') != n) {
				console.log('need to change');
				el.prop('checked', !el.is(':checked')).change();
			}
		} else {
			el.val(n);
		}
	});
	return form;
}

function sortList(dur) {
	var liArray = [];
	$('aside li').each(function(i,n) {
 		liArray.push({pos:i, el:n, name:$(n).children().eq(0).text().toLowerCase()});
 	});
	liArray.sort(function(a, b){
 		var nameA=a.name, nameB=b.name;
 		if (nameA == 'default')
 			return -1; 
 		if (nameB == 'default')
 			return 1;
 		return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
 	});
 	var newOrder = [];
 	var newUl = $('<ul />');
 	$.each(liArray, function(i, n) {
 		newOrder.push(n.pos);
 		newUl.append(n.el);
 	});
 	$('ul').replaceWith(newUl);

	$.each(newOrder, function(oldPos, newPos) {
		var el = $('li:nth-child('+(oldPos+1)+')');
		el.css({'top':(newPos-oldPos)*el.outerHeight()+'px'});
		el.animate({
			top: '0px'
		}, dur);
	});
}

function validate() {
	const keyword = $('#keyword').val(),
		  url = $('#url').val(),
		  save = $('#save'),
		  error = $('#error');
	if (!keyword || !url) {
		save.attr('disabled', true);
		error.text('');
	} else if (keyword.indexOf(' ') != -1) {
		error.text('Keyword must not contain spaces');
		save.attr('disabled', true);
	} else if (keyword.substr(0,1) == '>') {
		error.text('Keyword must not start with >');
		save.attr('disabled', true);
	} else if (Store.getItem(keyword) && keyword != $('.current').attr('data-keyword')) {
		error.text('Keyword must be unique');
		save.attr('disabled', true);
	} else {
		error.text('');
		save.attr('disabled', false);
	}
	
	// TODO: Check for keyword shortcut clash
	// TODO: Don't allow keywords to start with @
}

function setShortcut(shortcut) {
	$('#shortcut').val(shortcut).blur();
}

const ext  = safari.extension;

// iPhone style checkbox jquery plugin
(function() {
  var iOSCheckbox;
  iOSCheckbox = (function() {
    function iOSCheckbox(elem, options) {
      var key, opts, value;
      this.elem = $(elem);
      opts = $.extend({}, iOSCheckbox.defaults, options);
      for (key in opts) {
        value = opts[key];
        this[key] = value;
      }
      this.wrapCheckboxWithDivs();
      this.attachEvents();
      this.disableTextSelection();
      if (this.resizeHandle) {
        this.optionallyResize('handle');
      }
      if (this.resizeContainer) {
        this.optionallyResize('container');
      }
      this.initialPosition();
    }
    iOSCheckbox.prototype.isDisabled = function() {
      return this.elem.is(':disabled');
    };
    iOSCheckbox.prototype.wrapCheckboxWithDivs = function() {
      this.elem.wrap("<div class='" + this.containerClass + "' />");
      this.container = this.elem.parent();
      this.offLabel = $("<label class='" + this.labelOffClass + "'>\n  <span>" + this.uncheckedLabel + "</span>\n</label>").appendTo(this.container);
      this.offSpan = this.offLabel.children('span');
      this.onLabel = $("<label class='" + this.labelOnClass + "'>\n  <span>" + this.checkedLabel + "</span>\n</label>").appendTo(this.container);
      this.onSpan = this.onLabel.children('span');
      return this.handle = $("<div class='" + this.handleClass + "'>\n  <div class='" + this.handleRightClass + "'>\n    <div class='" + this.handleCenterClass + "' />\n  </div>\n</div>").appendTo(this.container);
    };
    iOSCheckbox.prototype.disableTextSelection = function() {
      if ($.browser.msie) {
        return $([this.handle, this.offLabel, this.onLabel, this.container]).attr("unselectable", "on");
      }
    };
    iOSCheckbox.prototype.optionallyResize = function(mode) {
      var newWidth, offLabelWidth, onLabelWidth;
      onLabelWidth = this.onLabel.width();
      offLabelWidth = this.offLabel.width();
      if (mode === "container") {
        newWidth = onLabelWidth > offLabelWidth ? onLabelWidth : offLabelWidth;
        newWidth += this.handle.width() + this.handleMargin;
        return this.container.css({
          width: newWidth
        });
      } else {
        newWidth = onLabelWidth > offLabelWidth ? onLabelWidth : offLabelWidth;
        return this.handle.css({
          width: newWidth
        });
      }
    };
    iOSCheckbox.prototype.onMouseDown = function(event) {
      var x;
      event.preventDefault();
      if (this.isDisabled()) {
        return;
      }
      x = event.pageX || event.originalEvent.changedTouches[0].pageX;
      iOSCheckbox.currentlyClicking = this.handle;
      iOSCheckbox.dragStartPosition = x;
      return iOSCheckbox.handleLeftOffset = parseInt(this.handle.css('left'), 10) || 0;
    };
    iOSCheckbox.prototype.onDragMove = function(event, x) {
      var newWidth, p;
      if (iOSCheckbox.currentlyClicking !== this.handle) {
        return;
      }
      p = (x + iOSCheckbox.handleLeftOffset - iOSCheckbox.dragStartPosition) / this.rightSide;
      if (p < 0) {
        p = 0;
      }
      if (p > 1) {
        p = 1;
      }
      newWidth = p * this.rightSide;
      this.handle.css({
        left: newWidth
      });
      this.onLabel.css({
        width: newWidth + this.handleRadius
      });
      this.offSpan.css({
        marginRight: -newWidth
      });
      return this.onSpan.css({
        marginLeft: -(1 - p) * this.rightSide
      });
    };
    iOSCheckbox.prototype.onDragEnd = function(event, x) {
      var p;
      if (iOSCheckbox.currentlyClicking !== this.handle) {
        return;
      }
      if (this.isDisabled()) {
        return;
      }
      if (iOSCheckbox.dragging) {
        p = (x - iOSCheckbox.dragStartPosition) / this.rightSide;
        this.elem.prop('checked', p >= 0.5);
      } else {
        this.elem.prop('checked', !this.elem.prop('checked'));
      }
      iOSCheckbox.currentlyClicking = null;
      iOSCheckbox.dragging = null;
      return this.elem.change();
    };
    iOSCheckbox.prototype.onChange = function() {
      var new_left;
      if (this.isDisabled()) {
        this.container.addClass(this.disabledClass);
        return false;
      } else {
        this.container.removeClass(this.disabledClass);
      }
      new_left = this.elem.prop('checked') ? this.rightSide : 0;
      this.handle.animate({
        left: new_left
      }, this.duration);
      this.onLabel.animate({
        width: new_left + this.handleRadius
      }, this.duration);
      this.offSpan.animate({
        marginRight: -new_left
      }, this.duration);
      return this.onSpan.animate({
        marginLeft: new_left - this.rightSide
      }, this.duration);
    };
    iOSCheckbox.prototype.attachEvents = function() {
      var localMouseMove, localMouseUp, self;
      self = this;
      localMouseMove = function(event) {
        return self.onGlobalMove.apply(self, arguments);
      };
      localMouseUp = function(event) {
        self.onGlobalUp.apply(self, arguments);
        $(document).unbind('mousemove touchmove', localMouseMove);
        return $(document).unbind('mouseup touchend', localMouseUp);
      };
      this.container.bind('mousedown touchstart', function(event) {
        self.onMouseDown.apply(self, arguments);
        $(document).bind('mousemove touchmove', localMouseMove);
        return $(document).bind('mouseup touchend', localMouseUp);
      });
      return this.elem.bind("change", function() {
        return self.onChange.apply(self, arguments);
      });
    };
    iOSCheckbox.prototype.initialPosition = function() {
      var offset;
      this.offLabel.css({
        width: this.container.width() - this.containerRadius
      });
      offset = this.containerRadius + 1;
      if ($.browser.msie && $.browser.version < 7) {
        offset -= 3;
      }
      this.rightSide = this.container.width() - this.handle.width() - offset;
      if (this.elem.is(':checked')) {
        this.handle.css({
          left: this.rightSide
        });
        this.onLabel.css({
          width: this.rightSide + this.handleRadius
        });
        this.offSpan.css({
          marginRight: -this.rightSide
        });
      } else {
        this.onLabel.css({
          width: 0
        });
        this.onSpan.css({
          marginLeft: -this.rightSide
        });
      }
      if (this.isDisabled()) {
        return this.container.addClass(this.disabledClass);
      }
    };
    iOSCheckbox.prototype.onGlobalMove = function(event) {
      var x;
      if (!(!this.isDisabled() && iOSCheckbox.currentlyClicking)) {
        return;
      }
      event.preventDefault();
      x = event.pageX || event.originalEvent.changedTouches[0].pageX;
      if (!iOSCheckbox.dragging && (Math.abs(iOSCheckbox.dragStartPosition - x) > this.dragThreshold)) {
        iOSCheckbox.dragging = true;
      }
      return this.onDragMove(event, x);
    };
    iOSCheckbox.prototype.onGlobalUp = function(event) {
      var x;
      if (!iOSCheckbox.currentlyClicking) {
        return;
      }
      event.preventDefault();
      x = event.pageX || event.originalEvent.changedTouches[0].pageX;
      return this.onDragEnd(event, x);
    };
    iOSCheckbox.defaults = {
      duration: 200,
      checkedLabel: 'ON',
      uncheckedLabel: 'OFF',
      resizeHandle: true,
      resizeContainer: true,
      disabledClass: 'iPhoneCheckDisabled',
      containerClass: 'iPhoneCheckContainer',
      labelOnClass: 'iPhoneCheckLabelOn',
      labelOffClass: 'iPhoneCheckLabelOff',
      handleClass: 'iPhoneCheckHandle',
      handleCenterClass: 'iPhoneCheckHandleCenter',
      handleRightClass: 'iPhoneCheckHandleRight',
      dragThreshold: 5,
      handleMargin: 15,
      handleRadius: 4,
      containerRadius: 5
    };
    return iOSCheckbox;
  })();
  $.iphoneStyle = this.iOSCheckbox = iOSCheckbox;
  $.fn.iphoneStyle = function(options) {
    var checkbox, _i, _len, _ref;
    _ref = this.filter(':checkbox');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      checkbox = _ref[_i];
      $(checkbox).data("iphoneStyle", new iOSCheckbox(checkbox, options));
    }
    return this;
  };
  $.fn.iOSCheckbox = function(options) {
    var checkbox, opts, _i, _len, _ref;
    if (options == null) {
      options = {};
    }
    opts = $.extend({}, options, {
      resizeHandle: false,
      disabledClass: 'iOSCheckDisabled',
      containerClass: 'iOSCheckContainer',
      labelOnClass: 'iOSCheckLabelOn',
      labelOffClass: 'iOSCheckLabelOff',
      handleClass: 'iOSCheckHandle',
      handleCenterClass: 'iOSCheckHandleCenter',
      handleRightClass: 'iOSCheckHandleRight'
    });
    _ref = this.filter(':checkbox');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      checkbox = _ref[_i];
      $(checkbox).data("iOSCheckbox", new iOSCheckbox(checkbox, opts));
    }
    return this;
  };
}).call(this);
