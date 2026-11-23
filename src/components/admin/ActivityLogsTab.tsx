import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Clock,
  Shield,
  RefreshCw,
  PlusCircle,
  Edit3,
  Trash2,
  RotateCcw,
  Sparkles,
  Settings,
  Database,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { safeParseJsonResponse } from '../../lib/api';
import type { ActivityLog } from '../../types';

export const ActivityLogsTab: React.FC = () => {
  const { token } = useApp();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/activity-logs?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const parsed = await safeParseJsonResponse<ActivityLog[]>(res);
      if (parsed.ok && Array.isArray(parsed.data)) {
        setLogs(parsed.data);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action: ActivityLog['action']) => {
    switch (action) {
      case 'create':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 text-[10px] inline-flex items-center gap-1">
            <PlusCircle className="w-3 h-3" />
            <span>ایجاد</span>
          </span>
        );
      case 'update':
        return (
          <span className="px-2 py-0.5 rounded-full bg-sky-950/40 text-sky-400 border border-sky-800/30 text-[10px] inline-flex items-center gap-1">
            <Edit3 className="w-3 h-3" />
            <span>ویرایش</span>
          </span>
        );
      case 'delete':
        return (
          <span className="px-2 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-800/30 text-[10px] inline-flex items-center gap-1">
            <Trash2 className="w-3 h-3" />
            <span>حذف</span>
          </span>
        );
      case 'restore':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-400 border border-amber-800/30 text-[10px] inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            <span>بازیابی</span>
          </span>
        );
      case 'settings_change':
        return (
          <span className="px-2 py-0.5 rounded-full bg-purple-950/40 text-purple-400 border border-purple-800/30 text-[10px] inline-flex items-center gap-1">
            <Settings className="w-3 h-3" />
            <span>تنظیمات</span>
          </span>
        );
      case 'backup_restore':
        return (
          <span className="px-2 py-0.5 rounded-full bg-blue-950/40 text-blue-400 border border-blue-800/30 text-[10px] inline-flex items-center gap-1">
            <Database className="w-3 h-3" />
            <span>پشتیبان</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px]">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-light text-[#EDE8DF] font-vazir flex items-center gap-2">
            <History className="w-5 h-5 text-[#C5A059]" />
            <span>تاریخچه فعالیت‌ها و ثبت رویدادهای مدیریت (Audit Trail)</span>
          </h2>
          <p className="text-xs text-[#8C8880] mt-1 leading-relaxed">
            ثبت خودکار تمامی عملیات ایجاد، ویرایش، حذف، بازیابی و تغییرات تنظیمات همراه با زمان و کاربر
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="px-3.5 py-2 bg-[#121216] hover:bg-[#1A1A22] text-[#C5A059] border border-[#C5A059]/20 rounded-sm text-xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تازه‌سازی رویدادها</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[#8C8880] flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#C5A059] animate-spin" />
            <span className="text-xs">در حال دریافت تاریخچه رویدادها...</span>
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#121216] border-b border-[#C5A059]/15 text-[#C5A059] font-cinzel">
                <tr>
                  <th className="p-3 text-start">زمان رویداد</th>
                  <th className="p-3 text-start">کاربر</th>
                  <th className="p-3 text-start">نوع عملیات</th>
                  <th className="p-3 text-start">بخش مربوطه</th>
                  <th className="p-3 text-start">عنوان / هدف</th>
                  <th className="p-3 text-start">شرح عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A059]/10">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#121218] transition-colors">
                    <td className="p-3 text-[11px] text-[#8C8880] font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('fa-IR')}
                    </td>
                    <td className="p-3 font-medium text-[#EDE8DF]">{log.user || 'مدیر'}</td>
                    <td className="p-3">{getActionBadge(log.action)}</td>
                    <td className="p-3 text-[#A8A49C] capitalize">{log.entityType}</td>
                    <td className="p-3 text-[#EDE8DF] font-medium">{log.entityTitle || '-'}</td>
                    <td className="p-3 text-[#A8A49C] leading-relaxed max-w-md">{log.details || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-[#8C8880]">
            <History className="w-10 h-10 text-[#C5A059]/40 mx-auto mb-2" />
            <p className="text-sm font-vazir text-[#EDE8DF]">هنوز رویدادی ثبت نشده است</p>
          </div>
        )}
      </div>
    </div>
  );
};
