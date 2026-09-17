import React, { useEffect, useState } from "react";
import {
  Check,
  X,
  Users,
  Inbox,
  ChevronRight,
  ArrowLeft,
  Lock,
  CalendarDays,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import { Card, Badge, Button, Input } from "../components/ui";

export default function SupervisorDashboard() {
  const {
    getPendingRequestsForSupervisor,
    getStudentsForSupervisor,
    respondJoinRequest,
  } = useApp();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [students, setStudents] = useState([]);
  const [respondingId, setRespondingId] = useState(null);
  const [error, setError] = useState("");
  const [openStudent, setOpenStudent] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [fetchedPending, fetchedStudents] = await Promise.all([
        getPendingRequestsForSupervisor(),
        getStudentsForSupervisor(),
      ]);
      setPending(fetchedPending);
      setStudents(fetchedStudents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRespond(requestId, accept) {
    setRespondingId(requestId);
    try {
      await respondJoinRequest(requestId, accept);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setRespondingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <p className="text-center text-ink-500 mt-20">Loading your dashboard…</p>
      </div>
    );
  }

  if (openStudent) {
    const record = students.find((s) => s.studentId === openStudent);
    return (
      <StudentDetail record={record} onBack={() => setOpenStudent(null)} />
    );
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            Supervisor dashboard
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Review join requests and track your students' progress.
          </p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Inbox size={16} className="text-clay-600" />
            <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wide">
              Pending join requests{" "}
              {pending.length > 0 && `(${pending.length})`}
            </h2>
          </div>
          {pending.length === 0 ? (
            <Card className="p-5 text-sm text-ink-400">
              No pending requests right now.
            </Card>
          ) : (
            <div className="space-y-3">
              {pending.map((req) => (
                <Card key={req._id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink-900 text-sm">
                        {req.profile?.fullname || "Unnamed student"}
                      </p>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {req.profile?.department} · {req.profile?.level} ·
                        Matric: {req.profile?.matricnumber}
                      </p>
                      <p className="text-xs text-ink-400 mt-1">
                        IT at {req.profile?.companyName} · Contact:{" "}
                        {req.profile?.staffName} ({req.profile?.staffPhone})
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="danger"
                        className="!p-2"
                        disabled={respondingId === req._id}
                        onClick={() => handleRespond(req._id, false)}
                        title="Decline"
                      >
                        <X size={16} />
                      </Button>
                      <Button
                        className="!p-2"
                        disabled={respondingId === req._id}
                        onClick={() => handleRespond(req._id, true)}
                        title="Accept"
                      >
                        <Check size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-forest-600" />
            <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wide">
              Assigned students ({students.length})
            </h2>
          </div>
          {students.length === 0 ? (
            <Card className="p-5 text-sm text-ink-400">
              No assigned students yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {students.map((rec) => {
                const currentMonth = rec.logbook?.months.find((m) => !m.locked);
                const weeksDone =
                  currentMonth?.weeks.filter((w) => w.weekDone).length ?? 0;
                const totalWeeks = currentMonth?.weeks.length ?? 0;
                return (
                  <button
                    key={rec.studentId}
                    onClick={() => setOpenStudent(rec.studentId)}
                    className="w-full text-left"
                  >
                    <Card className="p-4 flex items-center justify-between hover:border-forest-300 transition-colors">
                      <div>
                        <p className="font-medium text-ink-900 text-sm">
                          {rec.profile?.fullname}
                        </p>
                        <p className="text-xs text-ink-500 mt-0.5">
                          {rec.profile?.department} · {rec.profile?.level}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge tone={weeksDone === totalWeeks && totalWeeks > 0 ? 'forest' : 'clay'}>
                          {currentMonth?.label ?? "No active month"} · {weeksDone}/{totalWeeks} weeks
                        </Badge>
                        <ChevronRight size={16} className="text-ink-300" />
                      </div>
                    </Card>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StudentDetail({ record, onBack }) {
  const { setWeekMark } = useApp();
  const { profile, logbook } = record;
  const [months, setMonths] = useState(logbook?.months || []);
  const [error, setError] = useState("");

  const allWeeks = months.flatMap((m) => m.weeks);
  const markedWeeks = allWeeks.filter((w) => w.weekMark !== null && w.weekMark !== undefined);
  const totalEarned = markedWeeks.reduce((sum, w) => sum + w.weekMark, 0);
  const totalPossible = allWeeks.length * 5;

  async function handleSaveMark(monthId, weekId, mark) {
    try {
      await setWeekMark(record.studentId, monthId, weekId, mark);
      setMonths((prev) =>
        prev.map((m) =>
          m._id !== monthId
            ? m
            : { ...m, weeks: m.weeks.map((w) => (w._id === weekId ? { ...w, weekMark: mark } : w)) }
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-1.5 mb-6 !px-2"
        >
          <ArrowLeft size={15} /> Back to students
        </Button>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">
              {profile?.fullname}
            </h1>
            <p className="text-ink-500 text-sm mt-1">
              {profile?.department} · {profile?.level} · IT at {profile?.companyName}
            </p>
          </div>
          <Badge tone={totalEarned === totalPossible ? "forest" : "trust"}>
            {totalEarned}/{totalPossible} marks
          </Badge>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>}

        <div className="space-y-4">
          {months.map((m) => (
            <Card key={m._id} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium text-ink-900 text-sm">{m.label}</p>
                {m.locked ? (
                  <Badge tone="ink">
                    <span className="flex items-center gap-1">
                      <Lock size={11} /> Submitted
                    </span>
                  </Badge>
                ) : (
                  <Badge tone="clay">In progress</Badge>
                )}
              </div>

              <div className="space-y-5">
                {m.weeks.map((w) => (
                  <div key={w._id}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-xs font-semibold text-ink-500 flex items-center gap-1.5">
                        <CalendarDays size={13} /> {w.label}
                      </p>
                      <WeekMarkInput
                        value={w.weekMark}
                        onSave={(mark) => handleSaveMark(m._id, w._id, mark)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      {w.days.map((d) => (
                        <div key={d._id} className="flex gap-2 items-start text-sm">
                          <span className="text-ink-400 w-9 shrink-0">{d.label}</span>
                          <span className="text-ink-700 flex-1">
                            {d.text || <span className="text-ink-300">No entry</span>}
                          </span>
                          {d.approved && (
                            <Badge tone="forest"><CheckCircle2 size={11} className="mr-1" /> Approved</Badge>
                          )}
                          {d.submitted && !d.approved && (
                            <Badge tone="clay"><Clock3 size={11} className="mr-1" /> Awaiting approval</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Local number input, 0-5, saves on blur rather than on every keystroke.
function WeekMarkInput({ value, onSave }) {
  const [mark, setMark] = useState(value ?? "");
  const [saving, setSaving] = useState(false);

  async function handleBlur() {
    if (mark === "" || Number(mark) === value) return;
    const clamped = Math.max(0, Math.min(5, Number(mark)));
    setMark(clamped);
    setSaving(true);
    await onSave(clamped);
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        min={0}
        max={5}
        value={mark}
        onChange={(e) => setMark(e.target.value)}
        onBlur={handleBlur}
        placeholder="—"
        className="!w-16 !py-1.5 text-center"
      />
      <span className="text-xs text-ink-400">/5</span>
      {saving && <span className="text-xs text-ink-300">Saving…</span>}
    </div>
  );
}