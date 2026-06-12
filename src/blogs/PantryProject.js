import React from 'react';

import planner from '../assets/pantry-planner.png';
import library from '../assets/pantry-library.png';
import shoppingList from '../assets/pantry-shopping-list.png';
import supermarket from '../assets/pantry-supermarket.png';

import './blogs.css';

function PantryProject() {
  return (
    <div className="blog-post">
      <h1>The Pantry</h1>
      <a href="https://github.com/danbaulk/pantry" target="_blank" rel="noopener noreferrer">GitHub Repository</a>

      <h2>Intro</h2>
      <p>
        The Pantry is a small, local-first meal-planning app I built for myself. The pitch is easy to
        state: pick your meals for the week, and the shopping list builds itself. Not a rough list — a
        proper one, combined across every recipe, scaled to how many people you're feeding, summed up
        by unit, and grouped into the aisles in the order you actually walk your supermarket.
      </p>
      <p>
        There are no accounts and no server. Everything lives in your browser. It's deliberately simple,
        and that simplicity is the point: it does one job — turning "what shall we eat this week?" into
        "here's exactly what to buy" — and tries to do it without any fuss.
      </p>

      <img src={planner} alt="The Pantry weekly planner"/>

      <h2>The Problem</h2>
      <p>
        For years my recipes lived in a messy Google Drive folder: some as documents, some as photos of
        cookbook pages, some as links I'd never open again. Every week I'd scroll through them, decide on
        a few meals, and then do the genuinely tedious part by hand — work out everything I needed to buy,
        merge the overlaps (two recipes wanting tinned tomatoes shouldn't mean two separate lines),
        double the quantities because I was cooking for more than the recipe assumed, and then try to
        write that list in roughly the order I'd encounter things in the shop so I wasn't doubling back.
      </p>
      <p>
        It's not hard work, exactly, but it's the same work every single week, and a computer should be
        doing it. The Pantry is my answer: structure the recipes once, and let the list fall out of the
        plan automatically.
      </p>

      <h2>A Structured Recipe Library</h2>
      <p>
        Everything starts with the recipes. Each one carries the usual things — a name, description,
        default number of servings, instructions, tags, a favourite flag — but the important part is the
        ingredients, because they're what the shopping list is built from. The key design decision here
        is that ingredients are <em>catalogue-first</em>: an ingredient doesn't just store the text
        "2 tins of chopped tomatoes", it points at a real grocery item from a shared catalogue, and that
        item lives in an aisle and carries a unit. That single rule is what makes everything downstream
        possible — every ingredient is guaranteed to know its unit and which aisle it belongs to.
      </p>
      <p>
        To keep that from being a chore, you can <strong>quick-add</strong> a new grocery item inline
        while you're writing a recipe, without leaving the form. And because nobody wants to retype
        recipes they already have, there's a <strong>paste / import</strong> flow: paste the raw text of
        a recipe and it opens straight in the editor as a draft, with the ingredients parsed out and
        auto-matched against the catalogue. Anything it can't match confidently is flagged with the name
        it found, so you can pick the right item or quick-add it before saving.
      </p>

      <img src={library} alt="The Pantry recipe library"/>

      <h2>Planning the Week</h2>
      <p>
        The planner is a board of the seven days ahead, starting from today rather than a fixed Monday.
        You assign recipes to days, and because deciding what to eat is half the battle, there's a
        suggestion strip across the top — hit <strong>Shuffle</strong> and it offers three random
        recipes you can drag straight onto a day. The whole board runs on native HTML5 drag-and-drop, so
        you can drag suggestions onto days, move meals between days, or drop them into an unassigned
        bucket, all with no drag-and-drop library involved.
      </p>
      <p>
        Each planned meal can override its servings independently of the recipe's default, which matters
        more than it sounds: cooking a recipe for four when it's written for two should scale that
        recipe's contribution to the shopping list, and nothing else. That per-meal number is the dial
        the list-builder turns.
      </p>

      <h2>The List That Builds Itself</h2>
      <p>
        This is the part I'm happiest with. The shopping list is never something you edit directly —
        it's <em>derived</em>, recomputed from scratch every time the plan changes, so it can never drift
        out of sync with what you've planned. Building it is a pipeline: take every meal in the week,
        scale each recipe's ingredients by <code>(servings ?? recipe.servings) / recipe.servings</code>,
        then sum everything up per item <em>and</em> unit. Two recipes both asking for grams of butter
        merge into one line; an item measured in two genuinely different units stays as two lines,
        because the app never pretends to convert between units it can't.
      </p>
      <p>
        Those summed lines are then grouped into aisles and ordered by the walk-order of your active
        supermarket (more on that below), so the list reads top-to-bottom in the order you'll shop. The
        screen is split in two: on the left, the aisle-grouped list of what to buy; on the right, an
        "already have" column where you can knock down quantities for things in your cupboard. Mark that
        you've already got enough of something and it simply drops off the buy list. It's a small bit of
        reconciliation that saves buying a fourth jar of something you already own three of.
      </p>

      <img src={shoppingList} alt="The Pantry shopping list"/>

      <h2>Walking Your Store</h2>
      <p>
        Aisle order is personal — the layout of my local shop is nothing like the big one across town —
        so The Pantry has <strong>supermarket profiles</strong>. There's a single shared catalogue of
        aisles, and each profile is just its own ordering of those aisles. Switch profiles from a set of
        tabs and the whole app re-orders to match: the pickers in the planner, and crucially the shopping
        list. You drag aisle rows by a handle to set the walk-order, click into any aisle to rename it or
        manage the items inside, and add or remove items as your shop changes.
      </p>
      <p>
        The same screen is where allergies live. Mark a grocery item as one to <strong>avoid</strong> and
        any recipe using it gets a red badge. Flagged recipes are hard-excluded from the randomiser and
        suggestion strip — it'll never suggest something you can't eat — but they still show up (badged)
        if you go looking for them manually, so the choice stays yours.
      </p>

      <img src={supermarket} alt="The Pantry supermarket and aisle management"/>

      <h2>The Tech Stack</h2>
      <p>
        Under the hood it's a single-page app — React 19 with TypeScript, built with Vite, styled with
        Tailwind, and routed with React Router. There's no backend at all. The entire application state
        is one <code>PantryData</code> object held in a React context, every change is an immutable
        update, and the whole thing is persisted to a single <code>localStorage</code> key,{' '}
        <code>pantry:data</code>. That's the complete data layer.
      </p>
      <p>
        Keeping it that small didn't mean cutting corners on correctness. A few things I was deliberate
        about:
      </p>
      <ul>
        <li><strong>Referential integrity.</strong> You can't delete an aisle that still has items in it, or a grocery item that recipes still depend on — those operations return a friendly reason rather than leaving dangling references. Where a delete <em>should</em> cascade, it does: removing a recipe also clears its planned meals.</li>
        <li><strong>A fully derived shopping list.</strong> The only thing the user stores about shopping is the "already have" reconciliation; the buy list itself is always recomputed, never persisted, so it can't go stale.</li>
        <li><strong>Versioned migrations.</strong> The stored blob carries a version number, and on load a <code>migrate()</code> step walks an older shape up one version at a time. When I change the data model I bump the version and add a step — that's how the supermarket-profiles feature reshaped existing data without anyone losing their recipes.</li>
        <li><strong>One place that touches storage.</strong> All persistence is funnelled through a single module, so the eventual swap to a real backend is a localised change rather than a rewrite.</li>
      </ul>

      <h2>The Future</h2>
      <p>
        The Pantry is deliberately local-first for now, but it's shaped with one obvious next step in
        mind: you plan your week on a laptop, but you shop with your phone, and right now the data doesn't
        cross that gap. Adding real sync — and with it accounts and hosting — is the natural productionise
        step, and because every byte of persistence already goes through one storage module, most of the
        app won't need to know it happened. Until then it does exactly what I wanted: it's replaced the
        messy Drive folder, and I haven't hand-written a shopping list since.
      </p>
    </div>
  );
}

export default PantryProject;
