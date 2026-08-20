import React, { useState } from "react";
import {
  Check,
  X,
  Users,
  Inbox,
  ChevronRight,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import { Card, Badge, Button } from "../components/ui";

export default function SupervisorDashboard() {
  const {
    currentUser,
    getPendingRequestsForSupervisor,
    getStudentsForSupervisor,
    respondJoinRequest,
  } = useApp();
  const pending = getPendingRequestsForSupervisor(currentUser.id);
  const students = getStudentsForSupervisor(currentUser.id);
  const [openStudent, setOpenStudent] = useState(null);

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
                <Card key={req.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink-900 text-sm">
                        {req.profile?.fullName || "Unnamed student"}
                      </p>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {req.profile?.department} · {req.profile?.level} ·
                        Matric: {req.profile?.matricNumber}
                      </p>
                      <p className="text-xs text-ink-400 mt-1">
                        IT at {req.profile?.orgName} · Contact:{" "}
                        {req.profile?.staffName} ({req.profile?.staffPhone})
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        className="!p-2"
                        onClick={() => respondJoinRequest(req.id, false)}
                        title="Decline"
                      >
                        <X size={16} className="text-red-500" />
                      </Button>
                      <Button
                        className="!p-2"
                        onClick={() => respondJoinRequest(req.id, true)}
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
                          {rec.profile?.fullName}
                        </p>
                        <p className="text-xs text-ink-500 mt-0.5">
                          {rec.profile?.department} · {rec.profile?.level}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge tone="trust">
                          {currentMonth?.label} · {weeksDone}/{totalWeeks} weeks
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
  const { profile, logbook } = record;
  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 mb-6"
        >
          <ArrowLeft size={15} /> Back to students
        </button>

        <h1 className="font-display text-2xl font-semibold text-ink-900">
          {profile?.fullName}
        </h1>
        <p className="text-ink-500 text-sm mt-1 mb-6">
          {profile?.department} · {profile?.level} · IT at {profile?.orgName}
        </p>

        <div className="space-y-4">
          {logbook?.months.map((m) => (
            <Card key={m.id} className="p-5">
              <div className="flex items-center justify-between mb-3">
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
              {m.locked ? (
                <div className="space-y-3">
                  {m.weeks.map((w) => (
                    <div key={w.id}>
                      <p className="text-xs font-semibold text-ink-500 mb-1.5">
                        {w.label}
                      </p>
                      <div className="space-y-1.5">
                        {w.days.map((d) => (
                          <div
                            key={d.id}
                            className="text-sm text-ink-700 flex gap-2"
                          >
                            <span className="text-ink-400 w-9 shrink-0">
                              {d.label}
                            </span>
                            <span>
                              {d.text || (
                                <span className="text-ink-300">No entry</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-400">
                  Not yet submitted — {m.weeks.filter((w) => w.weekDone).length}
                  /{m.weeks.length} weeks done so far.
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
