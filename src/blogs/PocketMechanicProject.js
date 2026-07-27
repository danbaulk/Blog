import React from 'react';

import dashboard from '../assets/pocketmechanic-dashboard.png';
import parts from '../assets/pocketmechanic-parts.png';
import inspection from '../assets/pocketmechanic-inspection.png';
import timeline from '../assets/pocketmechanic-timeline.png';
import receipt from '../assets/pocketmechanic-receipt.png';

import './blogs.css';

function PocketMechanicProject() {
  return (
    <div className="blog-post">
      <h1>PocketMechanic</h1>
      <a href="https://github.com/danbaulk/pocketmechanic" target="_blank" rel="noopener noreferrer">GitHub Repository</a>

      <h2>Intro</h2>
      <p>
        PocketMechanic is a local-first car-care app I built for myself. The pitch is simple: breakdowns
        rarely happen for no reason. Usually it's an old part that had been on its way out for a while,
        quietly, where nobody was looking. So the app gives every part of your car a{' '}
        <strong>green, amber or red</strong> signal, tells you what each one will cost, and lets you see
        the whole thing at a glance on a little picture of your car.
      </p>
      <p>
        There are no accounts and no server. Everything lives in your browser. It does one job - making
        the wear on your car legible before it strands you - and the main way you feed it is by
        photographing the receipt the garage just handed you.
      </p>

      <img src={dashboard} alt="PocketMechanic's dashboard - the estimated mileage, the logging buttons, and a schematic car with each area coloured by the worst part living there"/>

      <h2>The Problem</h2>
      <p>
        The honest record of a car is a glovebox full of faded receipts and a vague feeling. Ask me when
        the cambelt was last done and I could give you a year, maybe, with a shrug attached. Ask me
        whether the front discs are near the end and I'd have to wait for the MOT advisory to tell me.
        Nothing about a car is a surprise to the car - it's only a surprise to the owner.
      </p>
      <p>
        None of that is a real problem, exactly. Garages will tell you eventually, and most of the time
        eventually is fine. But <em>eventually</em> tends to arrive as a bill you didn't plan for, and the
        information needed to see it coming was sitting in that glovebox the whole time. I wanted the
        pile of paper turned into a picture.
      </p>

      <h2>The Health Signal</h2>
      <p>
        Every part in the app's catalogue - nineteen of them, from engine oil to the clutch - carries two
        clocks: a mileage interval and an age interval. Brake fluid doesn't care how far you've driven,
        it cares that it's two years old; tyres are the other way round. The health engine runs both and
        takes whichever is <strong>closest to running out</strong>. Green means fine, amber means you're
        in the last 10% of its life, red means it's due. Replacing a part resets its clock, which is the
        one action that makes the whole model work.
      </p>
      <p>
        The catch is that the app doesn't know your actual mileage on any given day, and a wear signal
        that only updates when you remember to type a number in is a signal you stop trusting. So current
        mileage is <em>estimated</em>, on what I think of as the electricity-meter model: take the last
        real odometer reading, project your average annual mileage across the days since, and re-anchor
        the moment you enter a fresh one. Every part's due date quietly moves closer while you're not
        looking, which is exactly what's happening to the car.
      </p>

      <h2>The Car Avatar</h2>
      <p>
        The headline screen is a schematic side-profile of a car split into five physical areas - engine
        bay, windscreen, front wheels, rear wheels, underside - each one painted with the worst RAG of
        the parts that live there. One glance tells you whether anything needs you, and tapping an area
        jumps you straight to that section of the parts list. It's the closest thing the app has to a
        notification: no push, no email, just a car with an orange bonnet the next time you open it.
      </p>
      <p>
        That's only possible because of a decision made right at the start: parts are filed by{' '}
        <em>where they physically are</em> on the car, not by what they functionally do. "Brakes" and
        "consumables" are the natural categories and they're useless here, because you can't draw them.
        Front brake pads and front tyres live in the same place, so they get coloured together, and the
        parts list and the avatar are two renderings of one grouping rather than two things to keep in
        step.
      </p>

      <img src={parts} alt="PocketMechanic's parts list - areas ordered by urgency, each part with its RAG dot, due text, typical cost range and a progress bar"/>

      <h2>History, and What a Check Is Worth</h2>
      <p>
        Underneath sits a dated timeline of everything that's happened to the car: services, MOTs,
        repairs, inspections, bare odometer readings. Ticking a part as replaced on an entry both writes
        the record and resets that part's wear clock, so there's no separate bookkeeping step to forget.
        There's also a Print button that turns the whole thing into a clean one-page service record for a
        resale - with a column that just says whether there's paperwork for each job, because that's the
        question a buyer actually asks.
      </p>
      <p>
        The interesting problem was inspections. A part can be red on arithmetic alone while the garage
        that just looked at it says it's fine, and a permanent red badge you know to be wrong will burn
        down your trust in every other badge on the screen. But a check isn't a replacement either - the
        part is still exactly as old as it was. So a passed inspection <strong>extends</strong> a part's
        life rather than resetting its clock: it buys a further 25% of that part's own interval, measured
        from wherever the part had got to on the day it was checked. I built a "recheck window" version
        first and deleted it, because it redrew a part that was 122% through its life as green at "0% of
        its recheck window", which read as a lie. The part detail now says the real number out loud.
      </p>

      <img src={inspection} alt="PocketMechanic's part detail - a timing belt marked 'checked OK', explaining that the inspection bought it a further 25% of its usual interval while it has used 122% of that interval"/>
      <img src={timeline} alt="PocketMechanic's history timeline - service, MOT and repair entries with dates, mileages, costs and a receipt marker"/>

      <h2>Reading Receipts Offline</h2>
      <p>
        Typing a service in by hand is exactly the chore that kills apps like this, so the primary button
        is <strong>Scan a receipt</strong>: photograph the invoice, and the date, mileage, cost, garage
        and the parts that were worked on come back filled in. A vision model would read those receipts
        far more accurately than anything else available, and I rejected it outright. Every route to one
        breaks the thing that makes this app what it is - a browser-held API key is a key sitting in
        localStorage, and a proxy means the app is no longer local-first and no longer free to run. So
        it's Tesseract compiled to WebAssembly, running in the browser on your photo. Its worker, cores
        and language data are copied into the app at install time rather than pulled from a CDN, because
        an offline-by-choice feature that needs the network is a lie.
      </p>
      <p>
        What makes an offline parser viable isn't the OCR, it's a table of domain knowledge: real invoices
        say <code>CAMBELT KIT</code>, <code>N/S/F PAD SET</code> and <code>A/C RE-GAS</code>, never the
        catalogue's tidy names. My favourite entry in it isn't a word that's there, it's one that isn't -{' '}
        <code>back</code> is deliberately absent from the rear-axle patterns, because it would fire on
        "back box", which is an exhaust. And the sharpest bug came from the real world: garages are named
        after what they sell, so "CITY TYRES" and "EXHAUST CENTRE" were matching as <em>work done</em>,
        which would have reset a wear clock on the strength of a trading name. Letterhead lines now only
        count if they carry a price.
      </p>
      <p>
        The load-bearing idea, though, is that <strong>nothing depends on the parse being right</strong>.
        Every extracted field carries a confidence and is labelled either "from receipt" or a bright amber
        "please check". Lines it couldn't place are listed rather than dropped, the raw scanned text is a
        click away, and the photo is saved even when the reading fails completely. When I scanned the
        receipt below, it read "Alternator tested - OK" as an alternator <em>replacement</em> - which is
        wrong, and took one tap to fix before saving. That's the whole design: the scan is a first draft
        you correct, not an answer you have to trust.
      </p>

      <img src={receipt} alt="PocketMechanic's receipt review screen - the type, date, mileage, cost and garage all pre-filled from a scan, each field labelled 'from receipt'"/>

      <h2>The Tech Stack</h2>
      <p>
        Under the hood it's a single-page app - React 19 with TypeScript, built with Vite, styled with
        Tailwind, tested with Vitest, and carrying exactly three runtime dependencies. There's no router:
        the whole UI is a dashboard plus a couple of modals held in component state. And there's no
        backend at all. The entire application state is one <code>AppState</code> object driven through a
        pure reducer and persisted to one <code>localStorage</code> key,{' '}
        <code>pocketmechanic:state</code>.
      </p>
      <p>
        Keeping it that small didn't mean cutting corners. A few things I was deliberate about:
      </p>
      <ul>
        <li><strong>A pure core.</strong> The reducer, the health engine, the history rules and the receipt parser are all framework-free modules with no React imports and a sibling test file each - 171 tests that run in a quarter of a second without rendering anything.</li>
        <li><strong>Derived, never stored.</strong> The odometer anchor and every part's wear-clock start are recomputed from the history list rather than accumulated, so editing or deleting an entry re-derives the whole readout instead of stranding it on a job that no longer exists.</li>
        <li><strong>Two stores, one owner each.</strong> State goes to localStorage; receipt photos go to IndexedDB, joined by a small reference. The whole state blob is re-serialised on every single change, so keeping images out of it isn't tidiness, it's the difference between working and hitting the quota on your second receipt.</li>
        <li><strong>Failures that admit it.</strong> The saved blob carries a schema version and migrates forward step by step, and a write that fails surfaces as a banner rather than being swallowed - because once writes start failing, every later change silently stops persisting too.</li>
      </ul>

      <h2>The Future</h2>
      <p>
        PocketMechanic is tagged as a <strong>prototype</strong>, which is exactly what it is: the local
        app is finished and the interesting part is what it can't do. The feature I want most is the one
        the architecture blocks - type in your registration and have the DVLA and MOT history services
        fill in the make, model and years of genuine odometer readings, which would replace nearly all
        the setup typing and make the mileage estimate real rather than assumed. That needs API keys,
        which needs a server, which is the same wall the vision model hit. Local-first isn't free; it
        costs you exactly the features that need someone else's data. That trade is the natural
        productionise step rather than a local one. Until then it does exactly what I wanted: the glovebox
        is now a picture of a car, and I can see what's coming.
      </p>
    </div>
  );
}

export default PocketMechanicProject;
