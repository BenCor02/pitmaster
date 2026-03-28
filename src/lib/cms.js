// PATCH: compatibility facade while the app migrates to the new module-based architecture.
export {
  fetchSiteSettingsRow,
  upsertSiteSettingsRow,
  fetchPageWithSections,
  fetchAdminPages,
  fetchAdminSections,
  upsertPage,
  upsertPageSection,
  deletePageSection,
  fetchMediaLibrary,
  uploadMediaAsset,
  deleteMediaAsset,
  fetchCalculatorCatalog,
  upsertCalculatorMeat,
  upsertCookingMethod,
  upsertCalculatorParameters,
} from '../modules/cms/repository'
