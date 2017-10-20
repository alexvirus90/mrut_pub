;(function($, window, document, undefined) {

	// Create the defaults once
	var pluginName = "addClear",
		defaults = {
			closeSymbol: "&#10006;",
			color: "#CCC",
			top: 10,
			right: 4,
			returnFocus: true,
			showOnLoad: false,
			onClear: null,
			hideOnBlur: false,
			tabbable: true,
			// paddingRight: '20px',
			lineHeight: '1',
			display: "block"
		};

	// The actual plugin constructor
	function Plugin(element, options) {
		this.element = element;

		this.options = $.extend({}, defaults, options);

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

	Plugin.prototype = {

		init: function() {
			var $this = $(this.element),
					$clearButton,
					me = this,
					options = this.options;

			var tabIndex = options.tabbable ? "" : " tabindex='-1'";
			$clearButton = $("<a href='#clear' style='display: none;'" + tabIndex + ">" + options.closeSymbol + "</a>");
			$this.after($clearButton);
			$this.next().css({
				color: options.color,
				textDecoration: 'none',
				display: 'none',
				overflow: 'hidden',
				position: 'absolute',
				right: options.right,
				top: options.top,
				lineHeight: options.lineHeight
			}, this);

			if ($this.val().length >= 1 && options.showOnLoad === true) {
				$clearButton.css({display: options.display});
			}

			$this.focus(function() {
				if ($(this).val().length >= 1) {
					$clearButton.css({display: options.display});
				}
			});

			$this.blur(function(e) {
				if (options.hideOnBlur) {
					setTimeout(function() {
						var relatedTarget = e.relatedTarget || e.explicitOriginalTarget || document.activeElement;
						if (relatedTarget !== $clearButton[0]) {
							$clearButton.css({display: 'none'});
						}
					}, 0);
				}
			});

			var handleUserInput = function() {
				if ($(this).val().length >= 1) {
					$clearButton.css({display: options.display});
				} else {
					$clearButton.css({display: 'none'});
				}
			};

			var handleInput = function () {
			    $this.off('keyup', handleUserInput);
				$this.off('cut', handleUserInput);
				handleInput = handleUserInput;
				handleUserInput.call(this);
			};

			$this.on('keyup', handleUserInput);

			$this.on('cut', function () {
				var self = this;
				setTimeout(function () {
					handleUserInput.call(self);
				}, 0);
			});

			$this.on('input', function () {
				handleInput.call(this);
			});

			if (options.hideOnBlur) {
				$clearButton.blur(function () {
					$clearButton.css({display: 'none'});
				});
			}

			$clearButton.click(function(e) {
				var $input = $(me.element);
				$input.val("");
				$(this).css({display: 'none'});
				if (options.returnFocus === true) {
					$input.focus();
				}
				if (options.onClear) {
					options.onClear($input);
				}
				e.preventDefault();
			});
		}
	};

	$.fn[pluginName] = function(options) {
		return this.each(function() {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName,
					new Plugin(this, options));
			}
		});
	};

})(jQuery, window, document);