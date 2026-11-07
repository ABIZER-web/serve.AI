import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { Users, UserPlus, Shield, ShieldCheck, Mail, Phone, Trash2, ChefHat, Bell, Coffee } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const StaffManagement = () => {
  const { user, switchRole } = useAuth();
  const { staff, addStaff, restaurant } = useRestaurant();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState('waiter');
  const [inviteStation, setInviteStation] = useState('Floor & Tables');

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    addStaff({
      name: inviteName,
      email: inviteEmail,
      phone: invitePhone || '+91 99999 00000',
      role: inviteRole,
      station: inviteStation,
    });

    setIsInviteOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'owner': return 'primary';
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      case 'kitchen': return 'info';
      case 'waiter': return 'success';
      case 'cashier': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
            Staff & Workers ({restaurant.name})
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Role-Based Access Control (RBAC): Kitchen Chefs, Floor Waiters, Cashiers & Managers.
          </p>
        </div>

        <Button onClick={() => setIsInviteOpen(true)} icon={UserPlus} size="sm" variant="primary" className="text-xs font-bold">
          Add New Worker
        </Button>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-secondary-900 rounded-3xl border border-gray-100 dark:border-secondary-800 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-secondary-800/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-100 dark:border-secondary-800">
            <tr>
              <th className="p-4">Staff Member</th>
              <th className="p-4">Contact Info</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4">Station / Duty</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Switch Active Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-secondary-800 font-medium text-secondary-800 dark:text-gray-200">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-secondary-800/50 transition">
                <td className="p-4 font-bold text-secondary-900 dark:text-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xs">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold">{member.name}</div>
                      <div className="text-[10px] text-gray-400 capitalize">{member.role}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-gray-500">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs">{member.phone}</span>
                    <span className="text-[10px] text-gray-400">{member.email}</span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant={getRoleBadgeVariant(member.role)} size="sm">
                    {member.role.toUpperCase()}
                  </Badge>
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-300">
                  {member.station || 'General Floor Duty'}
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>On Shift</span>
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => switchRole(member.role)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Test as {member.role}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Worker Modal */}
      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Add Staff / Worker" maxWidth="max-w-md">
        <form onSubmit={handleInvite} className="space-y-3 font-sans text-xs">
          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. Marco Rossi"
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={invitePhone}
              onChange={(e) => setInvitePhone(e.target.value)}
              placeholder="+91 98888 77777"
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="worker@cafehighfive.com"
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Role (Permissions)
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              >
                <option value="waiter">Waiter (Floor Orders & Requests)</option>
                <option value="kitchen">Kitchen Chef (KDS Screen)</option>
                <option value="cashier">Barista / Cashier (POS & Billing)</option>
                <option value="manager">Floor Manager (Reports & Menu)</option>
                <option value="admin">Admin (Full Control)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Assigned Station
              </label>
              <input
                type="text"
                value={inviteStation}
                onChange={(e) => setInviteStation(e.target.value)}
                placeholder="e.g. Coffee Bar, Grill, Terrace"
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)} className="flex-1 text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1 text-xs font-bold">
              Add Staff Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
