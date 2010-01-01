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
                    var undoable = (opts.showUndo || $.fn.undoable.showUndo).call(target, undoData, opts);

                    undoable.find('.undo a').click(function() {
                        var data = (opts.getUndoPostData || $.fn.undoable.getUndoPostData).call($this, target);
                        $.fn.undoable.postToServer.call($this, opts.undoUrl || url, data, function() {
                            (opts.hideUndo || $.fn.undoable.hideUndo).call(undoable, target);
                        });
                        return false;
                    });
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

    $.fn.undoable.getUndoPostData = function(target) {
        return $.fn.undoable.getPostData.call(this, target);
    };

    $.fn.undoable.showUndo = function(data, options) {
        var target = this;
        var message = (options.formatStatus || $.fn.undoable.formatStatus)(data);

        if (target[0].tagName === 'TR') {
            var colSpan = target.children('td').length;
            target.after('<tr class="undoable"><td class="status" colspan="' + (colSpan - 1) + '">'
                    + message + '</td><td class="undo"><a href="#' + data.id + '">undo</a></td></tr>');
        }
        else {
            var tagName = target[0].tagName;
            var classes = target.attr('class');
            target.after('<div class="undoable ' + classes + '"><p class="status">' + message + '</p><p class="undo"><a href="#' + data.id + '">undo</a></p></div>');
        }

        var undoable = target.next().hide().fadeIn('slow').show();
        if (target.inlineStyling) {
            (options.applyUndoableStyle || $.fn.undoable.applyUndoableStyle).call(undoable);
        }
        return undoable;
    };

    $.fn.undoable.hideUndo = function(target) {
        var undoable = this;
        undoable.remove();
        target.fadeIn('slow').show();
        return target;
    };

    $.fn.undoable.formatStatus = function(data) {
        return '<strong class="subject">' + data.subject + '</strong> <span class="predicate">' + data.predicate + '</span>';
    };

    $.fn.undoable.applyUndoableStyle = function() {
        this.css('backgroundColor', '#e0e0e0');
        this.css('color', '#777777');
        var styled = this;
        if (this[0].tagName === 'TR') {
            styled = this.children('td');
            this.children('td:first').css('borderLeft', 'solid 2px #bbbbbb');
        }
        else {
            styled.css('borderLeft', 'solid 2px #bbbbbb');
        }
        styled.css('text-align', 'center');
        styled.css('borderTop', 'solid 2px #bbbbbb');
        styled.css('borderBottom', 'solid 1px #cccccc');
    };

    $.fn.undoable.postToServer = function(url, data, success) {
        if (url) {
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: data,
                success: success
            });
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