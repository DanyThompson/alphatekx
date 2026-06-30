export async function loadPlugins() {
  return [];
}

export async function executePluginHooks(event, context = {}, logger = console) {
  logger?.debug?.(`[pluginManager] Hook ${event} skipped because no plugins are registered.`, context);
  return [];
}
