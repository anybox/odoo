odoo.define('sale.tour', function(require) {
"use strict";

var core = require('web.core');
var tour = require('web_tour.tour');

var _t = core._t;

tour.register('sale_tour', [{
    trigger: '.o_app[data-menu-xmlid="sales_team.menu_base_partner"], .oe_menu_toggler[data-menu-xmlid="sales_team.menu_base_partner"]',
    content: _t('Organize your sales activities with the <b>Sales app</b>.'),
    position: 'bottom',
}, {
    trigger: ".oe_kanban_action_button",
    extra_trigger: '.o_salesteam_kanban',
    content: _t("Let\'s have a look at the quotations of this sales team."),
    position: "bottom"
}, {
    trigger: ".btn-primary.o_sale_confirm",
    extra_trigger: '.o_sale_order',
    content: _t("<p><b>Confirm the order</b> if the customer purchases.</p><p><i>The customer can also confirm the order directly from the email he received.</i></p>"),
    position: "bottom"
}, {
    trigger: ".breadcrumb li:not(.active):last",
    extra_trigger: ".o_sale_order [data-id='sale'].btn-primary, .o_sale_order [data-id='sale'].oe_active",
    content: _t("Use the breadcrumbs to <b>go back to preceeding screens</b>."),
    position: "bottom"
}, {
    trigger: 'li a[data-menu-xmlid="sales_team.menu_sales"], .oe_secondary_menu_section[data-menu-xmlid="sales_team.menu_sales"]',
    content: _t("Use this menu to access quotations, sales orders and customers."),
    edition: "enterprise",
    position: "bottom"
}, {
    trigger: ".o_main_navbar .o_menu_toggle",
    content: _t('Click the <i>Home icon</i> to navigate across apps.'),
    edition: "enterprise",
    position: "bottom"
}, {
    trigger: '.o_app[data-menu-xmlid="base.menu_administration"], .oe_menu_toggler[data-menu-xmlid="base.menu_administration"]',
    content: _t("Configuration options are available in the Settings app."),
    position: "bottom"
}, {
    trigger: ".o_web_settings_dashboard textarea#user_emails",
    content: _t("<b>Invite salespeople or managers</b> via email.<br/><i>Enter one email per line.</i>"),
    position: "right"
}]);

});
