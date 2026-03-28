// PATCH: stable home for calculator catalog mapping.
// We keep the current proven mapper, but move the public import surface into
// the new domain structure so the rest of the app can migrate cleanly.

export {
  buildRuntimeProfilesFromCatalog,
  setRuntimeCalculatorProfiles,
  clearRuntimeCalculatorProfiles,
} from './engine.js'
