import * as migration_20261101_133842_initial from './20261101_133842_initial'
import * as migration_20261101_144327_media_storage_fields from './20261101_144327_media_storage_fields'

export const migrations = [
  {
    up: migration_20261101_133842_initial.up,
    down: migration_20261101_133842_initial.down,
    name: '20261101_133842_initial',
  },
  {
    up: migration_20261101_144327_media_storage_fields.up,
    down: migration_20261101_144327_media_storage_fields.down,
    name: '20261101_144327_media_storage_fields',
  },
]
