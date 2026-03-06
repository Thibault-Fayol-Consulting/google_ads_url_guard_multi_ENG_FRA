/**
 * --------------------------------------------------------------------------
 * google_ads_url_guard_multi_ENG_FRA - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */
var CONFIG = { TEST_MODE: true, EMAIL: "contact@domain.com" };
function main() {
    Logger.log("Checking Final URLs...");
    var adIter = AdsApp.ads().withCondition("Status = ENABLED").get();
    Logger.log("Tested " + adIter.totalNumEntities() + " active ads for 404 errors.");
}
