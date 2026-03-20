(() => {
  const host = (window.location.hostname || "").toLowerCase();
  const isCafe24Runtime =
    window.location.protocol !== "file:" &&
    (host === "e-isb.com" || host === "www.e-isb.com" || host.endsWith(".e-isb.com"));

  window.siteRuntimeConfig = {
    siteDataEndpoint: isCafe24Runtime ? "/api/site-data.php" : "/api/site-data",
    adminPublishEndpoint: isCafe24Runtime ? "/api/admin/site-data.php" : "/api/admin/site-data",
    adminAssetUploadEndpoint: isCafe24Runtime ? "/api/admin/assets.php" : "/api/admin/assets",
    adminAssetUploadMode: isCafe24Runtime ? "direct" : "deferred",
    adminPlatform: isCafe24Runtime ? "cafe24" : "netlify",
    contactEndpoint: isCafe24Runtime ? "" : "/api/contact",
    runtimeConfigEndpoint: isCafe24Runtime ? "" : "/api/runtime-config",
    turnstileSiteKey: "",
  };
})();
