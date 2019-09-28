import ServiceModel from '../models/Service';

// Convert service to service model
// Non-async copy of src/api/server/ServerApi.js::_prepareServiceModel
export function prepareServiceModel(service, server) {
  let recipe;
  try {
    recipe = server.recipes.find(r => r.id === service.recipe.id);

    if (!recipe) {
      console.warn(`Recipe ${service.recipe.id} not loaded`);
      return null;
    }

    return new ServiceModel(service, recipe);
  } catch (e) {
    console.warn('Could not prepare service model', e);
    return null;
  }
}

// Rehidrate local copy of service
export async function rehitrdateServices(services, api) {
  const server = api.recipes.server;
  const recipes = services.map(s => s.recipe.id);

  // Let server instance load installed recipes first
  await server.getInstalledRecipes();

  // Check if all recipes exist in background
  // This shouldn't need to download any new recipes as we are only rehidrating existing
  // config, but check recipes in case they got deleted
  server._bulkRecipeCheck(recipes);

  // Return services as array of ServiceModels
  return services.map(service => prepareServiceModel(service, server));
}
