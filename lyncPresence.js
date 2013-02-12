// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
//globals ActiveXObject
;(function ($, window, document, undefined) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "lyncPresence",
        defaults = {
            sipAttr: 'href',
            sip: null,
            show: 'mouseover',
            hide: 'mouseout',
            className: 'lyncPresence',
            statuses: ['available', 'offline', 'away', 'busy', 'away', 'dnd', 'away', 'unknown', 'unknown', 'dnd', 'unknown', 'unknown', 'unknown', 'unknown', 'unknown', 'unknown', 'away']
        };

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;

        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {

        init: function () {            
            this.transform(this.element, this.options);
        },

        transform: function (el, options) {
            var nameCtrl = null,
                onStatusChange = null,
                $el = null,
                sip = "";

            if (typeof (ActiveXObject) === "function") {
                $el = $(el);
                sip = options.sip || $el.attr(options.sipAttr);
                nameCtrl = new ActiveXObject('Name.NameCtrl.1');
                                
                //updates icon on status change
                onStatusChange = function (sip, statusId, id) {
                    //console.log(name + ", " + statusId + ", " + id);

                    $el.removeClass(options.statuses.join(" ")).addClass(options.statuses[statusId]);
                };

                if (nameCtrl.PresenceEnabled) {
                    nameCtrl.OnStatusChange = onStatusChange;
                    nameCtrl.GetStatus(sip, "1");
                }

                $el
                    .addClass(options.lyncPresence)
                    .addClass(options.statuses[7]) //default to unknown;
                    .addClass(options.className)
                    .bind(options.show, function (e) {
                        //var $this = $(this);
                        nameCtrl.ShowOOUI(sip, 0, e.clientX, e.clientY);
                    })
                    .bind(options.hide, function () {
                        nameCtrl.HideOOUI();
                    });
            }
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);
