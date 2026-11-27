// The single list of projects. The home-page galaxy (one star per project) and its
// no-WebGL fallback grid both render from this, so a new post only needs an entry here.
import fplLogo from './assets/fpl-logo.png';
import pantryThumb from './assets/pantry-planner.png';
import gymbuddyThumb from './assets/gymbuddy-today.png';
import aroundtheworldThumb from './assets/aroundtheworld-map.png';
import pocketmechanicThumb from './assets/pocketmechanic-car.png';

const projects = [
  {
    id: 'fpl',
    title: 'FPL Assistant Manager',
    route: '/fpl-project',
    blurb: 'Machine learning models I trained to predict the highest scoring Fantasy Premier League team for the next gameweek.',
    thumb: fplLogo,
    color: '#c4b5fd',
  },
  {
    id: 'pantry',
    title: 'The Pantry',
    route: '/pantry',
    blurb: 'A local-first meal planner that turns your weekly meals into a shopping list that builds itself - combined, scaled and grouped by supermarket aisle.',
    thumb: pantryThumb,
    color: '#fcd34d',
  },
  {
    id: 'gymbuddy',
    title: 'GymBuddy',
    route: '/gymbuddy',
    blurb: 'A local-first gym tracker that round-robins through your routines, remembers every lift, and flags the exercises that have stopped going up.',
    thumb: gymbuddyThumb,
    color: '#7dd3fc',
  },
  {
    id: 'around-the-world',
    title: 'Around the World',
    route: '/around-the-world',
    blurb: "A local-first travel scratch-map: tap the countries you've been to, log dated visits, and watch a passport, badges and challenges build themselves.",
    thumb: aroundtheworldThumb,
    color: '#6ee7b7',
  },
  {
    id: 'pocketmechanic',
    title: 'PocketMechanic',
    route: '/pocketmechanic',
    blurb: 'A local-first car-care app that gives every part of your car a green, amber or red signal - and reads the garage receipt offline to fill it in for you.',
    thumb: pocketmechanicThumb,
    color: '#fca5a5',
  },
];

export default projects;
