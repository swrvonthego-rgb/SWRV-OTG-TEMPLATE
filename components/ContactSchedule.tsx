import React, { useState } from 'react';
import { Calendar, Clock, Mail, MessageSquare, Phone, CheckCircle, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isBefore, startOfToday, getDay, eachDayOfInterval } from 'date-fns';

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];

// Days you're available (0=Sun,1=Mon,...6=Sat) — Mon–Sat
const AVAILABLE_DAYS = [1, 2, 3, 4, 5, 6];

const TOPICS = [
  'Website Package Inquiry',
  'Monthly Care Plan',
  'Brand Video / Commercial',
  'Photography / Videography',
  'Music / Jingle Production',
  'Full Brand Strategy',
  'Something Else',
];

const CONTACT_EMAIL = 'swrvonthego@gmail.com';

export const ContactSchedule: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [step, setStep] = useState<'calendar' | 'details' | 'success'>('calendar');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [agreeToContact, setAgreeToContact] = useState(false);

  const today = startOfToday();

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const isAvailable = (day: Date) =>
    !isBefore(day, today) &&
    isSameMonth(day, currentMonth) &&
    AVAILABLE_DAYS.includes(getDay(day));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !name || !email || !agreeToContact) return;

    const dateStr = format(selectedDate, 'EEEE, MMMM d, yyyy');
    const subject = encodeURIComponent(`SWRV Call Request — ${topic || 'General Inquiry'} — ${dateStr}`);
    const body = encodeURIComponent(
      `Hi Zion,\n\nI'd like to schedule a call with SWRV On The Go.\n\n` +
      `NAME: ${name}\n` +
      `EMAIL: ${email}\n` +
      `PHONE: ${phone || 'Not provided'}\n` +
      `PREFERRED DATE: ${dateStr}\n` +
      `PREFERRED TIME: ${selectedTime} (CST)\n` +
      `TOPIC: ${topic || 'General Inquiry'}\n\n` +
      `DETAILS:\n${message || 'No additional details provided.'}\n\n` +
      `I agree to be contacted by SWRV On The Go regarding this inquiry.\n`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setStep('success');
  };

  if (step === 'success') {
    return (
      <section id="contact" className="py-28 bg-[#060606] text-white">
        <div className="container mx-auto px-6 max-w-xl text-center">
          <div className="w-20 h-20 rounded-full bg-lion-orange/10 border border-lion-orange/30 flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="text-lion-orange" size={40} />
          </div>
          <h2 className="text-4xl font-black uppercase mb-4">Request Sent.</h2>
          <p className="text-white/60 leading-relaxed mb-8">
            Your email app should have opened with everything pre-filled. Hit send if you haven't yet — 
            Zion will confirm your time within 24 hours.
          </p>
          <button
            onClick={() => { setStep('calendar'); setSelectedDate(null); setSelectedTime(''); setName(''); setEmail(''); setPhone(''); setTopic(''); setMessage(''); setAgreeToContact(false); }}
            className="px-8 py-3 bg-lion-orange text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors"
          >
            Schedule Another
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-28 bg-[#060606] text-white">
      <div className="container mx-auto px-6 max-w-6xl">

        {/* Header */}
        <div className="mb-16">
          <p className="text-lion-orange text-xs font-bold tracking-[0.4em] uppercase mb-4">// LET'S CONNECT</p>
          <h2 className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tight mb-6">
            BOOK A<br />
            <span className="text-lion-orange">CALL WITH SWRV</span>
          </h2>
          <div className="w-16 h-[2px] bg-lion-orange mb-6" />
          <p className="text-white/60 text-lg max-w-xl leading-relaxed">
            Pick a date and time, tell us what you need, and we'll lock in a conversation. 
            No pressure. Just a real talk about your vision.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* LEFT — Quick Contact + Calendar */}
          <div>
            {/* Direct Contact Cards */}
            <div className="grid grid-cols-1 gap-4 mb-10">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-4 p-5 border border-white/10 hover:border-lion-orange/50 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
              >
                <div className="w-12 h-12 rounded-sm bg-lion-orange/10 border border-lion-orange/20 flex items-center justify-center group-hover:bg-lion-orange/20 transition-colors">
                  <Mail className="text-lion-orange" size={20} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Email Direct</p>
                  <p className="text-white/50 text-xs tracking-wide">{CONTACT_EMAIL}</p>
                </div>
              </a>

              <a
                href="sms:+1XXXXXXXXXX"
                className="flex items-center gap-4 p-5 border border-white/10 hover:border-lion-orange/50 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
              >
                <div className="w-12 h-12 rounded-sm bg-lion-orange/10 border border-lion-orange/20 flex items-center justify-center group-hover:bg-lion-orange/20 transition-colors">
                  <MessageSquare className="text-lion-orange" size={20} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Text First</p>
                  <p className="text-white/50 text-xs tracking-wide">Quickest response — drop your name + what you need</p>
                </div>
              </a>
            </div>

            {/* Calendar */}
            <div className="border border-white/10 bg-white/[0.02] p-6">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                  className="p-2 hover:text-lion-orange transition-colors"
                  disabled={isBefore(startOfMonth(currentMonth), startOfMonth(today))}
                >
                  <ChevronLeft size={18} />
                </button>
                <p className="font-bold tracking-widest text-sm uppercase">
                  {format(currentMonth, 'MMMM yyyy')}
                </p>
                <button
                  onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                  className="p-2 hover:text-lion-orange transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-center text-white/25 text-xs font-bold py-1">{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-y-1">
                {calendarDays.map(day => {
                  const available = isAvailable(day);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const inMonth = isSameMonth(day, currentMonth);

                  return (
                    <button
                      key={day.toISOString()}
                      disabled={!available}
                      onClick={() => { setSelectedDate(day); setSelectedTime(''); }}
                      className={`aspect-square flex items-center justify-center text-sm rounded-sm mx-0.5 transition-all font-medium
                        ${!inMonth ? 'opacity-0 pointer-events-none' : ''}
                        ${selected ? 'bg-lion-orange text-white' : ''}
                        ${available && !selected ? 'text-white hover:bg-lion-orange/20 hover:text-lion-orange' : ''}
                        ${!available && inMonth ? 'text-white/15 cursor-not-allowed' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-white/50 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock size={12} />
                    {format(selectedDate, 'EEE, MMM d')} — Choose a time (CST)
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-2 text-xs font-bold border transition-all rounded-sm
                          ${selectedTime === t
                            ? 'bg-lion-orange border-lion-orange text-white'
                            : 'border-white/15 text-white/60 hover:border-lion-orange/50 hover:text-white'}
                        `}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Details Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="First & Last Name"
                  className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-white/25 px-4 py-3 text-sm focus:outline-none focus:border-lion-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-white/25 px-4 py-3 text-sm focus:outline-none focus:border-lion-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-white/25 px-4 py-3 text-sm focus:outline-none focus:border-lion-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">What Do You Need? *</label>
                <select
                  required
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-lion-orange transition-colors appearance-none"
                >
                  <option value="">Select a topic...</option>
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Tell Us More</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="A quick overview of your vision, project, or what you're trying to accomplish..."
                  className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-white/25 px-4 py-3 text-sm focus:outline-none focus:border-lion-orange transition-colors resize-none"
                />
              </div>

              {/* Selected slot summary */}
              {selectedDate && selectedTime && (
                <div className="flex items-center gap-3 p-4 border border-lion-orange/30 bg-lion-orange/5 text-sm">
                  <Calendar size={16} className="text-lion-orange shrink-0" />
                  <span className="text-white/80">
                    <span className="text-lion-orange font-bold">{format(selectedDate, 'EEE, MMMM d')}</span> at <span className="text-lion-orange font-bold">{selectedTime}</span> CST
                  </span>
                </div>
              )}

              {/* Agreement */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={agreeToContact}
                  onChange={e => setAgreeToContact(e.target.checked)}
                  className="mt-1 accent-orange-500 w-4 h-4 shrink-0"
                />
                <span className="text-white/45 text-xs leading-relaxed">
                  I agree to be contacted by SWRV On The Go at the email and/or phone I provided. 
                  I understand this is not a final booking — Zion will confirm the time within 24 hours. 
                  No spam. Ever.
                </span>
              </label>

              <button
                type="submit"
                disabled={!selectedDate || !selectedTime || !name || !email || !agreeToContact}
                className="w-full flex items-center justify-center gap-3 py-4 bg-lion-orange text-white font-black uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                Request This Time
              </button>

              <p className="text-white/25 text-xs text-center leading-relaxed">
                No backend servers here — this opens your email app with everything pre-filled. 
                Hit send to submit.
              </p>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};
