/**
 * --------------------------------------------------------------------------
 * google_ads_url_guard_multi_ENG_FRA - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  TEST_MODE: true,
  EMAIL_ALERTS: "contact@yourdomain.com",
  PAUSE_ADS_ON_ERROR: true,
  ERROR_LABEL: "Broken_URL_404"
};
function main() {
  if (!CONFIG.TEST_MODE) createLabelIfNeeded();
  var adsIter = AdsApp.ads().withCondition("Status = ENABLED").withCondition("CampaignStatus = ENABLED").withCondition("AdGroupStatus = ENABLED").get();
  
  var brokenCount = 0;
  var errors = [];
  
  while (adsIter.hasNext()) {
      var ad = adsIter.next();
      var urls = ad.urls().getFinalUrls();
      if (urls && urls.length > 0) {
          var url = urls[0];
          try {
              var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
              var code = response.getResponseCode();
              if (code >= 400) {
                  brokenCount++;
                  var msg = "Broken Ad (Code " + code + "): " + url;
                  Logger.log(msg);
                  errors.push(msg);
                  if (!CONFIG.TEST_MODE) {
                      ad.applyLabel(CONFIG.ERROR_LABEL);
                      if (CONFIG.PAUSE_ADS_ON_ERROR) ad.pause();
                  }
              }
          } catch(e) {
              Logger.log("Could not test URL: " + url);
          }
      }
  }
  
  if (errors.length > 0 && !CONFIG.TEST_MODE && CONFIG.EMAIL_ALERTS !== "contact@yourdomain.com") {
      MailApp.sendEmail(CONFIG.EMAIL_ALERTS, "Google Ads URL Guard: 404 Found", errors.join("\n"));
  }
  Logger.log("URL Guard finished. Found " + brokenCount + " broken URLs.");
}
function createLabelIfNeeded() { if (!AdsApp.labels().withCondition("Name = '" + CONFIG.ERROR_LABEL + "'").get().hasNext()) { AdsApp.createLabel(CONFIG.ERROR_LABEL); } }