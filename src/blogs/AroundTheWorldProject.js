import React from 'react';

import map from '../assets/aroundtheworld-map.png';
import country from '../assets/aroundtheworld-country.png';
import passport from '../assets/aroundtheworld-passport.png';
import challenges from '../assets/aroundtheworld-challenges.png';

import './blogs.css';

function AroundTheWorldProject() {
  return (
    <div className="blog-post">
      <h1>Around the World</h1>
      <a href="https://github.com/danbaulk/aroundtheworld" target="_blank" rel="noopener noreferrer">GitHub Repository</a>

      <h2>Intro</h2>
      <p>
        Around the World is a local-first travel scratch-map I built for myself. The pitch is simple:
        it's a map of the world you <em>scratch off</em> as you go. Tap a country you've been to and it
        turns green; tap one you're dreaming about and it goes amber onto a bucket list. Log the trips
        with dates and notes and the app quietly turns them into a passport, a set of badges, and a
        handful of challenges to chase.
      </p>
      <p>
        There are no accounts and no server. Everything lives in your browser. It does one job - giving
        you an honest, at-a-glance picture of where you've been and where you want to go - and tries to
        make filling it in feel like a reward rather than a chore.
      </p>

      <img src={map} alt="Around the World's map view - visited countries in green, bucket-list countries in amber, with progress stats across the top"/>

      <h2>The Problem</h2>
      <p>
        I could never actually answer the question <em>where have I been?</em> The honest record was
        scattered across a fading memory, a few photo albums, and the occasional passport stamp I'd have
        to dig the passport out to read. And the flip side - <em>where do I still want to go?</em> - lived
        as a vague mental list that reset every time someone asked.
      </p>
      <p>
        None of that is a real problem, exactly. But I wanted one place that just showed me the whole
        picture: a map that fills in over time, so a decade of trips accretes into something you can see
        in a single glance, and a wishlist that sits right next to it on the same map instead of in my
        head.
      </p>

      <h2>The Scratch Map</h2>
      <p>
        The home screen is the map, and it's the whole point. It's a real, pan-and-zoom world map, and
        every country is a tap target. Tap once to open a country and mark it <strong>visited</strong> or
        drop it on your <strong>bucket list</strong>; visited turns green, bucket-list turns amber,
        everything else stays a neutral slate. Zoom in and country labels fade in tier by tier - the
        giants first, the city-states only once you're close - so the map is never a wall of text.
      </p>
      <p>
        A detail I got weirdly invested in: <em>what even counts as a country?</em> The map renders
        around 250 territories, but the "percentage of the world" stat is measured against the{' '}
        <strong>194 UN members</strong>. So places like Kosovo are fully tappable and scratch off just
        like anywhere else - they just don't move the denominator. It's a small thing nobody will
        consciously notice, which is exactly why it was worth getting right.
      </p>

      <h2>Dated Visits and the Passport</h2>
      <p>
        A country isn't just visited or not - it's <em>visited in a particular month, a particular year,
        with a note about the trip</em>. You can log more than one visit to the same place, so the three
        times you've been to France are three separate entries, each with its own date and memory
        attached. It still only counts once toward your totals, but the history is all there.
      </p>
      <p>
        Those dated visits are what feed the <strong>passport</strong>: a vertical, chronological
        timeline where every visit gets its own stamp, hung off a continuous rail of years. It's the
        payoff for logging things properly - scroll back through it and you're scrolling back through
        your travels in order. Tap any stamp to read the note you left, and if a trip happened to earn
        you a badge, the badge shows up right there on the stamp.
      </p>

      <img src={country} alt="Around the World's country panel - a bottom sheet with the bucket-list toggle, a dated visit, and buttons to add a visit or view travel tips"/>
      <img src={passport} alt="Around the World's passport - a vertical timeline of dated stamps, one per visit"/>

      <h2>Badges, Challenges and a Dart</h2>
      <p>
        This is the layer that turns a map into a game. There's a set of milestone <strong>badges</strong>{' '}
        - your first stamp, ten countries, twenty-five, a whole continent completed, all seven continents
        - and a handful of curated <strong>challenges</strong> with live progress bars: visit the five
        Nordics, conquer every country in South America, join the century club at a hundred. Everything
        fills itself in automatically as you log trips; there's nothing to tick off by hand.
      </p>
      <p>
        And when you can't decide where to go next, there's a <strong>🎯 Throw a dart</strong> button
        that picks a country at random from the ones you haven't visited - nudging you to either add it
        to the bucket list or throw again. It's a small bit of serendipity for the days when the whole
        world feels like too much choice.
      </p>

      <img src={challenges} alt="Around the World's challenges view - earned milestone badges above a set of curated challenges with progress bars"/>

      <h2>Travel Tips</h2>
      <p>
        The last piece is practical. Every country has a <strong>💡 Travel tips</strong> button that
        opens a pop-up of the things I always end up frantically googling before a trip: the currency,
        how to get from the airport into the city, whether you need a SIM, the current gov.uk advice, the
        common scams, whether the tap water's safe. It's written from a UK traveller's point of view,
        curated by hand for a seed set of popular destinations, and anywhere without tips yet just says
        so gracefully rather than pretending.
      </p>

      <h2>The Tech Stack</h2>
      <p>
        Under the hood it's a single-page app - React 19 with TypeScript, built with Vite, styled with
        Tailwind. The map itself is <code>react-simple-maps</code> drawing over world-atlas TopoJSON.
        There's no router: the whole UI is a three-tab shell (Map, Passport, Challenges) held in a bit of
        component state. And there's no backend at all. The entire application state is one{' '}
        <code>TravelData</code> object driven through a single pure reducer, persisted to one{' '}
        <code>localStorage</code> key, <code>aroundtheworld:data</code>. That's the complete data layer.
      </p>
      <p>
        Keeping it that small didn't mean cutting corners. A few things I was deliberate about:
      </p>
      <ul>
        <li><strong>A pure core.</strong> Every domain mutation lives in one framework-free reducer with no React imports, so the rules about what a country's state can even be are enforced in one place.</li>
        <li><strong>Derived, never stored.</strong> The passport, the badges, the challenge progress, the dart's suggestions - none of it is saved. It's all recomputed from your list of countries on demand, which is why I could add the entire gamification layer without a single change to the saved data shape.</li>
        <li><strong>Versioned storage.</strong> The saved blob carries a schema version and migrates forward step by step. A blob written by a newer build is kept rather than wiped, so an experiment on another device can never brick your map.</li>
        <li><strong>The messy-data war story.</strong> Matching the map's raw shapes to real countries is fiddlier than you'd think - it's an ISO-numeric-code lookup with a hand-written override table for the few territories that don't carry a code. And <code>prop-types</code> has to stay a direct dependency the app never imports, purely because <code>react-simple-maps</code> pre-dates React 19 and breaks without it. Modern framework, older ecosystem library: you meet in the middle.</li>
      </ul>

      <h2>The Future</h2>
      <p>
        Around the World is deliberately local-first for now, and for a personal travel map that's
        genuinely enough. The one feature I keep coming back to is <em>travel partners</em> - tagging who
        you went with - and it's telling that it's also the first thing that would need real accounts and
        a backend, because it's the first thing that involves someone other than you. That's the natural
        productionise step, and because every byte of persistence already goes through one storage module,
        most of the app won't need to know it happened. Until then it does exactly what I wanted: it's
        turned a decade of half-remembered trips into a map I can actually see.
      </p>
    </div>
  );
}

export default AroundTheWorldProject;
