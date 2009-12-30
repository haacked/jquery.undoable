(function($) {
    $.fn.undoable = function(options) {
        var opts = $.extend({}, $.fn.undoable.defaults, options);

        return this.each(function(i) {
            $this = $(this);

            $this.click(function() {
                var $this = $(this);
                var target = (opts.getTarget || $.fn.undoable.getTarget).call($this);
                var url = opts.url;
                var data = (opts.getPostData || $.fn.undoable.getPostData).call($this, target);

                $.fn.undoable.postToServer.call($this, url, data, function(response) {
                    var undoData = $.extend(response, data);
                    target.hide();
                    target.inlineStyling = opts.inlineStyling;
                    $.fn.undoable.showUndo.call(target, undoData, opts);
                });

                return false;
            });
        });
    };

    $.fn.undoable.getTarget = function() {
        var tr = this.closest('tr');
        if (tr.length === 0) {
            return this.closest('div.target');
        }
        return tr;
    };

    $.fn.undoable.getPostData = function(target) {
        return { id: this.attr('href').substr(1) };
    };

    $.fn.undoable.showUndo = function(data, options) {
        var message = (options.formatStatus || $.fn.undoable.formatStatus)(data);

        if (this[0].tagName === 'TR') {
            var colSpan = this.children('td').length;
            this.after('<tr class="undoable"><td class="status" colspan="' + (colSpan - 1) + '">'
                    + message + '</td><td class="undo"><a href="#' + data.id + '">undo</a></td></tr>');
        }
        else {
            this.after(this.clone().addClass('undoable'));
        }

        var undoable = this.next();
        if (this.inlineStyling) {
            (options.applyUndoableStyle || $.fn.undoable.applyUndoableStyle).call(undoable);
        }
        return undoable;
    };

    $.fn.undoable.formatStatus = function(data) {
        return '<strong class="subject">' + data.subject + '</strong> <span class="predicate">' + data.predicate + '</span>';
    };

    $.fn.undoable.applyUndoableStyle = function() {
        this.css('backgroundColor', '#e0e0e0');
        this.css('color', '#777777');
        this.css('borderTop', 'solid 2px #bbbbbb');
        this.css('borderLeft', 'solid 2px #bbbbbb');
        this.css('borderBottom', 'solid 1px #cccccc');
    };

    $.fn.undoable.postToServer = function(url, data, success) {
        if (url) {
            //
        }
        else {
            // demo mode
            success({ subject: 'The item', predicate: 'has been removed' });
        }
    };

    $.fn.undoable.defaults = {
        /* Applies some default styling if true. If false, all styling is done via CSS class */
        inlineStyling: true
    };

})(jQuery);