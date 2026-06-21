'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  Loader2, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight,
  Video, Clock, CheckCircle2, XCircle, AlertTriangle, PlayCircle, Calendar,
  Link as LinkIcon, AlertCircle, RefreshCw, Repeat, Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import RecurringScheduleDialog from './RecurringScheduleDialog';
import ConfirmAttendanceDialog from './ConfirmAttendanceDialog';

// ── Types ─────────────────────────────────────────────
interface Session {
  id: string;
  studentId: string;
  teacherId?: string;
  bookingId?: string;
  title: string;
  date: string;
  duration: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  meetingLink?: string;
  platform?: 'ZOOM' | 'GOOGLE_MEET' | 'SKYPE' | 'TEAMS';
  notes?: string;
  teacherNotes?: string;
  createdAt: string;
  student?: { id: string; user?: { firstName: string; lastName: string; email: string } };
  teacher?: { id: string; hourlyRate?: number | string; user?: { firstName: string; lastName: string } };
}
interface Student { id: string; userId: string; user: { firstName: string; lastName: string; email: string } }
interface Teacher { id: string; userId: string; user: { firstName: string; lastName: string; email: string } }
interface Meta { total: number; page: number; limit: number; totalPages: number }
interface TimeSlot { time: string; isAvailable: boolean; conflictWith?: string }
interface FormData {
  studentId: string; teacherId: string; title: string; date: string; time: string;
  duration: string; status: string; meetingLink: string; platform: string; notes: string;
}
const emptyForm: FormData = {
  studentId:'', teacherId:'', title:'', date:'', time:'',
  duration:'60', status:'SCHEDULED', meetingLink:'', platform:'ZOOM', notes:'',
};

type ViewMode = 'pending' | 'all' | 'trial';

// ── Badges ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { cls: string; Icon: any }> = {
    SCHEDULED:   { cls: 'bg-blue-100 text-blue-700 border-blue-200',         Icon: Calendar      },
    IN_PROGRESS: { cls: 'bg-amber-100 text-amber-700 border-amber-200',     Icon: PlayCircle    },
    COMPLETED:   { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200',Icon: CheckCircle2  },
    CANCELLED:   { cls: 'bg-red-100 text-red-600 border-red-200',           Icon: XCircle       },
    MISSED:      { cls: 'bg-gray-100 text-gray-600 border-gray-200',        Icon: AlertTriangle },
  };
  const { cls, Icon } = m[status] || m.SCHEDULED;
  return <Badge variant="outline" className={cn('text-xs font-medium border gap-1', cls)}><Icon className="h-3 w-3" />{status.replace('_',' ')}</Badge>;
}

function TrialBadge() {
  return <Badge variant="outline" className="text-[10px] font-bold bg-purple-100 text-purple-700 border-purple-200">TRIAL</Badge>;
}

