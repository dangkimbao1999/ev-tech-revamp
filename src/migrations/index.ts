import * as migration_20261101_133842_initial from './20261101_133842_initial';

export const migrations = [
  {
    up: migration_20261101_133842_initial.up,
    down: migration_20261101_133842_initial.down,
    name: '20261101_133842_initial'
  },
];
