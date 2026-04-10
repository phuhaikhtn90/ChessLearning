"use client";

import { Fragment, ReactNode } from "react";

const BADGE_PATTERNS = [
  {
    regex: /^\+\- \(Trắng thắng rõ\)$/,
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  {
    regex: /^± \(Trắng ưu thế\)$/,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    regex: /^\+= \(Trắng dễ chơi hơn\)$/,
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    regex: /^∓ \(Đen ưu thế\)$/,
    className: "border-slate-300 bg-slate-100 text-slate-700",
  },
  {
    regex: /^!! \(rất mạnh\)$/,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    regex: /^\?\? \(sai lầm nặng\)$/,
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  {
    regex: /^!\? \(đáng chú ý\)$/,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    regex: /^\?! \(đáng ngờ\)$/,
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  {
    regex: /^! \(mạnh\)$/,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    regex: /^\? \(yếu\)$/,
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
];

function renderPart(part: string, key: string): ReactNode {
  for (const pattern of BADGE_PATTERNS) {
    if (pattern.regex.test(part)) {
      return (
        <span
          key={key}
          className={`mx-0.5 inline-flex rounded-full border px-1.5 py-0.5 align-middle text-[0.72em] font-semibold leading-none ${pattern.className}`}
        >
          {part}
        </span>
      );
    }
  }

  return <Fragment key={key}>{part}</Fragment>;
}

export default function RichChessText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  if (!text) return null;

  const splitRegex =
    /(\+\- \(Trắng thắng rõ\)|± \(Trắng ưu thế\)|\+= \(Trắng dễ chơi hơn\)|∓ \(Đen ưu thế\)|!! \(rất mạnh\)|\?\? \(sai lầm nặng\)|!\? \(đáng chú ý\)|\?! \(đáng ngờ\)|! \(mạnh\)|\? \(yếu\))/g;
  const parts = text.split(splitRegex).filter(Boolean);

  return <span className={className}>{parts.map((part, index) => renderPart(part, `${index}-${part}`))}</span>;
}