// ── Component ──────────────────────────────────────────
export default function SessionsContent() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  // Data
  const [sessions, setSessions]       = useState<Session[]>([]);
  const [pendingSessions, setPending]  = useState<Session[]>([]);
  const [students, setStudents]       = useState<Student[]>([]);
  const [teachers, setTeachers]       = useState<Teacher[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [meta, setMeta]               = useState<Meta>({ total:0, page:1, limit:10, totalPages:1 });
  const [loading, setLoading]         = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);

  // View
  const [viewMode, setViewMode]       = useState<ViewMode>('pending');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage]               = useState(1);

  // Dialogs
  const [createOpen, setCreateOpen]   = useState(false);
  const [editOpen, setEditOpen]       = useState(false);
  const [viewOpen, setViewOpen]       = useState(false);
  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const [selected, setSelected]       = useState<Session | null>(null);
  const [confirmSession, setConfirmSession] = useState<any>(null);
  const [formData, setFormData]       = useState<FormData>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

  // Reschedule
  const [rescheduleSession, setRescheduleSession] = useState<Session | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date:'', time:'', meetingLink:'', adminNotes:'' });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Smart slots
  const [slots, setSlots]             = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // ── Load students & teachers ──
  useEffect(() => {
    (async () => {
      try {
        setLoadingData(true);
        const [sRes, tRes] = await Promise.all([
          adminApi.getUsers({ role: 'STUDENT', limit: 200 }),
          adminApi.getTeachers(),
        ]);
        setStudents((sRes.data||[]).filter((u:any)=>u.student).map((u:any)=>({
          id: u.student.id, userId: u.id,
          user: { firstName: u.firstName, lastName: u.lastName, email: u.email },
        })));
        setTeachers(((tRes as any).data||[]).filter((u:any)=>u.teacher).map((u:any)=>({
          id: u.teacher.id, userId: u.id,
          user: { firstName: u.firstName, lastName: u.lastName, email: u.email },
        })));
      } catch (e:any) { toast.error(e?.message||'Failed to load data'); }
      finally { setLoadingData(false); }
    })();
  }, []);

  // ── Load pending confirmations ──
  const fetchPending = useCallback(async () => {
    try {
      setLoadingPending(true);
      const res = await adminApi.getPendingConfirmations();
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      setPending(data);
    } catch { setPending([]); }
    finally { setLoadingPending(false); }
  }, []);

  // ── Load all sessions ──
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit: 10 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await adminApi.getSessions(params);
      setSessions(res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (e:any) { toast.error(e?.message||'Failed'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchPending(); }, [fetchPending]);
  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  useEffect(() => { setPage(1); }, [statusFilter]);
  // Auto-open confirm dialog when redirected from /admin/reports
  const searchParams = useSearchParams();
  const router = useRouter();
  const autoConfirmId = searchParams.get('confirm');

  useEffect(() => {
    if (!autoConfirmId || sessions.length === 0) return;
    const target = sessions.find(s => s.id === autoConfirmId);
    if (target) {
      setConfirmSession(target);
      setConfirmOpen(true);
      // Clean the URL
      router.replace(window.location.pathname);
    }
  }, [autoConfirmId, sessions, router]);


  // ── Smart slots ──
  useEffect(() => {
    if (!formData.teacherId || formData.teacherId === 'none' || !formData.date) { setSlots([]); return; }
    (async () => {
      try {
        setLoadingSlots(true);
        const r = await adminApi.getTeacherAvailableSlots(formData.teacherId, formData.date);
        setSlots((r as any)?.slots || (r as any)?.data?.slots || []);
      } catch { setSlots([]); }
      finally { setLoadingSlots(false); }
    })();
  }, [formData.teacherId, formData.date]);

  // ── Helpers ──
  const isTrial = (s: Session) => s.title?.toLowerCase().includes('trial') || !!s.bookingId;
  const needsConfirm = (s: Session) => {
    if (s.status !== 'SCHEDULED' && s.status !== 'IN_PROGRESS') return false;
    return new Date(s.date).getTime() + s.duration * 60000 < Date.now();
  };
  const stuName  = (s: Session) => s.student?.user ? `${s.student.user.firstName} ${s.student.user.lastName}` : '—';
  const tchName  = (s: Session) => s.teacher?.user ? `${s.teacher.user.firstName} ${s.teacher.user.lastName}` : '—';
  const fmtDt    = (d?: string) => d ? new Date(d).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
  const fmtDate  = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  const fmtTime  = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });

  // The current data list based on viewMode
  const displaySessions = viewMode === 'pending' ? pendingSessions
    : viewMode === 'trial' ? sessions.filter(s => isTrial(s))
    : sessions;
  const isListLoading = viewMode === 'pending' ? loadingPending : loading;

  // ── CRUD handlers ──
  const handleCreate = async () => {
    if (!formData.studentId || !formData.title || !formData.date || !formData.time) { toast.error('Fill required fields'); return; }
    try {
      setFormLoading(true);
      const [h,m] = formData.time.split(':').map(Number);
      const d = new Date(formData.date); d.setHours(h, m||0, 0, 0);
      await adminApi.createSession({
        studentId: formData.studentId,
        teacherId: formData.teacherId && formData.teacherId !== 'none' ? formData.teacherId : undefined,
        title: formData.title, date: d.toISOString(),
        duration: parseInt(formData.duration), status: formData.status,
        platform: formData.platform||undefined, meetingLink: formData.meetingLink||undefined,
        notes: formData.notes||undefined,
      });
      toast.success('Session created!');
      setCreateOpen(false); setFormData(emptyForm);
      fetchSessions(); fetchPending();
    } catch (e:any) { toast.error(e?.message||'Failed'); }
    finally { setFormLoading(false); }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    try {
      setFormLoading(true);
      let dateISO: string|undefined;
      if (formData.date && formData.time) {
        const [h,m] = formData.time.split(':').map(Number);
        const d = new Date(formData.date); d.setHours(h, m||0, 0, 0);
        dateISO = d.toISOString();
      }
      await adminApi.updateSession(selected.id, {
        title: formData.title, date: dateISO, duration: parseInt(formData.duration),
        status: formData.status,
        teacherId: formData.teacherId && formData.teacherId !== 'none' ? formData.teacherId : undefined,
        meetingLink: formData.meetingLink||undefined, platform: formData.platform||undefined,
        notes: formData.notes||undefined,
      });
      toast.success('Session updated');
      setEditOpen(false); fetchSessions(); fetchPending();
    } catch (e:any) { toast.error(e?.message||'Failed'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try { setFormLoading(true); await adminApi.deleteSession(selected.id); toast.success('Deleted'); setDeleteOpen(false); fetchSessions(); fetchPending(); }
    catch (e:any) { toast.error(e?.message||'Failed'); }
    finally { setFormLoading(false); }
  };

  const openEdit = (s: Session) => {
    setSelected(s);
    const d = new Date(s.date);
    setFormData({
      studentId: s.studentId, teacherId: s.teacherId||'', title: s.title,
      date: d.toISOString().slice(0,10),
      time: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,
      duration: String(s.duration), status: s.status,
      meetingLink: s.meetingLink||'', platform: s.platform||'ZOOM', notes: s.notes||'',
    });
    setEditOpen(true);
  };

  // ── Reschedule ──
  const openReschedule = (s: Session) => {
    const d = new Date(s.date);
    setRescheduleSession(s);
    setRescheduleForm({
      date: d.toISOString().slice(0,10),
      time: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,
      meetingLink: s.meetingLink||'', adminNotes: '',
    });
    setRescheduleOpen(true);
  };

  const handleReschedule = async () => {
    if (!rescheduleSession || !rescheduleForm.date || !rescheduleForm.time) { toast.error('Date & time required'); return; }
    try {
      setRescheduleLoading(true);
      const [h,m] = rescheduleForm.time.split(':').map(Number);
      const nd = new Date(rescheduleForm.date); nd.setHours(h, m, 0, 0);
      await adminApi.updateSession(rescheduleSession.id, {
        date: nd.toISOString(), status: 'SCHEDULED',
        meetingLink: rescheduleForm.meetingLink||undefined,
        teacherNotes: rescheduleForm.adminNotes||undefined,
      });
      toast.success('Session rescheduled!');
      setRescheduleOpen(false); fetchSessions(); fetchPending();
    } catch (e:any) { toast.error(e?.message||'Failed'); }
    finally { setRescheduleLoading(false); }
  };

  // ── Form Fields Component ──
  const FormFields = ({ isEdit }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-2">
      {loadingData ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[#0D4F4F]" /></div>
      ) : (<>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Student *</Label>
            <Select value={formData.studentId} onValueChange={v => setFormData({...formData, studentId:v})} disabled={isEdit}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.user.firstName} {s.user.lastName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Teacher</Label>
            <Select value={formData.teacherId} onValueChange={v => setFormData({...formData, teacherId:v, time:''})}>
              <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {teachers.map(tc => <SelectItem key={tc.id} value={tc.id}>{tc.user.firstName} {tc.user.lastName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5"><Label>Title *</Label><Input value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} placeholder="e.g. Tajweed" /></div>
        <div className="space-y-1.5"><Label>Date *</Label><Input type="date" value={formData.date} min={new Date().toISOString().slice(0,10)} onChange={e=>setFormData({...formData,date:e.target.value,time:''})} /></div>

        {/* Smart Time Slots */}
        {formData.teacherId && formData.teacherId !== 'none' && formData.date ? (
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Available Slots *</Label>
            {loadingSlots ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"><Loader2 className="h-4 w-4 animate-spin text-[#0D4F4F]" /><span className="text-xs text-muted-foreground">Loading...</span></div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                {slots.map(sl => (
                  <button key={sl.time} type="button" disabled={!sl.isAvailable}
                    onClick={() => setFormData({...formData, time:sl.time})}
                    title={!sl.isAvailable ? `Conflict: ${sl.conflictWith}` : 'Available'}
                    className={cn('px-2 py-1.5 rounded-lg text-xs font-medium transition-all',
                      formData.time === sl.time && 'bg-[#0D4F4F] text-white shadow-md',
                      formData.time !== sl.time && sl.isAvailable && 'bg-white border border-gray-200 hover:border-[#0D4F4F]',
                      !sl.isAvailable && 'bg-red-50 text-red-400 cursor-not-allowed line-through',
                    )}>{sl.time}</button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label>Time *</Label>
            <Input type="time" value={formData.time} onChange={e=>setFormData({...formData,time:e.target.value})} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Select value={formData.duration} onValueChange={v=>setFormData({...formData,duration:v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{['30','45','60','90'].map(d=><SelectItem key={d} value={d}>{d} min</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Platform</Label>
            <Select value={formData.platform} onValueChange={v=>setFormData({...formData,platform:v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{['ZOOM','GOOGLE_MEET','SKYPE','TEAMS'].map(p=><SelectItem key={p} value={p}>{p.replace('_',' ')}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={v=>setFormData({...formData,status:v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED','MISSED'].map(s=><SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Meeting Link</Label><Input placeholder="https://zoom.us/j/..." value={formData.meetingLink} onChange={e=>setFormData({...formData,meetingLink:e.target.value})} /></div>
        <div className="space-y-1.5"><Label>Notes</Label><Textarea value={formData.notes} onChange={e=>setFormData({...formData,notes:e.target.value})} rows={2} /></div>
      </>)}
    </div>
  );

  // ── Session Row ──
  const SessionRow = ({ s }: { s: Session }) => (
    <tr className={cn('border-b last:border-0 hover:bg-gray-50/50 transition-colors',
      needsConfirm(s) && 'bg-amber-50/30'
    )}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 truncate max-w-[140px]">{s.title}</span>
          {isTrial(s) && <TrialBadge />}
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground text-xs">{stuName(s)}</td>
      <td className="px-4 py-3 text-muted-foreground text-xs">{tchName(s)}</td>
      <td className="px-4 py-3">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-gray-700">{fmtDate(s.date)}</span>
          <span className="block text-[11px]">{fmtTime(s.date)} · {s.duration}min</span>
        </div>
      </td>
      <td className="px-4 py-3 text-center"><StatusBadge status={s.status} /></td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {/* Confirm */}
          {(s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS') && (
            <Button size="sm" onClick={() => { setConfirmSession(s); setConfirmOpen(true); }}
              className={cn('h-7 px-2.5 text-white text-[11px] gap-1',
                needsConfirm(s) ? 'bg-amber-500 hover:bg-amber-600 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'
              )}>
              <CheckCircle2 className="h-3 w-3" />
              {needsConfirm(s) ? 'Confirm' : 'Done'}
            </Button>
          )}
          {/* Reschedule */}
          {(s.status === 'MISSED' || s.status === 'CANCELLED') && (
            <Button size="sm" variant="outline" onClick={() => openReschedule(s)}
              className="h-7 px-2.5 text-[11px] gap-1 border-orange-300 text-orange-600 hover:bg-orange-50">
              <RefreshCw className="h-3 w-3" /> Reschedule
            </Button>
          )}
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(s); setViewOpen(true); }}><Eye className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-blue-600" onClick={() => openEdit(s)}><Edit className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-red-600" onClick={() => { setSelected(s); setDeleteOpen(true); }}><Trash2 className="h-3.5 w-3.5" /></Button>
          {s.meetingLink && <a href={s.meetingLink} target="_blank" rel="noreferrer"><Button size="icon" variant="ghost" className="h-7 w-7 hover:text-green-600"><LinkIcon className="h-3.5 w-3.5" /></Button></a>}
        </div>
      </td>
    </tr>
  );

  // ── RENDER ─────────────────────────────────────────────
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0D4F4F]">Session Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pendingSessions.length > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                <AlertCircle className="h-3.5 w-3.5" />
                {pendingSessions.length} session{pendingSessions.length > 1 ? 's' : ''} awaiting confirmation
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setRecurringOpen(true)} variant="outline"
            className="border-[#0D4F4F] text-[#0D4F4F] hover:bg-[#0D4F4F]/5 gap-2">
            <Repeat className="h-4 w-4" /> Recurring
          </Button>
          <Button onClick={() => { setFormData(emptyForm); setCreateOpen(true); }}
            className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white gap-2">
            <Plus className="h-4 w-4" /> New Session
          </Button>
        </div>
      </div>

      {/* View Mode Tabs + Filter */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
              {([
                { key: 'pending', label: `Needs Confirm (${pendingSessions.length})`, icon: AlertCircle },
                { key: 'all',     label: 'All Sessions',                              icon: Filter     },
                { key: 'trial',   label: 'Trial Only',                                icon: Video      },
              ] as { key: ViewMode; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => { setViewMode(key); setPage(1); }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                    viewMode === key
                      ? 'bg-white text-[#0D4F4F] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}>
                  <Icon className="h-3.5 w-3.5" />{label}
                </button>
              ))}
            </div>

            {/* Status filter — only for 'all' view */}
            {viewMode === 'all' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED','MISSED'].map(s => (
                    <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Summary Cards (only in pending view) */}
      {viewMode === 'pending' && !loadingPending && pendingSessions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Pending', value: pendingSessions.length, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Trial Sessions', value: pendingSessions.filter(s => isTrial(s)).length, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Today', value: pendingSessions.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Overdue', value: pendingSessions.filter(s => {
              const end = new Date(s.date).getTime() + s.duration * 60000;
              return end < Date.now() - 24 * 3600000;
            }).length, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(({label, value, color, bg}, i) => (
            <div key={i} className={cn('rounded-xl p-3 border', bg)}>
              <p className={cn('text-2xl font-bold', color)}>{value}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isListLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#0D4F4F]" /></div>
          ) : displaySessions.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              {viewMode === 'pending' ? (
                <><CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-400" /><p className="font-semibold text-emerald-600">All caught up! No pending confirmations.</p></>
              ) : (
                <><Video className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No sessions found</p></>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className="px-4 py-3 font-medium text-muted-foreground text-left">Title</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-left">Student</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-left">Teacher</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-left">Date</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displaySessions.map(s => <SessionRow key={s.id} s={s} />)}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination — only for 'all' view */}
          {viewMode === 'all' && !loading && meta.totalPages > 1 && (
            <>
              <Separator />
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {(page-1)*meta.limit+1}–{Math.min(page*meta.limit, meta.total)} / {meta.total}
                </p>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="h-8 w-8" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[60px] text-center">{page}/{meta.totalPages}</span>
                  <Button size="icon" variant="outline" className="h-8 w-8" disabled={page>=meta.totalPages} onClick={()=>setPage(p=>p+1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ══ DIALOGS ══ */}

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-[#0D4F4F]">Create Session</DialogTitle><DialogDescription>Smart time picker prevents conflicts</DialogDescription></DialogHeader>
          <FormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={formLoading} className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white">
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-[#0D4F4F]">Edit Session</DialogTitle><DialogDescription>{selected?.title}</DialogDescription></DialogHeader>
          <FormFields isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={formLoading} className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white">
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader><DialogTitle className="text-[#0D4F4F]">Session Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={selected.status} />
                {isTrial(selected) && <TrialBadge />}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { l:'Student',  v:stuName(selected)    },
                  { l:'Teacher',  v:tchName(selected)    },
                  { l:'Date',     v:fmtDt(selected.date) },
                  { l:'Duration', v:`${selected.duration} min` },
                ].map(({l,v})=>(
                  <div key={l}><p className="text-xs text-muted-foreground mb-1">{l}</p><p className="font-medium">{v}</p></div>
                ))}
              </div>
              {selected.meetingLink && (
                <div><p className="text-xs text-muted-foreground mb-1">Meeting Link</p>
                  <a href={selected.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">{selected.meetingLink}</a>
                </div>
              )}
              {selected.notes && (
                <div><p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selected.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader><DialogTitle className="text-red-600">Delete Session</DialogTitle><DialogDescription>Cannot be undone</DialogDescription></DialogHeader>
          {selected && <div className="p-4 bg-red-50 rounded-xl my-2"><p className="font-medium">{selected.title}</p><p className="text-xs text-muted-foreground mt-1">{fmtDt(selected.date)}</p></div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F] flex items-center gap-2"><RefreshCw className="h-5 w-5" /> Reschedule Session</DialogTitle>
            <DialogDescription>Reset to SCHEDULED with new date/time</DialogDescription>
          </DialogHeader>
          {rescheduleSession && (
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-100 text-sm mb-2">
              <p className="font-semibold text-orange-800">{rescheduleSession.title}</p>
              <p className="text-xs text-orange-600 mt-0.5">Original: {fmtDt(rescheduleSession.date)} · {rescheduleSession.duration}min</p>
              <p className="text-xs text-orange-600">Student: {stuName(rescheduleSession)} · Teacher: {tchName(rescheduleSession)}</p>
            </div>
          )}
          <div className="grid gap-4 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-[#0D4F4F]" /> New Date *</Label>
                <Input type="date" value={rescheduleForm.date} min={new Date().toISOString().slice(0,10)}
                  onChange={e=>setRescheduleForm(p=>({...p,date:e.target.value}))} />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-[#0D4F4F]" /> New Time *</Label>
                <Input type="time" value={rescheduleForm.time} onChange={e=>setRescheduleForm(p=>({...p,time:e.target.value}))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><LinkIcon className="h-3.5 w-3.5 text-[#0D4F4F]" /> Meeting Link</Label>
              <Input placeholder="https://zoom.us/j/..." value={rescheduleForm.meetingLink} onChange={e=>setRescheduleForm(p=>({...p,meetingLink:e.target.value}))} />
            </div>
            <div className="space-y-1.5"><Label>Notes</Label><Textarea placeholder="Reason..." value={rescheduleForm.adminNotes} rows={2} onChange={e=>setRescheduleForm(p=>({...p,adminNotes:e.target.value}))} /></div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-800">✓ Status resets to <strong>SCHEDULED</strong><br/>✓ Student sees new time in dashboard</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleReschedule} disabled={rescheduleLoading} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              {rescheduleLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><RefreshCw className="h-4 w-4" /> Reschedule</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <RecurringScheduleDialog open={recurringOpen} onOpenChange={setRecurringOpen} students={students} teachers={teachers} onSuccess={() => { fetchSessions(); fetchPending(); }} />
      <ConfirmAttendanceDialog open={confirmOpen} onOpenChange={setConfirmOpen} session={confirmSession} onSuccess={() => { fetchSessions(); fetchPending(); }} />
    </div>
  );
}