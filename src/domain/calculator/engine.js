// PATCH: new clean calculator domain entrypoint.
// This file is the strangler-layer around the current sacred engine.
// The implementation still delegates to the proven core while the rest of the
// app is rebuilt around it progressively.

export {
  PITMASTER_PROFILES,
  COOKING_METHODS,
  BASE_COEFFS,
  PHASE_BASES,
  DONENESS_LEVELS,
  STEAK_PROFILES,
  setRuntimeCalculatorProfiles,
  clearRuntimeCalculatorProfiles,
  buildRuntimeProfilesFromCatalog,
  getCookingProfile,
  getMethodConfig,
  estimateThickness,
  calculateLowSlow,
  buildTimeline,
  recalibrate,
  hhmmToMinutes,
  minutesToClock,
  roundMinutesForDisplay,
  calculateSteak,
  formatDuration,
  addMinutes,
  roundToNearestHalfHour,
  formatDisplayTimeRounded,
  formatTime,
  carryover,
  validateInput,
  generateSuggestion,
} from '../../lib/calculator.js'
