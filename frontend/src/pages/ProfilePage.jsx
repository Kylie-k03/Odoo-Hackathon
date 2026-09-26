import { UserCircle, Shield, KeyRound, LogOut, CheckCircle2 } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { PageHeader } from '../components/layout/PageHeader'

export function ProfilePage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="My Profile & Security"
        description="User account credentials, assigned warehouse roles, and authentication settings."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* User Card */}
        <Card className="text-center p-5 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center text-xl font-bold mb-3 shadow-2xs">
            AD
          </div>
          <h2 className="text-base font-bold text-slate-900">Arya Dixit</h2>
          <p className="text-xs text-slate-500 mb-3 font-mono">arya.dixit@example.com</p>
          <div className="flex items-center gap-1.5 mb-5">
            <Badge variant="primary" size="md">Inventory Manager</Badge>
            <Badge variant="done" size="md" dot>Active</Badge>
          </div>

          <div className="w-full text-left border-t border-slate-100 pt-3.5 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Default Site:</span>
              <span className="font-semibold text-slate-800">Main Warehouse (WH-MAIN)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Access Level:</span>
              <span className="font-semibold text-slate-800">Full Approval & Config</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Security Tier:</span>
              <span className="font-semibold text-teal-700">Role-Based Access (Manager)</span>
            </div>
          </div>

          <div className="w-full mt-5 pt-3.5 border-t border-slate-100">
            <Button variant="danger" size="sm" icon={LogOut} className="w-full">
              Sign Out
            </Button>
          </div>
        </Card>

        {/* Security / OTP Reset Card (Member 3 Ready) */}
        <Card
          className="md:col-span-2"
          title="Security & Credentials"
          subtitle="OTP-based password reset per the official Odoo hackathon brief"
        >
          <div className="space-y-3.5">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1">
                <KeyRound className="w-4 h-4 text-teal-700" />
                <span>OTP-Based Password Reset</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Request a one-time verification passcode sent to your registered email or phone to securely update credentials without administrative intervention.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="subtle">
                  Request OTP Passcode
                </Button>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1">
                <Shield className="w-4 h-4 text-teal-700" />
                <span>Role-Based Access Control (RBAC) Permissions</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are currently authenticated as an <strong>Inventory Manager</strong>. You have permissions to create/validate documents, configure locations, and approve stock adjustments. Warehouse staff accounts are restricted to execution operations (pick/pack/count).
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
