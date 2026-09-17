import { useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

const COLORS = {
  green950: "#132B1B",
  green900: "#1B3F26",
  green700: "#2F6B3E",
  green100: "#E6F1E4",
  cream: "#FAF8F1",
  cream2: "#F2EFE4",
  ink: "#191A12",
  gray: "#6C6C60",
  orange: "#DD5B34",
  border: "#E6E2D2",
};

const ruledTexture = {
  backgroundImage:
    "repeating-linear-gradient(to bottom, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 40px)",
};

function BrandMark({ size = 34 }) {
  return (
    <span
      className="rounded-[9px] flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(155deg, ${COLORS.green700}, ${COLORS.green900})`,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        width={size * 0.53}
        height={size * 0.53}
      >
        <path
          d="M4 5.5C4 4.67 4.67 4 5.5 4H11V20H5.5C4.67 20 4 19.33 4 18.5V5.5Z"
          stroke="white"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M20 5.5C20 4.67 19.33 4 18.5 4H13V20H18.5C19.33 20 20 19.33 20 18.5V5.5Z"
          stroke="white"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

const NAV_LINKS = [
  { href: "#features", label: "Features", hash: true },
  { href: "#how", label: "How It Works", hash: true },
  { href: "/login", label: "For Supervisors", hash: false },
  { href: "/login", label: "For Company", hash: false },
  { href: "#pricing", label: "Pricing", hash: true },
];

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        background: "rgba(250,248,241,0.86)",
        borderColor: COLORS.border,
      }}
    >
      <div className="max-w-[1180px] mx-auto px-7 md:px-10 flex items-center justify-between py-4">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-extrabold text-lg"
          style={{ color: COLORS.ink }}
        >
          <BrandMark />
          Logify
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) =>
            l.hash ? (
              <HashLink
                key={l.href}
                to={l.href}
                className="text-sm font-medium opacity-75 hover:opacity-100 transition"
                style={{ color: COLORS.ink }}
              >
                {l.label}
              </HashLink>
            ) : (
              <Link
                key={l.href}
                to={l.href}
                className="text-sm font-medium opacity-75 hover:opacity-100 transition"
                style={{ color: COLORS.ink }}
              >
                {l.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-3 rounded-[10px] text-sm font-semibold border hover:border-[#2F6B3E] transition"
            style={{ borderColor: COLORS.border, color: COLORS.ink }} >
            Student Portal
          </Link>
          <Link
            to="/login"
            className="px-5 py-3 rounded-[10px] text-sm font-semibold text-white shadow-md hover:opacity-90 transition"
            style={{ background: COLORS.green700 }}
          >
            Get Started
          </Link>
        </div>

        <button
          className="lg:hidden flex flex-col gap-1.5 w-6 p-1.5"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span
            className="h-0.5 rounded-full"
            style={{ background: COLORS.ink }}
          />
          <span
            className="h-0.5 rounded-full"
            style={{ background: COLORS.ink }}
          />
          <span
            className="h-0.5 rounded-full"
            style={{ background: COLORS.ink }}
          />
        </button>
      </div>

      {open && (
        <div
          className="lg:hidden max-w-[1180px] mx-auto px-7 pb-5 border-t flex flex-col gap-1"
          style={{ borderColor: COLORS.border }}
        >
          {NAV_LINKS.map((l) =>
            l.hash ? (
              <HashLink
                key={l.href}
                to={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[15px] font-medium"
                style={{ color: COLORS.ink }}
              >
                {l.label}
              </HashLink>
            ) : (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[15px] font-medium"
                style={{ color: COLORS.ink }}
              >
                {l.label}
              </Link>
            )
          )}
          <Link
            to="/login"
            className="mt-2 text-center px-5 py-3 rounded-[10px] text-sm font-semibold text-white"
            style={{ background: COLORS.green700 }} >
            Get Started as a Student
          </Link>
          <Link
            to="/login"
            className="mt-2 text-center px-5 py-3 rounded-[10px] text-sm font-semibold border"
            style={{ borderColor: COLORS.border, color: COLORS.ink }} >
            Supervisor Portal
          </Link>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden text-white py-16 md:py-24 lg:py-28"
      style={{
        background: `radial-gradient(1100px 620px at 78% -10%, rgba(76,140,88,0.55), transparent 60%), linear-gradient(165deg, ${COLORS.green900} 0%, ${COLORS.green950} 65%, #0E1F14 100%)`,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          ...ruledTexture,
          maskImage:
            "linear-gradient(to bottom, transparent, black 20%, black 75%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 20%, black 75%, transparent)",
        }}
      />
      <div className="relative z-10 max-w-[1180px] mx-auto px-7 md:px-10 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-11 lg:gap-16 items-center">
        <div>
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[13px] font-medium mb-6"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.16)",
              color: "rgba(255,255,255,0.88)",
            }}
          >
            <span
              className="w-[7px] h-[7px] rounded-full"
              style={{
                background: "#6FE38A",
                boxShadow: "0 0 0 4px rgba(111,227,138,0.18)",
              }}
            />
            Trusted by 12,500+ students across Nigeria
          </div>
          <h1
            className="font-extrabold leading-[1.04] mb-5 text-[36px] md:text-[52px] lg:text-[64px]"
            style={{ letterSpacing: "-0.02em" }}
          >
            Your SIWES Logbook,
            <span className="block" style={{ color: "#8CDF9E" }}>
              Digitized.
            </span>
          </h1>
          <p
            className="text-[17px] lg:text-[18px] leading-relaxed mb-9 max-w-[520px]"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            Logify replaces the hassle of paper logbooks with a structured,
            secure digital platform. Log daily activities, track weekly
            progress, and submit monthly reports — all from your phone or
            laptop.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-[340px] lg:max-w-none">
            <Link
              to="/login"
              className="text-center px-6 py-3.5 rounded-[10px] font-semibold text-sm hover:bg-[#EDEBE0] transition"
              style={{ background: "white", color: COLORS.green900 }}
            >
              Get Started as a Student
            </Link>
            <Link
              to="/login"
              className="text-center px-6 py-3.5 rounded-[10px] font-semibold text-sm border hover:bg-white/5 hover:border-white transition"
              style={{ borderColor: "rgba(255,255,255,0.32)", color: "white" }}
            >
              Supervisor Portal
            </Link>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div
            className="hidden md:flex absolute top-[6%] -left-[4%] items-center gap-2 bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold shadow-xl border"
            style={{ borderColor: COLORS.border, color: COLORS.ink }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#6FE38A" }}
            />{" "}
            Week 4 marked done
          </div>

          <div
            className="w-[280px] rounded-[22px] p-2"
            style={{
              background: "#0F2417",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 40px 80px -30px rgba(0,0,0,0.6)",
            }}
          >
            <div
              className="rounded-2xl overflow-hidden px-4.5 pt-5 pb-5.5"
              style={{ background: COLORS.cream, padding: "20px 18px 22px" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="w-6 h-6 rounded-[7px] flex items-center justify-center"
                  style={{ background: COLORS.green700 }}
                >
                  <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
                    <path
                      d="M4 5.5C4 4.67 4.67 4 5.5 4H11V20H5.5C4.67 20 4 19.33 4 18.5V5.5Z"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 5.5C20 4.67 19.33 4 18.5 4H13V20H18.5C19.33 20 20 19.33 20 18.5V5.5Z"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <strong className="text-[13.5px]" style={{ color: COLORS.ink }}>
                  Daily Log — Week 4
                </strong>
              </div>

              {[
                {
                  t1: "Monday, Aug 17",
                  t2: "Configured build pipeline",
                  done: true,
                },
                {
                  t1: "Tuesday, Aug 18",
                  t2: "Reviewed API documentation",
                  done: true,
                },
                { t1: "Wednesday, Aug 19", t2: "Not yet logged", done: false },
              ].map((row) => (
                <div
                  key={row.t1}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] bg-white border mb-2"
                  style={{ borderColor: COLORS.border }}
                >
                  <span
                    className="w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0"
                    style={{ background: COLORS.green100 }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
                      <path
                        d="M4 20l1-4L17 4l3 3-12 12-4 1Z"
                        stroke={COLORS.green700}
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="flex-1">
                    <div
                      className="text-[11.5px] font-semibold"
                      style={{ color: COLORS.ink }}
                    >
                      {row.t1}
                    </div>
                    <div
                      className="text-[10px] mt-0.5"
                      style={{ color: COLORS.gray }}
                    >
                      {row.t2}
                    </div>
                  </span>
                  {row.done && (
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: COLORS.green700 }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" width="9" height="9">
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="white"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            className="hidden md:flex absolute bottom-[8%] -right-[6%] items-center gap-2 bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold shadow-xl border"
            style={{ borderColor: COLORS.border, color: COLORS.ink }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#6FE38A" }}
            />{" "}
            Supervisor approved
          </div>
        </div>
      </div>
    </section>
  );
}

const PROBLEMS = [
  "Paper logbooks get lost, damaged, or soaked in the rain",
  "Supervisors spend weeks reviewing stacks of physical books",
  "Students forget deadlines because there is no reminder system",
  "Backdating and fake entries are hard to detect on paper",
  "No backup — if the logbook is gone, months of work vanish",
];

const SOLUTIONS = [
  "All your log entries are stored securely in the cloud",
  "Supervisors review submissions in a clean dashboard instantly",
  "Automatic deadline reminders keep you on track every month",
  "Server-side locking prevents backdating and tampering",
  "Full backup — your data is safe and accessible anywhere",
];

function ProblemSolution() {
  return (
    <section id="problem-solution" className="py-16 md:py-20 lg:py-24">
      <div className="max-w-[1180px] mx-auto px-7 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 rounded-[20px] overflow-hidden border"
          style={{ borderColor: COLORS.border }} >
          <div className="p-8 md:p-10" style={{ background: "#FBF3EE" }}>
            <span
              className="block mb-2.5 text-[12.5px] font-medium uppercase tracking-widest"
              style={{ color: COLORS.orange, fontFamily: "monospace" }} >
              The Problem
            </span>
            <h3
              className="text-2xl font-extrabold mb-6 leading-tight"
              style={{ color: COLORS.ink }} >
              Still juggling paper logbooks?
            </h3>
            <ul className="flex flex-col gap-4">
              {PROBLEMS.map((text) => (
                <li
                  key={text}
                  className="flex gap-3 text-[15px] leading-relaxed"
                  style={{ color: "#4A4038" }} >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "#F5DDD1", color: COLORS.orange }} >
                    <svg viewBox="0 0 24 24" fill="none" width="11" height="11">
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round" />
                    </svg>
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="p-8 md:p-10 text-white"
            style={{ background: COLORS.green950 }}
          >
            <span
              className="block mb-2.5 text-[12.5px] font-medium uppercase tracking-widest"
              style={{ color: "#8CDF9E", fontFamily: "monospace" }}
            >
              The Solution
            </span>
            <h3 className="text-2xl font-extrabold mb-6 leading-tight">
              Go digital with Logify
            </h3>
            <ul className="flex flex-col gap-4">
              {SOLUTIONS.map((text) => (
                <li
                  key={text}
                  className="flex gap-3 text-[15px] leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.82)" }} >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: "rgba(140,223,158,0.16)",
                      color: "#8CDF9E",
                    }} >
                    <svg viewBox="0 0 24 24" fill="none" width="11" height="11">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round" />
                    </svg>
                  </span>
                  {text}
                </li>
              ))}
            </ul>
              <a
              href="#how"
              className="mt-6 inline-flex items-center gap-1.5 font-bold text-[15px]"
              style={{ color: "#8CDF9E" }} >
              Start logging digitally →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    title: "Daily Activity Logging",
    desc: "Students log their daily IT training activities with an intuitive form. Dates are auto-filled and entries are structured for easy review.",
    icon: (c) => (
      <path
        d="M4 20l1-4L17 4l3 3-12 12-4 1Z"
        stroke={c}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Weekly Progress Tracking",
    desc: 'Track week-by-week completion with a visual progress indicator. Mark weeks as "Done" when all daily entries are filled.',
    icon: (c) => (
      <>
        <rect
          x="4"
          y="5"
          width="16"
          height="15"
          rx="2"
          stroke={c}
          strokeWidth="1.8"
        />
        <path
          d="M4 9h16M8 3v4M16 3v4"
          stroke={c}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M9 14l2 2 4-4"
          stroke={c}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  {
    title: "Monthly Report Submission",
    desc: "Submit complete monthly reports to your assigned supervisor before the deadline. Automated reminders keep you on track.",
    icon: (c) => (
      <>
        <path
          d="M4 6l8 6 8-6"
          stroke={c}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="3.5"
          y="5"
          width="17"
          height="14"
          rx="2"
          stroke={c}
          strokeWidth="1.8"
        />
      </>
    ),
  },
  {
    title: "Supervisor Review & Approval",
    desc: "Supervisors receive, review, and approve monthly submissions through a dedicated dashboard designed for efficient oversight.",
    icon: (c) => (
      <>
        <path
          d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3Z"
          stroke={c}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke={c}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  {
    title: "Dual-Party Accountability",
    desc: "Optionally send a copy of your monthly report to a second party at your IT placement for additional verification.",
    icon: (c) => (
      <>
        <circle cx="9" cy="8" r="3" stroke={c} strokeWidth="1.8" />
        <path
          d="M4 20c0-3 2.2-5 5-5s5 2 5 5"
          stroke={c}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M16 5l2 2 4-4"
          stroke={c}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  {
    title: "Deadline Enforcement & Log Locking",
    desc: "Once a month deadline passes or a report is submitted, entries become read-only. No backdating or tampering possible.",
    icon: (c) => (
      <>
        <rect
          x="5"
          y="11"
          width="14"
          height="9"
          rx="2"
          stroke={c}
          strokeWidth="1.8"
        />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={c} strokeWidth="1.8" />
      </>
    ),
  },
];

function Features() {
  return (
    <section
      id="features"
      className="py-16 md:py-20 lg:py-24"
      style={{ background: COLORS.cream2 }}
    >
      <div className="max-w-[1180px] mx-auto px-7 md:px-10">
        <div className="max-w-[640px] mx-auto text-center mb-11">
          <span
            className="text-[12.5px] font-medium uppercase tracking-widest"
            style={{ color: COLORS.green700, fontFamily: "monospace" }}
          >
            Features
          </span>
          <h2
            className="mt-2.5 font-extrabold leading-tight text-[28px] md:text-[36px] lg:text-[40px]"
            style={{ color: COLORS.ink }}
          >
            Everything you need for SIWES
          </h2>
          <p
            className="mt-3.5 text-[16px] leading-relaxed"
            style={{ color: COLORS.gray }}
          >
            A complete digital logbook system designed specifically for the
            Nigerian SIWES programme, from daily logging to monthly supervisor
            approval.
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5"
          style={{ gap: 18 }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white border rounded-2xl p-7 shadow-sm hover:-translate-y-0.5 transition"
              style={{ borderColor: COLORS.border }}
            >
              <span
                className="w-11 h-11 rounded-[11px] flex items-center justify-center mb-4.5"
                style={{ background: COLORS.green100 }}
              >
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                  {f.icon(COLORS.green700)}
                </svg>
              </span>
              <h4
                className="text-[17px] font-bold mb-2"
                style={{ color: COLORS.ink }}
              >
                {f.title}
              </h4>
              <p
                className="text-[14.5px] leading-relaxed"
                style={{ color: COLORS.gray }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STUDENT_STEPS = [
  {
    title: "Create Your Account",
    desc: "Sign up as a Student, complete your profile with school, department, and IT placement details.",
  },
  {
    title: "Match with a Supervisor",
    desc: "Select your SIWES supervisor manually or use auto-matching based on your school and department.",
  },
  {
    title: "Log Daily Activities",
    desc: "Fill in your daily IT activity log. Track your weekly progress with the built-in completion tracker.",
  },
  {
    title: "Submit Monthly Report",
    desc: "Once all weeks are done, submit your monthly report to your supervisor before the deadline.",
  },
];

const SUPERVISOR_STEPS = [
  {
    title: "Create Your Account",
    desc: "Sign up as a Supervisor and add your institution or organization and department details.",
  },
  {
    title: "Accept Student Matches",
    desc: "Approve student requests manually or let auto-matching assign students from your school and department.",
  },
  {
    title: "Review Submissions",
    desc: "Check daily logs and weekly progress as students submit them, right from your dashboard.",
  },
  {
    title: "Approve Monthly Reports",
    desc: "Approve or request changes before the deadline locks entries for good.",
  },
];

function HowItWorks() {
  const [tab, setTab] = useState("students");
  const steps = tab === "students" ? STUDENT_STEPS : SUPERVISOR_STEPS;

  return (
    <section id="how" className="py-16 md:py-20 lg:py-24">
      <div className="max-w-[1180px] mx-auto px-7 md:px-10">
        <div className="max-w-[640px] mx-auto text-center mb-11">
          <span
            className="text-[12.5px] font-medium uppercase tracking-widest"
            style={{ color: COLORS.green700, fontFamily: "monospace" }}
          >
            How It Works
          </span>
          <h2
            className="mt-2.5 font-extrabold leading-tight text-[28px] md:text-[36px] lg:text-[40px]"
            style={{ color: COLORS.ink }}
          >
            Simple steps to digital logging
          </h2>
          <p
            className="mt-3.5 text-[16px] leading-relaxed"
            style={{ color: COLORS.gray }}
          >
            Whether you are a student or a supervisor, getting started with
            Logify takes just a few minutes.
          </p>
        </div>

        <div className="flex justify-center mb-11">
          <div
            className="inline-flex rounded-full p-1.5 gap-1"
            style={{ background: COLORS.cream2 }}
          >
            <button
              onClick={() => setTab("students")}
              className="px-6 py-2.5 rounded-full text-[14.5px] font-semibold transition"
              style={
                tab === "students"
                  ? { background: COLORS.green700, color: "white" }
                  : { color: COLORS.gray }
              }
            >
              For Students
            </button>
            <button
              onClick={() => setTab("supervisors")}
              className="px-6 py-2.5 rounded-full text-[14.5px] font-semibold transition"
              style={
                tab === "supervisors"
                  ? { background: COLORS.green700, color: "white" }
                  : { color: COLORS.gray }
              }
            >
              For Supervisors
            </button>
          </div>
        </div>

        <div
          id={tab}
          className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-5"
        >
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative flex lg:flex-col gap-5 lg:gap-4 pb-9 lg:pb-0"
            >
              {i < steps.length - 1 && (
                <span
                  className="absolute lg:hidden left-[21px] top-11 bottom-0 w-px"
                  style={{
                    backgroundImage: `repeating-linear-gradient(to bottom, ${COLORS.border} 0 6px, transparent 6px 12px)`,
                  }}
                />
              )}
              {i < steps.length - 1 && (
                <span
                  className="hidden lg:block absolute left-[22px] top-[22px] h-px"
                  style={{
                    width: "calc(100% + 20px)",
                    backgroundImage: `repeating-linear-gradient(to right, ${COLORS.border} 0 6px, transparent 6px 12px)`,
                  }}
                />
              )}
              <span
                className="w-11 h-11 rounded-full text-white flex items-center justify-center font-bold text-[15px] shrink-0"
                style={{ background: COLORS.green700, fontFamily: "monospace" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h4
                  className="text-[17px] font-bold mb-1.5"
                  style={{ color: COLORS.ink }}
                >
                  {s.title}
                </h4>
                <p
                  className="text-[14.5px] leading-relaxed max-w-[440px]"
                  style={{ color: COLORS.gray }}
                >
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STATS = [
  { num: "12,500+", label: "Students Registered" },
  { num: "850+", label: "Supervisors Active" },
  { num: "45+", label: "Nigerian Institutions" },
  { num: "98%", label: "Submission Rate" },
];

function Stats() {
  return (
    <section
      className="py-16 md:py-20 lg:py-24"
      style={{ background: COLORS.cream2 }}
    >
      <div className="max-w-[1180px] mx-auto px-7 md:px-10">
        <div
          className="relative overflow-hidden rounded-[22px] p-10 md:p-14 grid grid-cols-2 lg:grid-cols-4 gap-8 gap-x-5 text-center text-white"
          style={{
            background: `linear-gradient(155deg, ${COLORS.green700}, ${COLORS.green950})`,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={ruledTexture}
          />
          {STATS.map((s) => (
            <div key={s.label} className="relative z-10">
              <div className="font-extrabold text-[30px] md:text-[36px] lg:text-[42px]">
                {s.num}
              </div>
              <div
                className="mt-1.5 text-[13.5px] font-medium"
                style={{ color: "rgba(255,255,255,0.72)" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    initials: "CO",
    quote:
      "Logify completely eliminated the stress of carrying around a physical logbook. I can log my daily activities from my phone during my break at work.",
    name: "Chiamaka Okafor",
    role: "Computer Science Student, UNN",
  },
  {
    initials: "AN",
    quote:
      "As a SIWES coordinator, reviewing and approving reports used to take weeks. With Logify's dashboard, I clear a full department's submissions in a single afternoon.",
    name: "Adaeze Nwosu",
    role: "SIWES Coordinator, University of Lagos",
  },
];

function Testimonials() {
  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="max-w-[1180px] mx-auto px-7 md:px-10">
        <div className="max-w-[640px] mx-auto text-center mb-11">
          <span
            className="text-[12.5px] font-medium uppercase tracking-widest"
            style={{ color: COLORS.green700, fontFamily: "monospace" }}
          >
            Testimonials
          </span>
          <h2
            className="mt-2.5 font-extrabold leading-tight text-[28px] md:text-[36px] lg:text-[40px]"
            style={{ color: COLORS.ink }}
          >
            Loved by students and supervisors
          </h2>
          <p
            className="mt-3.5 text-[16px] leading-relaxed"
            style={{ color: COLORS.gray }}
          >
            Hear from Nigerian students and SIWES coordinators who have made the
            switch to digital logging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white border rounded-2xl p-8 flex flex-col gap-5"
              style={{ borderColor: COLORS.border }}
            >
              <span
                className="text-[34px] font-extrabold leading-none"
                style={{ color: COLORS.orange }}
              >
                "
              </span>
              <p
                className="text-[15.5px] leading-relaxed flex-1"
                style={{ color: "#3A3A30" }}
              >
                {t.quote}
              </p>
              <div className="flex items-center gap-3">
                <span
                  className="w-[42px] h-[42px] rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                  style={{
                    background: COLORS.green100,
                    color: COLORS.green700,
                  }}
                >
                  {t.initials}
                </span>
                <div>
                  <div
                    className="text-[14.5px] font-bold"
                    style={{ color: COLORS.ink }}
                  >
                    {t.name}
                  </div>
                  <div
                    className="text-[13px] mt-0.5"
                    style={{ color: COLORS.gray }}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="pricing" className="py-16 md:py-20 lg:py-24">
      <div className="max-w-[1180px] mx-auto px-7 md:px-10">
        <div
          className="relative overflow-hidden rounded-[24px] p-10 md:p-16 text-center text-white"
          style={{
            background: `linear-gradient(155deg, ${COLORS.green700}, ${COLORS.green950})`,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={ruledTexture}
          />
          <div className="relative z-10 max-w-[560px] mx-auto">
            <h2 className="font-extrabold leading-tight mb-4 text-[26px] md:text-[32px] lg:text-[36px]">
              Ready to ditch the paper logbook?
            </h2>
            <p
              className="text-[16px] leading-relaxed mb-8"
              style={{ color: "rgba(255,255,255,0.78)" }}
            >
              Join thousands of Nigerian students and supervisors who have
              already gone digital. Sign up free and start logging today.
            </p>
            <div className="flex flex-col gap-3 max-w-[320px] mx-auto">
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-[10px] font-semibold text-sm hover:bg-[#EDEBE0] transition"
                style={{ background: "white", color: COLORS.green900 }}
              >
                Sign Up Free
              </Link>
              <HashLink
                to="#features"
                className="px-6 py-3.5 rounded-[10px] font-semibold text-sm border hover:bg-white/5 hover:border-white transition"
                style={{
                  borderColor: "rgba(255,255,255,0.32)",
                  color: "white",
                }}
              >
                Learn More
              </HashLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FOOTER_COLS = [
  {
    title: "Product",
    links: [
      "Features",
      "How It Works",
      "For Students",
      "For Supervisors",
      "Pricing",
    ],
  },
  {
    title: "Resources",
    links: ["Help Center", "SIWES Guidelines", "Blog", "Contact Support"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Data Security"],
  },
];

function Footer() {
  return (
    <footer
      className="pt-16 pb-8 border-t"
      style={{ background: COLORS.cream2, borderColor: COLORS.border }}
    >
      <div className="max-w-[1180px] mx-auto px-7 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 mb-12">
          <div>
            <Link
              to="#"
              className="flex items-center gap-2.5 font-extrabold text-lg"
              style={{ color: COLORS.ink }}
            >
              <BrandMark />
              Logify
            </Link>
            <p
              className="mt-3.5 text-[14.5px] leading-relaxed max-w-[280px]"
              style={{ color: COLORS.gray }}
            >
              The modern digital replacement for paper SIWES logbooks. Built for
              Nigerian universities and polytechnics.
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h5
                className="text-[13px] font-bold uppercase tracking-wide mb-4"
                style={{ color: COLORS.ink }}
              >
                {col.title}
              </h5>
              {col.links.map((l) => (
                <Link
                  key={l}
                  to="#"
                  className="block text-[14.5px] py-1.5 hover:text-[#2F6B3E] transition"
                  style={{ color: COLORS.gray }}
                >
                  {l}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div
          className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left"
          style={{ borderColor: COLORS.border }}
        >
          <span className="text-[13.5px]" style={{ color: "#8C8C7F" }}>
            © 2026 Logify. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        color: COLORS.ink,
        background: COLORS.cream,
      }}
    >
      <Header />
      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}