odoo.define('web_editor.editor', function (require) {
"use strict";

var ajax = require('web.ajax');
var Dialog = require('web.Dialog');
var Widget = require('web.Widget');
var core = require('web.core');
var base = require('web_editor.base');
var rte = require('web_editor.rte');

var qweb = core.qweb;
var _t = core._t;
var editor = {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////

editor.dummy = function () {return true;}; // used for snippets, options...

editor.editable = !!$('html').data('editable');

ajax.loadXML('/web_editor/static/src/xml/editor.xml', qweb);

$(document).on('click', '.note-editable', function (ev) {
    ev.preventDefault();
});

$(document).on('submit', '.note-editable form .btn', function (ev) {
    ev.preventDefault(); // Disable form submition in editable mode
});

$(document).on('hide.bs.dropdown', '.dropdown', function (ev) {
    // Prevent dropdown closing when a contenteditable children is focused
    if (ev.originalEvent
            && $(ev.target).has(ev.originalEvent.target).length
            && $(ev.originalEvent.target).is('[contenteditable]')) {
        ev.preventDefault();
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////

editor.reload = function () {
    location.hash = "scrollTop=" + window.document.body.scrollTop;
    if (location.search.indexOf("enable_editor") > -1) {
        window.location.href = window.location.href.replace(/&?enable_editor(=[^&]*)?/g, '');
    } else {
        window.location.reload(true);
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////

/* ----- TOP EDITOR BAR FOR ADMIN ---- */

base.ready().then(function () {
    if (editor.editable && location.search.indexOf("enable_editor") >= 0) {
        editor.editor_bar = new editor.Class();
        editor.editor_bar.prependTo(document.body);
    }
});

editor.Class = Widget.extend({
    template: 'web_editor.editorbar',
    events: {
        'click button[data-action=save]': 'save',
        'click button[data-action=cancel]': 'cancel',
    },
    init: function (parent) {
        var self = this;
        var res = this._super.apply(this, arguments);
        this.parent = parent;
        this.rte = new rte.Class(this);
        this.rte.on('rte:start', this, function () {
            self.trigger('rte:start');
        });
        return res;
    },
    start: function () {
        $('.dropdown-toggle').dropdown();

        this.display_placeholder();

        this.rte.on('change', this, this.proxy('rte_changed'));
        this.rte.start();

        var flag = false;
        window.onbeforeunload = function (event) {
            if (rte.history.getEditableHasUndo().length && !flag) {
                flag = true;
                _.defer(function () { flag=false; });
                return _t('This document is not saved!');
            }
        };

        return this._super.apply(this, arguments);
    },
    display_placeholder: function () {
        var $area = $("#wrapwrap").find("[data-oe-model] .oe_structure.oe_empty, [data-oe-model].oe_structure.oe_empty, [data-oe-type=html]")
            .filter(".oe_not_editable")
            .filter(".oe_no_empty");

        this.on('rte:start', this, function () {
            $area.attr("data-oe-placeholder", _t("Write Your Text Here"));
        });
        this.on("snippets:ready", this, function () {
            if ($("body").hasClass("editor_has_snippets")) {
                $area.attr("data-oe-placeholder", _t("Write Your Text or Drag a Block Here"));
            }
        });

        $(document).on("keyup", function (event) {
            if((event.keyCode === 8 || event.keyCode === 46)) {
                var $target = $(event.target).closest(".o_editable");
                if(!$target.is(":has(*:not(p):not(br))") && !$target.text().match(/\S/)) {
                    $target.empty();
                }
            }
        });
    },
    rte_changed: function () {},
    save: function () {
        return this.rte.save().then(function () {
            editor.reload();
        });
    },
    /**
     * Saves an RTE content, which always corresponds to a view section (?).
     */
    save_without_reload: function () {
        return this.rte.save();
    },
    cancel: function () {
        return new $.Deferred(function (d) {
            if (!rte.history.getEditableHasUndo().length) {
                return d.resolve();
            }
            var confirm = Dialog.confirm(null, _t("If you discard the current edition, all unsaved changes will be lost. You can cancel to return to the edition mode."), {
                confirm_callback: d.resolve.bind(d)
            });
            confirm.on("closed", d, d.reject);
        }).then(function () {
            window.onbeforeunload = null;
            editor.reload();
        });
    },
});

return editor;
});
