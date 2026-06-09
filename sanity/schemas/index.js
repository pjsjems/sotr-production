// sanity/schemas/index.js
// Register all schemas for Sanity Studio.
// Import this in your sanity.config.js: import { schemaTypes } from './schemas'

import freeText    from './freeText';
import atlasSeries from './atlasSeries';

export const schemaTypes = [freeText, atlasSeries];
