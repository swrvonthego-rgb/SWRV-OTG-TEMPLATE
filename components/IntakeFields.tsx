import React from 'react';
import type { AnswerValue, Question } from '../intake.config';

const Orange = '#FF4D00';
export const FIELD_STYLE = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };

export type Answers = Record<string, AnswerValue>;

export function isAnswered(q: Question, answers: Answers) {
  const v = answers[q.id];
  return Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim());
}

export function firstMissing(questions: Question[], answers: Answers) {
  return questions.find((q) => !q.optional && !isAnswered(q, answers));
}

// Shape the Worker's normalizeIntake expects: [{id, question, answer}].
export function toIntakePayload(questions: Question[], answers: Answers) {
  return questions
    .filter((q) => isAnswered(q, answers))
    .map((q) => ({ id: q.id, question: q.question, answer: answers[q.id] }));
}

function HelpSteps({ steps }: { steps: string[] }) {
  return (
    <details className="mt-2 rounded-lg px-3 py-2" style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.2)' }}>
      <summary className="text-xs font-semibold cursor-pointer" style={{ color: '#e8c96a' }}>How do I do this?</summary>
      <ol className="mt-2 space-y-1.5 list-decimal pl-4">
        {steps.map((st, i) => <li key={i} className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{st}</li>)}
      </ol>
    </details>
  );
}

// Renders a whole intake question set (from intake.config.ts) on one
// scrolling page — used by the Book & Pay flow and the /song page.
export function IntakeFields({ questions, answers, onChange }: {
  questions: Question[];
  answers: Answers;
  onChange: (next: Answers) => void;
}) {
  const setAnswer = (id: string, value: AnswerValue) => onChange({ ...answers, [id]: value });
  const toggleMulti = (id: string, opt: string) => {
    const cur = Array.isArray(answers[id]) ? (answers[id] as string[]) : [];
    setAnswer(id, cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt]);
  };

  return (
    <>
      {questions.map((q) => (
        <div key={q.id}>
          <p className="text-sm font-semibold text-white">
            {q.question}{q.optional && <span className="font-normal" style={{ color: 'rgba(255,255,255,0.35)' }}> · optional</span>}
          </p>
          {q.sub && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{q.sub}</p>}
          {q.help && <HelpSteps steps={q.help} />}
          <div className="mt-2">
            {(q.type === 'single' || q.type === 'multi') && (
              <div className="flex flex-wrap gap-2">
                {q.options?.map((opt) => {
                  const on = q.type === 'multi'
                    ? Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt)
                    : answers[q.id] === opt;
                  return (
                    <button key={opt} type="button"
                      onClick={() => (q.type === 'multi' ? toggleMulti(q.id, opt) : setAnswer(q.id, opt))}
                      className="px-3 py-1.5 rounded-full text-xs transition-all text-left"
                      style={{
                        background: on ? 'rgba(255,77,0,0.18)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${on ? Orange : 'rgba(255,255,255,0.12)'}`,
                        color: on ? '#fff' : 'rgba(255,255,255,0.7)',
                      }}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
            {q.type === 'text' && (
              <input type="text" value={(answers[q.id] as string) || ''} placeholder={q.placeholder}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none" style={FIELD_STYLE} />
            )}
            {q.type === 'textarea' && (
              <textarea rows={3} value={(answers[q.id] as string) || ''} placeholder={q.placeholder}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none resize-none" style={FIELD_STYLE} />
            )}
          </div>
        </div>
      ))}
    </>
  );
}
