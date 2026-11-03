import type { Screen, ScreenshotElement } from "@/data/vertical-types";
import { Bell, FileText, Paperclip, Search } from "lucide-react";

function Field({ label, value, anchor }: { label: string; value: string; anchor?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#E3E6EE] py-2 last:border-b-0">
      <span className="text-[22px] text-slate">{label}</span>
      <span className="text-right text-[22px] font-bold text-navy" data-anchor={anchor}>
        {value}
      </span>
    </div>
  );
}

function Body({ screen }: { screen: Screen }) {
  switch (screen.kind) {
    case "letter":
      return (
        <div className="bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[24px] font-black uppercase tracking-wide text-navy">{screen.agency}</div>
              <div className="text-[22px] text-slate">{screen.dept}</div>
            </div>
            <div className="text-right text-[22px] text-slate">
              <div>{screen.date}</div>
              <div>{screen.ref}</div>
            </div>
          </div>
          <div className="mt-4 text-[24px] font-bold text-navy">{screen.subject}</div>
          <div className="mt-3 text-[22px] text-navy/85">{screen.greeting}</div>
          {screen.paragraphs.map((p, i) => (
            <p key={i} className="mt-2 text-[22px] leading-snug text-navy/85">
              {p}
            </p>
          ))}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#EEF2F8] px-4 py-3">
            <span className="text-[22px] text-slate">{screen.highlight.label}</span>
            <span className="text-[26px] font-black tracking-wider text-navy" data-anchor={screen.highlight.anchor}>
              {screen.highlight.value}
            </span>
          </div>
        </div>
      );
    case "email":
      return (
        <div className="bg-white">
          <div className="border-b border-[#E3E6EE] px-6 py-4">
            <div className="text-[26px] font-bold leading-tight text-navy" data-anchor="subject">
              {screen.subject}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#64748B] text-[22px] font-black text-white">
                {screen.from.slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1 text-[22px] leading-tight">
                <div className="truncate font-bold text-navy">{screen.from}</div>
                <div className="truncate text-slate">{screen.to}</div>
              </div>
              <div className="text-[22px] text-slate">{screen.time}</div>
            </div>
          </div>
          <div className="px-6 py-4">
            {screen.body.map((p, i) => (
              <p key={i} className="mt-2 text-[22px] leading-snug text-navy/85 first:mt-0" data-anchor={`body-${i + 1}`}>
                {p}
              </p>
            ))}
            {screen.attachment && (
              <div
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#E3E6EE] bg-[#EEF2F8] px-4 py-2 text-[22px] font-semibold text-navy"
                data-anchor={screen.attachment.anchor}
              >
                <Paperclip size={22} />
                {screen.attachment.name}
              </div>
            )}
          </div>
        </div>
      );
    case "document":
      return (
        <div className="bg-white px-6 py-6">
          {screen.state && (
            <div className="text-center text-[22px] font-bold uppercase tracking-[0.18em] text-slate">{screen.state}</div>
          )}
          <div className="mt-2 text-center text-[32px] font-black leading-tight text-navy" data-anchor="title">
            {screen.title}
          </div>
          {screen.subtitle && <div className="mt-1 text-center text-[22px] text-slate">{screen.subtitle}</div>}
          <div className="mt-5 rounded-xl border border-[#E3E6EE] px-4 py-1">
            {screen.fields.map((f) => (
              <Field key={f.label} {...f} />
            ))}
          </div>
          {screen.stamp && (
            <div className="mt-4 flex justify-end">
              <span className="rotate-[-4deg] rounded-md border-[3px] border-[#4F6BFF] px-3 py-1 text-[22px] font-black uppercase tracking-wider text-[#4F6BFF]">
                {screen.stamp}
              </span>
            </div>
          )}
        </div>
      );
    case "dashboard":
      return (
        <div className="bg-white">
          <div className="flex items-center gap-3 border-b border-[#E3E6EE] px-6 py-4">
            <span className="h-10 w-10 rounded-xl bg-navy" />
            <div className="flex-1 text-[24px] font-black text-navy">{screen.app}</div>
            <Search size={24} className="text-slate" />
            <Bell size={24} className="text-slate" />
          </div>
          <div className="px-6 py-4">
            <div className="text-[22px] text-slate">{screen.account}</div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-[22px] font-semibold text-navy">{screen.balanceLabel}</span>
              <span className="masked !w-[6em] !h-[1.2em]" aria-hidden />
            </div>
          </div>
          <div className="border-t border-[#E3E6EE]">
            {screen.rows.map((r, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-[#E3E6EE] px-6 py-3 last:border-b-0" data-anchor={r.anchor}>
                <span
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[22px] font-black"
                  style={{ background: r.positive ? "#DDF3EC" : "#E2E8F0", color: r.positive ? "#1F8F6A" : "#475569" }}
                >
                  {r.positive ? "+" : "−"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[22px] font-bold leading-tight text-navy">{r.name}</div>
                  <div className="text-[22px] leading-tight text-slate">{r.note}</div>
                </div>
                <span className="masked !w-[3.2em]" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      );
    case "notice":
      return (
        <div className="bg-white px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[22px] font-bold text-slate">{screen.sender}</div>
            <span className="rounded-full bg-[#E8ECFF] px-3 py-1 text-[22px] font-bold text-[#4F6BFF]">{screen.badge}</span>
          </div>
          <div className="mt-3 text-[28px] font-black leading-tight text-navy" data-anchor="title">
            {screen.title}
          </div>
          <ul className="mt-3 space-y-1.5">
            {screen.lines.map((l, i) => (
              <li key={i} className="flex gap-2 text-[22px] leading-snug text-navy/85">
                <span className="mt-[11px] h-2 w-2 shrink-0 rounded-full bg-[#4F6BFF]" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
          {screen.deadline && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#EEF2F8] px-4 py-3">
              <span className="text-[22px] text-slate">{screen.deadline.label}</span>
              <span className="text-[24px] font-black text-navy" data-anchor={screen.deadline.anchor}>
                {screen.deadline.value}
              </span>
            </div>
          )}
          <div className="mt-4 rounded-xl bg-navy px-4 py-3 text-center text-[22px] font-bold text-white">{screen.cta}</div>
        </div>
      );
    case "form":
      return (
        <div className="bg-white px-6 py-5">
          <div className="flex items-start gap-4 border-b-[3px] border-navy pb-3">
            <div className="shrink-0">
              <div className="text-[22px] font-bold text-slate">{screen.formLabel}</div>
              <div className="text-[40px] font-black leading-none text-navy" data-anchor="number">
                {screen.formNumber}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[24px] font-black leading-tight text-navy">{screen.title}</div>
              <div className="mt-1 text-[22px] leading-snug text-slate">{screen.subtitle}</div>
            </div>
          </div>
          <div className="mt-3">
            {screen.fields.map((f) => (
              <Field key={f.label} {...f} />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#EEF2F8] px-4 py-3">
            <span className="text-[22px] text-slate">{screen.deadline.label}</span>
            <span className="text-[24px] font-black text-navy" data-anchor={screen.deadline.anchor}>
              {screen.deadline.value}
            </span>
          </div>
        </div>
      );
  }
}

export function Screenshot({ el }: { el: ScreenshotElement }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E3E6EE] bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-[#E3E6EE] bg-[#EEF2F8] px-4 py-3">
        <span className="h-3.5 w-3.5 rounded-full bg-[#C5CFE6]" />
        <span className="h-3.5 w-3.5 rounded-full bg-[#C5CFE6]" />
        <span className="h-3.5 w-3.5 rounded-full bg-[#C5CFE6]" />
        <span className="ml-3 inline-flex items-center gap-2 truncate text-[22px] font-semibold text-slate">
          <FileText size={20} />
          {el.window}
        </span>
      </div>
      <Body screen={el.screen} />
    </div>
  );
}
