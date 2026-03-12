(function () {
  const STORAGE_KEY = "isb-site-data";

  const clone = (value) => {
    if (value === undefined) {
      return undefined;
    }

    return JSON.parse(JSON.stringify(value));
  };

  const mergeData = (base, override) => {
    if (Array.isArray(base) || Array.isArray(override)) {
      return clone(override ?? base);
    }

    if (
      base &&
      override &&
      typeof base === "object" &&
      typeof override === "object"
    ) {
      const merged = { ...base };

      Object.keys(override).forEach((key) => {
        merged[key] = key in base ? mergeData(base[key], override[key]) : clone(override[key]);
      });

      return merged;
    }

    return clone(override ?? base);
  };

  const getDefaultData = () => clone(window.defaultSiteData || {});

  const safeStorage = () => {
    try {
      const testKey = "__isb_test__";
      window.localStorage.setItem(testKey, "ok");
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (error) {
      return null;
    }
  };

  const loadSiteData = () => {
    const defaults = getDefaultData();
    const storage = safeStorage();

    if (!storage) {
      return defaults;
    }

    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) {
        return defaults;
      }

      const parsed = JSON.parse(raw);
      return mergeData(defaults, parsed);
    } catch (error) {
      return defaults;
    }
  };

  const saveSiteData = (data) => {
    const storage = safeStorage();

    if (!storage) {
      return false;
    }

    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  };

  const resetSiteData = () => {
    const storage = safeStorage();

    if (!storage) {
      return false;
    }

    storage.removeItem(STORAGE_KEY);
    return true;
  };

  window.siteStorage = {
    STORAGE_KEY,
    clone,
    mergeData,
    getDefaultData,
    loadSiteData,
    saveSiteData,
    resetSiteData,
    hasLocalStorage: () => Boolean(safeStorage()),
  };
})();
