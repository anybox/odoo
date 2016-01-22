from openerp.osv import orm
from openerp import netsvc

class hr_payslip_confirm(orm.TransientModel):
    _name = 'hr.payslip.confirm'
    _description = 'Confirm payslips'

    def process(self, cr, uid, ids, context=None):
        wf_service = netsvc.LocalService("workflow")
        for slip_id in context['active_ids']:
            wf_service.trg_validate(uid, 'hr.payslip', slip_id, 'hr_verify_sheet', cr)
