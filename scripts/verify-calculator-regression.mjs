import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  calculateLowSlow,
  buildTimeline,
} from '../src/domain/calculator/engine.js'
import { CALCULATOR_REFERENCE_SCENARIOS } from '../src/domain/calculator/referenceScenarios.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const snapshotPath = path.resolve(__dirname, '../src/domain/calculator/referenceSnapshots.json')

function simplifyResult(result, timeline) {
  const payload = {
    meatKey: result.meatKey,
    cookMin: result.cookMin,
    totalMin: result.totalMin,
    restMin: result.restMin,
    targetTempC: result.targetTempC,
    wrapType: result.wrapType,
    wrapTempC: result.wrapTempC,
    cues: result.cues,
    timeline: timeline.map((step) => ({
      id: step.id,
      label: step.label,
      isRest: Boolean(step.isRest),
      isService: Boolean(step.isService),
      isStall: Boolean(step.isStall),
    })),
  }
  if (result.serviceWindowStart) payload.serviceWindowStart = result.serviceWindowStart
  if (result.serviceWindowEnd) payload.serviceWindowEnd = result.serviceWindowEnd
  payload.timeline = timeline.map((step) => {
    const compactStep = {
      id: step.id,
      label: step.label,
      isRest: Boolean(step.isRest),
      isService: Boolean(step.isService),
      isStall: Boolean(step.isStall),
    }
    if (step.time) compactStep.time = step.time
    return compactStep
  })
  return payload
}

function generateSnapshot() {
  return Object.fromEntries(
    CALCULATOR_REFERENCE_SCENARIOS.map((scenario) => {
      const result = calculateLowSlow(
        scenario.meatKey,
        scenario.weightKg,
        scenario.options,
      )
      const timeline = buildTimeline(result, scenario.options.smokerTempC || 120)
      return [scenario.id, simplifyResult(result, timeline)]
    }),
  )
}

const next = generateSnapshot()

if (process.argv.includes('--write')) {
  fs.writeFileSync(snapshotPath, `${JSON.stringify(next, null, 2)}\n`)
  console.log(`Snapshots written to ${snapshotPath}`)
  process.exit(0)
}

if (!fs.existsSync(snapshotPath)) {
  console.error(`Missing snapshot file: ${snapshotPath}`)
  console.error('Run: node scripts/verify-calculator-regression.mjs --write')
  process.exit(1)
}

const expected = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
assert.deepStrictEqual(next, expected)
console.log(`Calculator regression OK (${Object.keys(expected).length} scenarios)`)
