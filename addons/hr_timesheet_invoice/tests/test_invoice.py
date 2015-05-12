from openerp.tests import common


class TestInvoice(common.TransactionCase):

    def test_reinvoice_with_expense(self):
        """ Create 3 analytic lines with different journals and
        ensure only 1 invoice is created
        """
        # create an analytic account
        self.analytic_account_obj = self.registry('account.analytic.account')
        self.aa_id = self.analytic_account_obj.create(self.cr, self.uid, {
            'name': 'Project to invoice',
            'company_id': self.ref('base.main_company'),
            'partner_id': self.ref('base.res_partner_2'),
            'pricelist_id': self.ref('product.list0'),
            })

        # create several timesheet lines for a project
        line_ids = []
        self.analytic_line_obj = self.registry('account.analytic.line')
        line_ids.append(self.analytic_line_obj.create(self.cr, self.uid, {
            'account_id': self.aa_id,
            'amount': -1.0,
            'general_account_id': self.ref('account.a_expense'),
            'journal_id': self.ref('hr_timesheet.analytic_journal'),
            'name': 'work1',
            'product_id': self.ref('product.product_product_consultant'),
            'product_uom_id': self.ref('product.product_uom_hour'),
            'to_invoice': self.ref('hr_timesheet_invoice.timesheet_invoice_factor1'),
            'unit_amount': 2,
            }))
        line_ids.append(self.analytic_line_obj.create(self.cr, self.uid, {
            'account_id': self.aa_id,
            'amount': -1.0,
            'general_account_id': self.ref('account.a_expense'),
            'journal_id': self.ref('hr_timesheet.analytic_journal'),
            'name': 'work2',
            'product_id': self.ref('product.product_product_consultant'),
            'product_uom_id': self.ref('product.product_uom_hour'),
            'to_invoice': self.ref('hr_timesheet_invoice.timesheet_invoice_factor1'),
            'unit_amount': 2,
            }))
        # create expense lines for reinvoincing
        line_ids.append(self.analytic_line_obj.create(self.cr, self.uid, {
            'account_id': self.aa_id,
            'amount': -1.0,
            'general_account_id': self.ref('account.a_expense'),
            'journal_id': self.ref('account.sit'),
            'name': 'expense',
            'product_id': self.ref('product.product_product_consultant'),
            'product_uom_id': self.ref('product.product_uom_unit'),
            'to_invoice': self.ref('hr_timesheet_invoice.timesheet_invoice_factor1'),
            'unit_amount': 12,
            }))
        # create the invoice
        wizard_obj = self.registry('hr.timesheet.invoice.create')
        wizard_id = wizard_obj.create(self.cr, self.uid, {
            'date': True,
            'name': True,
            'price': True,
            'time': True,
            }, context={'active_ids': line_ids})
        act_win = wizard_obj.do_create(self.cr, self.uid,
                                       [wizard_id], context={'active_ids': line_ids})
        invoice_obj = self.registry('account.invoice')
        invoice_ids = invoice_obj.search(self.cr, self.uid, act_win['domain'])
        invoices = invoice_obj.browse(self.cr, self.uid, invoice_ids)
        # we have only one invoice
        self.assertEquals(1, len(invoices))
