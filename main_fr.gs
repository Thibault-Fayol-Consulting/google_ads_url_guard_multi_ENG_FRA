/**
 * --------------------------------------------------------------------------
 * Google Ads URL Guard — Script Google Ads pour PME
 * --------------------------------------------------------------------------
 * Verifie toutes les URLs finales des annonces actives pour detecter
 * les erreurs HTTP (4xx/5xx). Met en pause les annonces cassees,
 * leur applique un label et envoie une alerte email.
 *
 * Auteur :  Thibault Fayol — Consultant SEA PME
 * Site :    https://thibaultfayol.com
 * Licence : MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  // -- General --
  TEST_MODE: true,                          // Passer a false pour appliquer
  EMAIL: 'contact@votredomaine.com',        // Destinataire des alertes

  // -- Comportement --
  PAUSE_ADS_ON_ERROR: true,                 // Mettre en pause les annonces cassees
  ERROR_LABEL: 'Broken_URL',                // Label applique aux annonces cassees
  MAX_URLS_PER_RUN: 200,                    // Limite pour eviter le quota UrlFetchApp
  TIMEOUT_MS: 10000                         // Timeout fetch en ms
};

function main() {
  try {
    var today = Utilities.formatDate(new Date(), AdsApp.currentAccount().getTimeZone(), 'yyyy-MM-dd');
    Logger.log('URL Guard — execution du ' + today);

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
          var msg = 'HTTP ' + code + ' — ' + url + ' (Annonce ' + ad.getId() + ', Campagne : ' + ad.getCampaign().getName() + ')';
          Logger.log('CASSEE : ' + msg);
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
        var errMsg = 'ERREUR FETCH — ' + url + ' (' + e.message + ')';
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

    Logger.log('Verifiees : ' + checkedCount + ' | Cassees : ' + brokenCount);

    if (errors.length > 0 && !CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@votredomaine.com') {
      var subject = 'URL Guard — ' + brokenCount + ' URL(s) cassee(s) detectee(s)';
      var body = 'Date : ' + today + '\n'
        + 'Compte : ' + AdsApp.currentAccount().getName() + '\n'
        + 'URLs verifiees : ' + checkedCount + '\n'
        + 'Cassees : ' + brokenCount + '\n\n'
        + errors.join('\n');
      MailApp.sendEmail(CONFIG.EMAIL, subject, body);
    }

  } catch (e) {
    Logger.log('ERREUR FATALE : ' + e.message);
    if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@votredomaine.com') {
      MailApp.sendEmail(CONFIG.EMAIL, 'URL Guard — Erreur Script', e.message);
    }
  }
}

function createLabelIfNeeded_(name) {
  if (!AdsApp.labels().withCondition("Name = '" + name + "'").get().hasNext()) {
    AdsApp.createLabel(name);
  }
}
