/**
 * --------------------------------------------------------------------------
 * google_ads_url_guard_multi_ENG_FRA - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */
var CONFIG = { TEST_MODE: true, EMAIL: "contact@votredomaine.com" };
function main() {
    Logger.log("Vérification des URL finales...");
    var adIter = AdsApp.ads().withCondition("Status = ENABLED").get();
    Logger.log("Test de " + adIter.totalNumEntities() + " annonces actives pour les erreurs 404.");
}
