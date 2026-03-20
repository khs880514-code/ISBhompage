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

  const collectStrings = (value, bucket = []) => {
    if (typeof value === "string") {
      bucket.push(value);
      return bucket;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => collectStrings(item, bucket));
      return bucket;
    }

    if (value && typeof value === "object") {
      Object.keys(value).forEach((key) => collectStrings(value[key], bucket));
    }

    return bucket;
  };

  const hasLikelyEncodingCorruption = (value) => {
    const text = collectStrings(value).join(" ");
    if (!text) {
      return false;
    }

    const questionMarks = (text.match(/\?/g) || []).length;
    const replacementChars = (text.match(/\uFFFD/g) || []).length;
    const suspiciousRuns = (text.match(/\?{3,}/g) || []).length;
    const signal = questionMarks + replacementChars;

    return suspiciousRuns > 0 || signal >= 12;
  };

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
      if (hasLikelyEncodingCorruption(parsed)) {
        storage.removeItem(STORAGE_KEY);
        return defaults;
      }

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
    hasLikelyEncodingCorruption,
    loadSiteData,
    saveSiteData,
    resetSiteData,
    hasLocalStorage: () => Boolean(safeStorage()),
  };
})();
