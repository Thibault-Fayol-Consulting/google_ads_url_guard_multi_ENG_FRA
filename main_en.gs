/**
 * --------------------------------------------------------------------------
 * Google Ads URL Guard — Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Checks all enabled ad final URLs for HTTP errors (4xx/5xx).
 * Pauses broken ads, labels them, and sends an email alert.
 *
 * Author:  Thibault Fayol — Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  // -- General --
  TEST_MODE: true,                          // Set to false to apply changes
  EMAIL: 'contact@yourdomain.com',          // Alert recipient

  // -- Behavior --
  PAUSE_ADS_ON_ERROR: true,                 // Pause ads with broken URLs
  ERROR_LABEL: 'Broken_URL',                // Label applied to broken ads
  MAX_URLS_PER_RUN: 200,                    // Limit to avoid UrlFetchApp quota issues
  TIMEOUT_MS: 10000                         // URL fetch timeout in ms
};

function main() {
  try {
    var today = Utilities.formatDate(new Date(), AdsApp.currentAccount().getTimeZone(), 'yyyy-MM-dd');
    Logger.log('URL Guard — run started ' + today);

    createLabelIfNeeded_(CONFIG.ERROR_LABEL);

    var adsIter = AdsApp.ads()
      .withCondition('Status = ENABLED')
      .withCondition('CampaignStatus = ENABLED')
      .withCondition('AdGroupStatus = ENABLED')
      .withLimit(CONFIG.MAX_URLS_PER_RUN)
      .get();

    var brokenCount = 0;
    var checkedCount = 0;
    var errors = [];

    while (adsIter.hasNext()) {
      var ad = adsIter.next();
      var url = ad.urls().getFinalUrl();
      if (!url) continue;

      checkedCount++;
      try {
        var response = UrlFetchApp.fetch(url, {
          muteHttpExceptions: true,
          followRedirects: true,
          validateHttpsCertificates: false
        });
        var code = response.getResponseCode();

        if (code >= 400) {
          brokenCount++;
          var msg = 'HTTP ' + code + ' — ' + url + ' (Ad ' + ad.getId() + ', Campaign: ' + ad.getCampaign().getName() + ')';
          Logger.log('BROKEN: ' + msg);
          errors.push(msg);

          if (!CONFIG.TEST_MODE) {
            ad.applyLabel(CONFIG.ERROR_LABEL);
            if (CONFIG.PAUSE_ADS_ON_ERROR) {
              ad.pause();
            }
          }
        }
      } catch (e) {
        brokenCount++;
        var errMsg = 'FETCH ERROR — ' + url + ' (' + e.message + ')';
        Logger.log(errMsg);
        errors.push(errMsg);

        if (!CONFIG.TEST_MODE) {
          ad.applyLabel(CONFIG.ERROR_LABEL);
          if (CONFIG.PAUSE_ADS_ON_ERROR) {
            ad.pause();
          }
        }
      }
    }

    Logger.log('Checked: ' + checkedCount + ' | Broken: ' + brokenCount);

    if (errors.length > 0 && !CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@yourdomain.com') {
      var subject = 'URL Guard Alert — ' + brokenCount + ' broken URL(s) found';
      var body = 'Date: ' + today + '\n'
        + 'Account: ' + AdsApp.currentAccount().getName() + '\n'
        + 'URLs checked: ' + checkedCount + '\n'
        + 'Broken: ' + brokenCount + '\n\n'
        + errors.join('\n');
      MailApp.sendEmail(CONFIG.EMAIL, subject, body);
    }

  } catch (e) {
    Logger.log('FATAL ERROR: ' + e.message);
    if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@yourdomain.com') {
      MailApp.sendEmail(CONFIG.EMAIL, 'URL Guard — Script Error', e.message);
    }
  }
}

function createLabelIfNeeded_(name) {
  if (!AdsApp.labels().withCondition("Name = '" + name + "'").get().hasNext()) {
    AdsApp.createLabel(name);
  }
}
