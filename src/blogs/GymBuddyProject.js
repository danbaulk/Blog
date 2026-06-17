import React from 'react';

import today from '../assets/gymbuddy-today.png';
import routines from '../assets/gymbuddy-routines.png';
import stretches from '../assets/gymbuddy-stretches.png';
import timer from '../assets/gymbuddy-timer.png';

import './blogs.css';

function GymBuddyProject() {
  return (
    <div className="blog-post">
      <h1>GymBuddy</h1>
      <a href="https://github.com/danbaulk/gymbuddy" target="_blank" rel="noopener noreferrer">GitHub Repository</a>

      <h2>Intro</h2>
      <p>
        GymBuddy is a small, local-first gym tracker I built for myself. The pitch is simple: set up
        your routines once, and every time you walk into the gym it tells you exactly which one is
        next. You tick off each exercise, log the weight you hit, and mark the routine done — and it
        remembers, so next week your last numbers are sitting right there to beat.
      </p>
      <p>
        There are no accounts and no server. Everything lives in your browser. It does one job — taking
        the admin out of progressive overload — and tries to do it without any fuss, on a phone, between
        sets.
      </p>

      <img src={today} alt="GymBuddy's Today view — the next routine as a weight-logging checklist"/>

      <h2>The Problem</h2>
      <p>
        For years my lifting log was a notes-app page and a fading memory. I run a six-day
        Push/Pull/Legs split, which means the single most common question at the gym is also the most
        annoying: <em>which workout am I even doing today?</em> Miss a day, go away for a weekend, and
        the rotation falls out of your head entirely.
      </p>
      <p>
        Then there's the weight itself. Progressive overload only works if you know what you did last
        time, and "I think it was 60-ish?" is not knowing. Worse, the thing that actually matters —
        whether a lift is <em>moving</em> — is invisible in a flat list of numbers. You can grind the
        same weight on an exercise for a month without noticing. None of this is hard, exactly, but it's
        the same bookkeeping every single session, and a computer should be doing it.
      </p>

      <h2>Routines and the Round-Robin</h2>
      <p>
        Everything is built around the rotation. You create your routines — Push 1, Pull 1, Legs 1, and
        so on — each with its own ordered list of exercises, and the <strong>order of the list is the
        order you do them in</strong>. GymBuddy round-robins through them: there's always exactly one
        routine marked <code>NEXT</code>, and when you finish it the app advances to the following one,
        wrapping back to the top at the end. No calendar, no scheduling — just "what's next", every time.
      </p>
      <p>
        That single rule is what removes the daily decision. Internally it's almost boringly simple: the
        routines live in an array, a <code>currentIndex</code> points at the one that's up next, and
        marking a routine done bumps the index forward with wraparound. Reorder the list — there are
        up/down arrows on every routine — and you've reordered your whole training week.
      </p>

      <img src={routines} alt="GymBuddy's Routines view — six routines with the NEXT badge and reorder controls"/>

      <h2>Logging the Work</h2>
      <p>
        A session is a checklist. Each exercise shows its target reps and, crucially, your last weight
        for it, so you always know the number to beat. You enter what you hit — there are{' '}
        <strong>+/− steppers</strong> for thumb-friendly nudges of 2.5&nbsp;kg, since fiddling with a
        number pad mid-set is no fun — tick it off, and when the whole routine's done you mark it done.
        Weights are in kilograms throughout; there's no unit switching anywhere, because adding it would
        be complexity I don't need.
      </p>
      <p>
        Two details I cared about. First, the in-progress log is <em>persisted</em>: if your phone
        locks or the browser reloads halfway through a session — which, at a gym, it will — nothing you've
        already logged is lost. Second, an exercise's "last weight" is never stored on the exercise
        itself. It's <em>derived</em> by scanning your session history newest-first, so it's always the
        truth of what you actually lifted, and it can never drift out of sync with reality.
      </p>

      <h2>Spotting Plateaus</h2>
      <p>
        This is the part I'm happiest with, because it catches the thing I used to miss by eye. GymBuddy
        watches each exercise across the rotations and counts how many cycles it's been since the weight
        last went up. Stall on an exercise and it earns an inline badge — <code>1 cyc</code>,{' '}
        <code>2 cyc</code>, <code>3 cyc</code> — that shifts from green through amber to red as the
        plateau drags on. It's a gentle, honest nudge: <em>this one hasn't moved, do something about
        it.</em>
      </p>
      <p>
        For the full picture, every exercise has a <strong>History</strong> toggle that unfolds a little
        sparkline of its logged weights over time. No dashboards, no charts page — just the one line that
        answers "is this going up?" right where you're about to lift.
      </p>

      <h2>Stretches</h2>
      <p>
        Tucked alongside the lifting is a standalone stretches section, because a mobility routine is
        really a different shape of problem: not weights and reps, but a sequence of timed holds. You
        build a named routine — a list of stretches, each with a duration — and then press{' '}
        <strong>Go</strong> for a guided, full-screen timer. It counts each hold down, shows you what's
        coming next, and you tap to advance. It's deliberately hands-off: something you can prop on a
        bench and follow without touching, which is exactly what you want when you're folded into a
        pancake stretch.
      </p>

      <img src={stretches} alt="GymBuddy's Stretches view — a Mobility routine ready to run"/>
      <img src={timer} alt="GymBuddy's guided stretch timer counting down a hold"/>

      <h2>The Tech Stack</h2>
      <p>
        Under the hood it's a single-page app — React 19 with TypeScript, built with Vite, styled with
        plain CSS and no framework. There's no router: the whole UI is a four-tab shell held in a bit of
        component state. And there's no backend at all. The entire application state is one{' '}
        <code>AppState</code> object driven through a single reducer, and the whole thing is persisted to
        one <code>localStorage</code> key, <code>gymbuddy:state</code>. That's the complete data layer.
      </p>
      <p>
        Keeping it that small didn't mean cutting corners. A few things I was deliberate about:
      </p>
      <ul>
        <li><strong>A pure core.</strong> Every domain mutation lives in one framework-free reducer with no React imports — which is exactly what the tests exercise directly, no rendering required.</li>
        <li><strong>Derived, never stored.</strong> Last weights and plateau counts are computed from session history on demand, so the displayed numbers can never contradict what you actually logged.</li>
        <li><strong>Versioned storage.</strong> The saved blob carries a schema version, and load falls back safely rather than crashing on something it doesn't recognise — so a future model change doesn't brick an existing install.</li>
        <li><strong>One place that touches storage.</strong> All persistence is funnelled through a single module, with JSON export/import for backups, so the eventual swap to a real backend is a localised change rather than a rewrite.</li>
      </ul>

      <h2>The Future</h2>
      <p>
        GymBuddy is deliberately local-first for now, and for a single-user gym log that's genuinely
        enough. The obvious next step is the one every local-first app eventually meets: accounts, cloud
        sync, and hosting, so the same history follows you across devices. Because every byte of
        persistence already goes through one storage module, most of the app won't need to know it
        happened. Until then it does exactly what I wanted — it's replaced the notes-app page, and I
        haven't lost my place in the rotation since.
      </p>
    </div>
  );
}

export default GymBuddyProject;
