/* ----------------------------------------------------------------------- MAIN PAGE ----------------------------------------------------------------------- */

let vLive = 47, vBeta = 48, vMias = 19, vWind = 35, vAdv = 42;
let menuBarIsOpen = versionSelectorIsOpen = calcIsOpen = chartIsOpen = false;
let elementData = ["ice", "fire", "electric", "ether", "physical", "wind"];
let currNumberFormat, leaksToggle = document.getElementById("lks"), spoilersToggle = document.getElementById("spl");
let calcDropdown = document.getElementById("cc-dd"), bossDropdown = document.getElementById("cc-b-dd");
let versionDropdown1 = document.getElementById("cc-v-dd1"), bossScore1 = document.getElementById("cc-score1"), bossHP1 = document.getElementById("cc-hp1");
let versionDropdown2 = document.getElementById("cc-v-dd2"), bossScore2 = document.getElementById("cc-score2"), bossHP2 = document.getElementById("cc-hp2");
let chartDropdown = document.getElementById("ch-dd");

let versionData, enemyData, buffData, versionIDs = [];
let hpData = [], hpDataSpecific = Object.create(null), hpChart;
let versionBuffIDs, versionHPMult, versionDazeMult, versionAnomMult, versionEnemies;
let versionNum, currBossID, bossData1, bossData2, bossHPMax1, bossHPMax2, chartScoreNum, chartType;

// display main page
async function loadPage() {
  versionData = await (await fetch("da-versions.json")).json();
  enemyData = await (await fetch("../../assets/zzz/enemies.json")).json();
  buffData = await (await fetch("../../assets/zzz/buffs.json")).json();
  versionIDs = Object.keys(versionData);
  loadHPData();
  loadSaveState();
  showVersion();
  changeNumberFormat();
}
window.addEventListener("DOMContentLoaded", () => { loadPage(); });

/* ----------------------------------------------------------------------- HP DATASET ----------------------------------------------------------------------- */

// build hp dataset
function loadHPData() {
  hpData = Array.from({length: 8}, () => Array.from({length: versionIDs.length}).fill(null));
  for (let v = 1; v <= versionIDs.length; ++v) {
    let versionEnemies = versionData[versionIDs[v - 1]].versionEnemies;
    let hpRawTrial = hpAltTrial = hpRawAdversity = hpAltAdversity = 0;

    // build trial/adversity hp dataset
    for (let s = 1; s <= versionEnemies.length; ++s) {
      let currEnemy = versionEnemies[s - 1];
      let eID = currEnemy.id;
      let eType = currEnemy.type;
      let eHPMult = currEnemy.hpMult ? currEnemy.hpMult : versionData[versionIDs[v - 1]].versionHPMult[s - 1];
      let eData = enemyData[eID];
      let eMods = eData.mods;

      // define boss hp
      let eHP = eData.baseHP[eType] * 24795 * eHPMult * (s != 4 ? 8.74 : 15.8) / 10000;
      if (s != 4) hpRawTrial += eHP;
      else hpRawAdversity += eHP;
      let hpAlt = eHP * (eID[2] >= "2" && eData.baseDEF[eType] < 60 ? (794 + eData.baseDEF[eType] * 1588 / 100) / (794 + 60 * 1588 / 100) : 1);
      if (eMods.length >= 1) {
        // define alt hp mods
        let modImpair = eMods.find(mod => /^impr.+$/.test(mod));
        let modPurify = eMods.find(mod => /^prfy.+$/.test(mod));
        let modShutdown = eMods.find(mod => /^shut.+$/.test(mod));
        let modConvert = eMods.find(mod => /^conv.+$/.test(mod));

        if (modImpair) hpAlt -= eHP * modImpair.slice(7, 12) / 10000;
        if (modPurify) hpAlt -= eHP * (v >= vMias ? modPurify.slice(7, 12) : 300) / 10000;
        if (modShutdown) hpAlt -= eHP * modShutdown.slice(7, 12) / 10000;
        if (modConvert) hpAlt -= eHP * (modConvert.slice(7, 12) - modConvert.slice(13, 18)) / 10000;
      }
      if (s != 4) hpAltTrial += hpAlt;
      else hpAltAdversity += hpAlt;

      // build specific boss hp dataset
      if (!hpDataSpecific[eID]) hpDataSpecific[eID] = [];
      hpDataSpecific[eID].push([versionIDs[v - 1], Math.round(eHP)]);
    }
    hpData[0][v - 1] = Math.round(hpRawTrial * 0.281083138);
    hpData[1][v - 1] = Math.round(hpRawTrial);
    hpData[2][v - 1] = Math.round(hpAltTrial * 0.281083138);
    hpData[3][v - 1] = Math.round(hpAltTrial);
    hpData[4][v - 1] = Math.round(hpRawAdversity * 0.475587703);
    hpData[5][v - 1] = Math.floor(hpRawAdversity);
    hpData[6][v - 1] = Math.round(hpAltAdversity * 0.475587703);
    hpData[7][v - 1] = Math.round(hpAltAdversity);
  }
}

/* ------------------------------------------------------------------------ VERSION ------------------------------------------------------------------------ */

// display version
function showVersion() {
  let currVersion = versionData[versionIDs[versionNum - 1]];
  versionBuffIDs = currVersion.versionBuffIDs;
  versionHPMult = currVersion.versionHPMult;
  versionDazeMult = currVersion.versionDazeMult;
  versionAnomMult = currVersion.versionAnomMult;
  versionEnemies = currVersion.versionEnemies;
  document.getElementById("v-name").innerHTML = currVersion.versionName + (versionNum == vLive ? `<span style="color:#ff5555;font-weight:bold;"> (LIVE)</span>` : versionNum >= vBeta ? `<span style="color:#6d9fff;font-weight:bold;"> (BETA)</span>` : ``);
  document.getElementById("v-time").innerHTML = currVersion.versionTime;
  document.getElementById("v-id").innerHTML = `ID: 69${versionNum.toString().padStart(3, `0`)}${versionNum >= vBeta ? `1` : ``}`;
  showBuffs();
  showEnemies();
}

// change version
function changeVersion(n) {
  let vMax = leaksToggle.checked ? versionIDs.length : vLive;
  versionNum = (versionNum - 1 + n + vMax) % vMax + 1;
  showVersion();
}

/* ------------------------------------------------------------------------- BUFFS ------------------------------------------------------------------------- */

// display buffs
function showBuffs() {
  for (let b = 1; b <= versionBuffIDs.length; ++b) {
    let buff = document.getElementById(`b${b}`);
    let buffImg = document.createElement("img");
    let buffName = document.createElement("div");
    let buffDesc = document.createElement("div");
    buffImg.className = "b-img";
    buffName.className = "b-name";
    buffDesc.className = "bt-text";
    buff.innerHTML = ``;
    buffImg.src = `../../assets/zzz/buffs/${buffData[versionBuffIDs[b - 1]][1]}.webp`;
    buffName.innerHTML = buffData[versionBuffIDs[b - 1]][0];
    buffDesc.innerHTML = buffData[versionBuffIDs[b - 1]][2];
    buff.appendChild(buffImg);
    buff.appendChild(buffName);
    buff.appendChild(buffDesc);
  }
}

/* ------------------------------------------------------------------------ ENEMIES ------------------------------------------------------------------------ */

// display enemies
function showEnemies() {
  document.getElementById("s-h").style.display = versionNum >= vAdv ? "flex" : "none";

  for (let s = 1; s <= versionEnemies.length; ++s) {
    let side = document.getElementById(`s${s <= 3 ? s : `h`}`);
    side.innerHTML = ``;

    // display side header
    let sideHeader = document.createElement("div");
    sideHeader.className = "s-header";
    sideHeader.innerHTML = `${s <= 3 ? `${versionNum >= vAdv ? `Trial` : `Side`} ${s}` : `Adversity`} Lv70`;

    // display side multipliers
    let sideHPMult = versionHPMult[s - 1], sideDazeMult = versionDazeMult[s - 1], sideAnomMult = versionAnomMult[s - 1];
    let sideMult = document.createElement("div");
    sideMult.className = "s-mult";
    sideMult.innerHTML = `HP: <span style="color:#ff5555;">${sideHPMult}%</span> | Daze: <span style="color:#ffe599;">${sideDazeMult}%</span> | Anom: <span style="color:#7b78ff;">${sideAnomMult}%</span>`;
    sideHeader.appendChild(sideMult);
    side.appendChild(sideHeader);

    // display waves
    let waveEnemies = document.createElement("div");
    waveEnemies.className = "w-e";

    // define enemy info
    let currEnemy = versionEnemies[s - 1];
    let eID = currEnemy.id;
    let eType = currEnemy.type;
    let eHPMult = currEnemy.hpMult || sideHPMult;
    let eData = enemyData[eID];
    let eMods = eData.mods;
    let eTags = eData.tags;

    let showSpoilers = spoilersToggle.checked || !eTags.includes("spoiler");
    let eName = showSpoilers ? eData.name : "SPOILER BOSS";
    let eImg = showSpoilers ? `../../assets/zzz/enemies/${eData.image}.webp` : `../../assets/zzz/enemies/doppelganger-i.webp`;
    let eHP = Math.floor(eData.baseHP[eType] * 24795 * sideHPMult * (s != 4 ? 8.74 : 15.8) / 10000);
    let eDEF = Math.ceil(eData.baseDEF[eType] * 1588 / 100);
    let eDaze = eData.baseDaze[eType] * 2.35;
    let eStunMult = eData.stunMult;
    let eStunTime = eData.stunTime;
    let eAnom = eData.baseAnom;
    let eElementMult = eData.elementMult;

    // display enemy
    let enemy = document.createElement("div");
    enemy.className = "e";

    let enemyHover = document.createElement("div");
    let enemyName = document.createElement("div");
    let enemyImg = document.createElement("img");
    enemyHover.className = "e-hover";
    enemyName.className = "e-name";
    enemyImg.className = "e-img";
    enemyName.innerHTML = eName;
    enemyImg.src = eImg;
    enemyHover.appendChild(enemyName);
    enemyHover.appendChild(enemyImg);
    enemy.appendChild(enemyHover);

    // display enemy weaknesses/resistances
    let enemyWR = document.createElement("div");
    enemyWR.className = "wr";
    generateWR(eElementMult, enemyWR);
    enemy.appendChild(enemyWR);

    // display enemy hp
    let hp = document.createElement("div");
    hp.className = "hp";

    let enemyHP = document.createElement("div");
    enemyHP.className = "e-hp";
    enemyHP.innerHTML = showNumberFormat(eHP);
    hp.appendChild(enemyHP);

    // display enemy specific hp multiplier
    if (sideHPMult != eHPMult) {
      let specificHPMult = document.createElement("div");
      specificHPMult.className = "e-hp-mult";
      specificHPMult.innerHTML = `[${eHPMult}%]`;
      hp.appendChild(specificHPMult);
    }

    // display enemy alt hp
    let eDEFLow = eID[2] >= "2" && eData.baseDEF[eType] < 60;
    if (eDEFLow || eMods.length >= 1) {
      let ttHP = document.createElement("div");
      ttHP.className = "tt-e-hp";

      let eHPAlt = eHP * (eDEFLow ? (794 + eData.baseDEF[eType] * 1588 / 100) / (794 + 60 * 1588 / 100) : 1);
      let ttHPColor = "#ffffff";
      ttHP.innerHTML += eDEFLow ? `<span style="font-weight:bold;">NORMALIZED to 953 DEF</span> → <span style="color:#f6b969;font-weight:bold;">×${Math.round(eHPAlt / eHP * 100000) / 1000}%</span><br>`: ``;

      // define alt hp mods
      let modImpair = eMods.find(mod => /^impr.+$/.test(mod));
      let modPurify = eMods.find(mod => /^prfy.+$/.test(mod));
      let modShutdown = eMods.find(mod => /^shut.+$/.test(mod));
      let modConvert = eMods.find(mod => /^conv.+$/.test(mod));

      if (modImpair) {
        eHPAlt -= eHP * modImpair.slice(7, 12) / 10000;
        ttHPColor = "#daad00";
        ttHP.innerHTML += `${generateInstant(ttHPColor, modImpair.slice(5, 6), "IMPAIRED!!", modImpair.slice(7, 12) / 100, "", 0)}<br>`;
      }
      if (modPurify) {
        eHPAlt -= eHP * (versionNum >= vMias ? modPurify.slice(7, 12) : 300) / 10000;
        ttHPColor = "#da00ad";
        ttHP.innerHTML += `${generateInstant(ttHPColor, modPurify.slice(5, 6), "PURIFIED!!", versionNum >= vMias ? modPurify.slice(7, 12) / 100 : 3, "", 0)}<br>`;
      }
      if (modShutdown) {
        eHPAlt -= eHP * modShutdown.slice(7, 12) / 10000;
        ttHPColor = "#b778ff";
        ttHP.innerHTML += `${generateInstant(ttHPColor, modShutdown.slice(5, 6), "SHUTDOWN!!", modShutdown.slice(7, 12) / 100, "", 0)}<br>`;
      }
      if (modConvert) {
        eHPAlt -= eHP * (modConvert.slice(7, 12) - modConvert.slice(13, 18)) / 10000;
        ttHPColor = "#0088ff";
        ttHP.innerHTML += `${generateInstant(ttHPColor, modConvert.slice(5, 6), "CONVERT!!", modConvert.slice(7, 12) / 100, "Corruptive Barrier(s)", modConvert.slice(13, 18) / 100)}<br>`;
      }

      // display enemy alt hp tooltip
      ttHP.innerHTML = generateAlt(ttHPColor, eName, eHPAlt, eHP) + ttHP.innerHTML;
      hp.appendChild(ttHP);
    }
    enemy.appendChild(hp);

    // display enemy def
    let enemyDEF = document.createElement("div");
    enemyDEF.className = "e-def";
    enemyDEF.innerHTML = eDEF;
    enemy.appendChild(enemyDEF);

    // display enemy stats
    let ttStat = document.createElement("div");
    ttStat.className = "tt-e-stat";
    ttStat.innerHTML = `+<span class="tt-text">${generateEnemyStats(eID, sideDazeMult / 100 * eDaze, eStunMult, eStunTime, sideAnomMult / 100 * eAnom, eElementMult, eTags)}</span>`;
    enemy.appendChild(ttStat);

    // display boss resistances (>20%)
    if (eElementMult.some(num => num > 1.2)) {
      let enemyR20P = document.createElement("div");
      enemyR20P.className = "r20p";
      generateR20P(eElementMult, enemyR20P);
      enemy.appendChild(enemyR20P);
    }
    waveEnemies.appendChild(enemy);
    side.appendChild(waveEnemies);

    // display enemy stage description
    let enemyTraitDesc = currEnemy.desc;
    let enemyTraitPerf = currEnemy.perf;
    let enemyTraitMisc = currEnemy.misc;
    if (s <= 3 && eID[2] == "3") {
      let trait = document.createElement("div");
      let traitHeader = document.createElement("div");
      let traitDesc = document.createElement("div");
      trait.className = "t";
      traitHeader.className = "t-header";
      traitDesc.className = "bt-text";
      traitHeader.innerHTML = `${versionNum >= vAdv ? `Trial` : `Side`} ${s} Boss Traits`;
      traitDesc.innerHTML = buffData[eID + `dad${showSpoilers ? `` : `s`}`][enemyTraitDesc] + `<br>` +
                            buffData[eID + `dap${showSpoilers ? `` : `s`}`][enemyTraitPerf] +
                            (enemyTraitMisc != -1 ? `<br>` + buffData[eID + `dam`][enemyTraitMisc] : ``);
      trait.appendChild(traitHeader);
      trait.appendChild(traitDesc);
      side.appendChild(trait);
    }
    else {
      let traitHeader = document.getElementById("t-header");
      let traitDesc = document.getElementById("t-text");
      traitHeader.innerHTML = `Adversity Boss Traits`;
      traitDesc.innerHTML = buffData[eID + `dad${showSpoilers ? `` : `s`}`][enemyTraitDesc] + `<br>` +
                            buffData[eID + `dap${showSpoilers ? `` : `s`}`][enemyTraitPerf] +
                            (enemyTraitMisc != -1 ? `<br>` + buffData[eID + `dam`][enemyTraitMisc] : ``);
    }
  }

  // display trial hp total
  document.getElementById("e").style.display = versionNum >= vAdv ? "inline" : "none";
  document.getElementById("v-hp-e-raw-20000").innerHTML = showNumberFormat(hpData[0][versionNum - 1]);
  document.getElementById("v-hp-e-raw-60000").innerHTML = showNumberFormat(hpData[1][versionNum - 1]);
  document.getElementById("v-hp-e-alt-20000").innerHTML = showNumberFormat(hpData[2][versionNum - 1]);
  document.getElementById("v-hp-e-alt-60000").innerHTML = showNumberFormat(hpData[3][versionNum - 1]);

  // display adversity hp total
  document.getElementById("v-hp-h").style.display = versionNum >= vAdv ? "block" : "none";
  document.getElementById("v-hp-h-raw-20000").innerHTML = showNumberFormat(hpData[4][versionNum - 1]);
  document.getElementById("v-hp-h-raw-60000").innerHTML = showNumberFormat(hpData[5][versionNum - 1]);
  document.getElementById("v-hp-h-alt-20000").innerHTML = showNumberFormat(hpData[6][versionNum - 1]);
  document.getElementById("v-hp-h-alt-60000").innerHTML = showNumberFormat(hpData[7][versionNum - 1]);

  // save current settings/page
  saveState();
}

/* ----------------------------------------------------------------------- ENEMY INFO ----------------------------------------------------------------------- */

// display enemy weaknesses/resistances
function generateWR(eleMult, wr) {
  let wkImg1 = document.createElement("img"), wkImg2 = document.createElement("img"), wkImg3 = document.createElement("img");
  let rsImg1 = document.createElement("img"), rsImg2 = document.createElement("img"), rsImg3 = document.createElement("img");
  wkImg1.className = wkImg2.className = wkImg3.className = "wk";
  rsImg1.className = rsImg2.className = rsImg3.className = "rs";
  wkImg1.src = wkImg2.src = wkImg3.src = rsImg1.src = rsImg2.src = rsImg3.src = "../../assets/zzz/elements/none.webp";
  let wkCnt = rsCnt = 0;
  for (let e = 0; e < elementData.length - (versionNum < vWind); ++e) {
    if (eleMult[e] < 1) {
      (wkCnt == 0 ? wkImg1 : wkCnt == 1 ? wkImg2 : wkImg3).src = `../../assets/zzz/elements/${elementData[e]}.webp`;
      ++wkCnt;
    }
    else if (eleMult[e] > 1) {
      (rsCnt == 0 ? rsImg1 : rsCnt == 1 ? rsImg2 : rsImg3).src = `../../assets/zzz/elements/${elementData[e]}.webp`;
      ++rsCnt;
    }
  }
  wr.appendChild(wkImg1);
  wr.appendChild(wkImg2);
  if (wkCnt == 3) wr.appendChild(wkImg3);
  wr.appendChild(rsImg1);
  wr.appendChild(rsImg2);
  if (rsCnt == 3) wr.appendChild(rsImg3);
}

// display boss resistances (>20%)
function generateR20P(eleMult, r20P) {
  let rs20PHeader = document.createElement("div");
  let rs20P = document.createElement("div");
  rs20PHeader.className = "rs20p-header";
  rs20P.className = "rs20p";
  rs20PHeader.innerHTML = `Boss DMG RES`;
  for (let e = 0; e < elementData.length - (versionNum < vWind); ++e) {
    if (eleMult[e] > 1.2) {
      let rs20PEle = document.createElement("div");
      let rs20PImg = document.createElement("img");
      let rs20PMult = document.createElement("div");
      rs20PEle.className = "rs20p-ele";
      rs20PImg.className = "rs20p-img";
      rs20PMult.className = "rs20p-mult";
      rs20PImg.src = `../../assets/zzz/elements/${elementData[e]}.webp`;
      rs20PMult.innerHTML = `${Math.round(eleMult[e] * 100) - 100}%`;
      rs20PEle.appendChild(rs20PImg);
      rs20PEle.appendChild(rs20PMult);
      rs20P.appendChild(rs20PEle);
    }
  }
  r20P.appendChild(rs20PHeader);
  r20P.appendChild(rs20P);
}

// display enemy alt hp tooltip
function generateAlt(color, name, hpAlt, hp) {
  return `<span style="color:${color};">✦</span><span class="tt-text">
          <span style="font-weight:bold;text-decoration:underline;">${name}</span><br>
          Alt HP: <span style="color:#f6b969;font-weight:bold;">${showNumberFormat(Math.ceil(hpAlt))}</span><br>
          (<span style="color:#f6b969;font-weight:bold;">${Math.round(hpAlt / hp * 100000) / 1000}%</span> of Raw HP)<br><br>`;
}
function generateInstant(color, hpDMechCnt, hpDMech, hpDMult, hpUMech, hpUMult) {
  return  `<span style="color:${color};font-weight:bold;">${hpDMech}</span> ${hpDMechCnt} time(s)${hpDMult == 3.6 ? ` on legs,<br>3 time(s) on core` : ``} → <span style="color:#f6b969;font-weight:bold;">-${hpDMult}%</span>
          ${hpUMult != 0 ? `<br>${hpUMech} → <span style="color:#f6b969;font-weight:bold;">+${hpUMult}%</span>` : ``}`;
}

// display enemy stats
function generateEnemyStats(id, daze, stunMult, stunTime, anom, eleMult, tags) {
  let anomMult = [1, 1, 1, 1, 1.2, 0.5];
  let color = ["#98eff0", "#ff5521", "#2eb6ff", "#fe437e", "#f0d12b", "#a6c5fd"];
  let stats = `Max Daze: <span style="color:#ffe599;font-weight:bold;">${Math.round(daze * 100) / 100}</span><br>
              (<span style="color:#ffe599;font-weight:bold;">${stunMult}%</span> DMG for <span style="color:#ffe599;font-weight:bold;">${stunTime}s</span>)<br><br>`;
  if (tags.includes("no-anom")) return stats + `<span style="font-weight:bold;">IMMUNE TO ANOMALY</span>`;
  stats += `Min Anomaly Buildup:<br>`;
  for (let e = 0; e < elementData.length - (versionNum < vWind); ++e) stats += `<span style="color:${color[e]};font-weight:bold;">${Math.round(anom * anomMult[e] * (1 / (2 - Math.min(eleMult[e], 1.2))) * (id[2] == "1" && e == 5 ? 46/45 : 1) * 100) / 100}</span>/`;
  stats = stats.slice(0, -1) + (tags.includes("no-freeze") ? `<br>(<span style="color:#98eff0;font-weight:bold;">UNFREEZABLE</span>)` : ``);
  return stats;
}

/* ----------------------------------------------------------------------- QOL & NAV ----------------------------------------------------------------------- */

// load saved settings/page
function loadSaveState() {
  currNumberFormat = localStorage.getItem("numberFormat") || "period";
  leaksToggle.checked = localStorage.getItem("leaksEnabled") == "true";
  spoilersToggle.checked = localStorage.getItem("spoilersEnabled") == "true";
  versionNum = parseInt(localStorage.getItem("lastDAVersion") || vLive);
  chartScoreNum = localStorage.getItem("lastDAChartScore") || "60k";
  chartDropdown.value = chartType = localStorage.getItem("lastDAChartType") || "Trial";
  if (!leaksToggle.checked) versionNum = Math.min(versionNum, vLive);
  saveState();
}

// save current settings/page
function saveState() {
  localStorage.setItem("numberFormat", currNumberFormat);
  localStorage.setItem("leaksEnabled", leaksToggle.checked);
  localStorage.setItem("spoilersEnabled", spoilersToggle.checked);
  localStorage.setItem("lastDAVersion", versionNum);
  localStorage.setItem("lastDAChartScore", chartScoreNum);
  localStorage.setItem("lastDAChartType", chartType);
}

// go to top of page
function jumpToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// navigation keyboard shortcuts
document.addEventListener("keydown", (e) => {
  e.stopPropagation();
  if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key == "Escape") { e.preventDefault(); chartIsOpen ? toggleChart() : calcIsOpen ? toggleCalc() : versionSelectorIsOpen ? toggleVersionSelector() : toggleMenuBar(); }
  else if (e.key == " " && !menuBarIsOpen && !calcIsOpen && !chartIsOpen) { e.preventDefault(); toggleVersionSelector(); }
  else if (e.key == "`" && !menuBarIsOpen && !versionSelectorIsOpen && !calcIsOpen) { e.preventDefault(); toggleChart(); }
  else if (e.key == "Tab" && !menuBarIsOpen && !versionSelectorIsOpen && !chartIsOpen) { e.preventDefault(); toggleCalc(); }
  else if (e.key == "Enter" && !menuBarIsOpen && !versionSelectorIsOpen && !calcIsOpen && !chartIsOpen) { e.preventDefault(); jumpToTop(); }
  else if (e.key == "ArrowLeft" && !menuBarIsOpen && !versionSelectorIsOpen && !calcIsOpen && !chartIsOpen) { e.preventDefault(); changeVersion(-1); }
  else if (e.key == "ArrowRight" && !menuBarIsOpen && !versionSelectorIsOpen && !calcIsOpen && !chartIsOpen) { e.preventDefault(); changeVersion(1); }
  else if (e.key == "ArrowDown") { e.preventDefault(); }
  else if (e.key == "ArrowUp") { e.preventDefault(); }
});

/* ------------------------------------------------------------------------ MENU BAR ------------------------------------------------------------------------ */

// display/hide menu bar
function toggleMenuBar() {
  menuBarIsOpen = !menuBarIsOpen;
  let menuBar = document.getElementById("mb");
  let menuBarOverlay = document.getElementById("mb-over");
  document.body.style.overflow = menuBarIsOpen ? "hidden" : "auto";
  menuBar.style.display = menuBarOverlay.style.display = menuBarIsOpen ? "flex" : "none";
}

// display number format
function showNumberFormat(num) {
  if (currNumberFormat == "period") return num.toLocaleString("de-DE");
  if (currNumberFormat == "comma") return num.toLocaleString("en-US");
  return num;
}

// change number format
function changeNumberFormat(e) {
  if (e) currNumberFormat = e.dataset.format;
  let numFormatExample = document.getElementById("mb-nf-ex");
  let numFormatOptions = document.querySelectorAll(".nf-opt");
  numFormatExample.innerHTML = showNumberFormat(2222222);
  numFormatOptions.forEach(opt => opt.classList.toggle("selected", opt.dataset.format == currNumberFormat));
  showEnemies();
}

// display/hide leaks/spoilers
leaksToggle.addEventListener("change", () => {
  if (!leaksToggle.checked) {
    spoilersToggle.checked = false;
    if (versionNum > vLive) versionNum = vLive;
  }
  showVersion();
});
spoilersToggle.addEventListener("change", () => {
  if (spoilersToggle.checked) leaksToggle.checked = true;
  showEnemies();
});

/* -------------------------------------------------------------------- VERSION SELECTOR -------------------------------------------------------------------- */

// display/hide version selector
function toggleVersionSelector() {
  versionSelectorIsOpen = !versionSelectorIsOpen;
  let versionSelector = document.getElementById("vs");
  let versionSelectorOverlay = document.getElementById("vs-over");
  document.body.style.overflow = versionSelectorIsOpen ? "hidden" : "auto";
  versionSelector.style.display = versionSelectorOverlay.style.display = versionSelectorIsOpen ? "flex" : "none";
  if (versionSelectorIsOpen) showVersionSelector();
}

// display version selector
function showVersionSelector() {
  let versionSelectorContent = document.getElementById("vs-cont");
  versionSelectorContent.innerHTML = ``;

  // display allowed version selector options
  for (let v = 1; v <= (leaksToggle.checked ? versionIDs.length : vLive); ++v) {
    let currVersion = versionData[versionIDs[v - 1]];

    // display version selector option
    let versionSelectorOption = document.createElement("div");
    let optionName = document.createElement("div");
    let optionTime = document.createElement("div");
    let optionID = document.createElement("div");
    versionSelectorOption.className = "vs-opt";
    optionName.className = "vs-opt-name";
    optionTime.className = "vs-opt-time";
    optionID.className = "vs-opt-id";
    optionName.innerHTML = currVersion.versionName + (v == vLive ? `<span style="color:#ff5555;font-weight:bold;"> (LIVE)</span>` : v >= vBeta ? `<span style="color:#6d9fff;font-weight:bold;"> (BETA)</span>` : ``);
    optionTime.innerHTML = currVersion.versionTime;
    optionID.innerHTML = `ID: 69${v.toString().padStart(3, `0`)}${v >= vBeta ? `1` : ``}`;
    versionSelectorOption.appendChild(optionName);
    versionSelectorOption.appendChild(optionTime);
    versionSelectorOption.appendChild(optionID);
    versionSelectorContent.appendChild(versionSelectorOption);

    // go to version
    versionSelectorOption.onclick = () => {
      versionNum = v;
      toggleVersionSelector();
      showVersion();
    }
  }
}

/* ----------------------------------------------------------------------- CALCULATOR ----------------------------------------------------------------------- */

// display/hide calculator
function toggleCalc() {
  calcIsOpen = !calcIsOpen;
  let calc = document.getElementById("cc");
  let calcOverlay = document.getElementById("cc-over");
  document.body.style.overflow = calcIsOpen ? "hidden" : "auto";
  calc.style.display = calcOverlay.style.display = calcIsOpen ? "flex" : "none";
  showBossDropdown();
}

// display boss dropdown
function showBossDropdown() {
  let enemyIDs = Object.keys(enemyData);
  let enemyIDsIgnore = ["10301", "10302", "10303", "16300", "30400"];
  bossDropdown.innerHTML = ``;
  for (let i = 0; i < enemyIDs.length; ++i) {
    if (enemyIDs[i][2] == (calcDropdown.value == "Trial" ? "3" : "4") && !enemyIDsIgnore.includes(enemyIDs[i])) {
      let bossOption = document.createElement("option");
      bossOption.text = spoilersToggle.checked || !enemyData[enemyIDs[i]].tags.includes("spoiler") ? enemyData[enemyIDs[i]].name : "SPOILER BOSS";
      bossOption.value = enemyIDs[i];
      bossDropdown.appendChild(bossOption);
    }
  }
  showBossInfo();
}

// display boss info
function showBossInfo() {
  // change boss dropdown size based on boss name length
  let bossDropdownResize = document.getElementById("cc-b-dd-resize");
  bossDropdownResize.innerHTML = bossDropdown.options[bossDropdown.selectedIndex].text;
  bossDropdown.style.width = bossDropdownResize.offsetWidth + 30 + "px";
  currBossID = bossDropdown.value;

  // display boss image
  let bImg = document.getElementById("cc-b-img");
  bImg.src = spoilersToggle.checked || !enemyData[currBossID].tags.includes("spoiler") ? `../../assets/zzz/enemies/${enemyData[currBossID].image}.webp` : `../../assets/zzz/enemies/doppelganger-i.webp`;

  // display boss version dropdowns
  versionDropdown1.innerHTML = versionDropdown2.innerHTML = ``;
  for (let v = 0; v < hpDataSpecific[currBossID].length; ++v) {
    let versionOption1 = document.createElement("option"), versionOption2 = document.createElement("option");
    let versionID = hpDataSpecific[currBossID][v][0];
    versionOption1.text = versionOption1.value = versionOption2.text = versionOption2.value = `${versionID[0]}.${versionID[2]} Phase ${versionID[4]}`;
    versionDropdown1.appendChild(versionOption1);
    versionDropdown2.appendChild(versionOption2);
  }
  versionDropdown1.dispatchEvent(new Event("change"));
  versionDropdown2.dispatchEvent(new Event("change"));
}

// change boss info
bossDropdown.addEventListener("change", () => { showBossInfo(); });
versionDropdown1.addEventListener("change", () => {
  bossData1 = hpDataSpecific[currBossID][versionDropdown1.selectedIndex];
  bossHPMax1 = bossData1[1];
  generateBossStats(bossHPMax1, 60000, 1);
});
versionDropdown2.addEventListener("change", () => {
  bossData2 = hpDataSpecific[currBossID][versionDropdown2.selectedIndex];
  bossHPMax2 = bossData2[1];
  generateBossStats(bossHPMax2, 60000, 2);
});

// display boss version hp/score
function generateBossStats(hp, score, option) {
  let bossData = option == 1 ? bossData1 : bossData2;
  let bossHP = option == 1 ? bossHP1 : bossHP2;
  let bossScore = option == 1 ? bossScore1 : bossScore2;

  // change invalid hp/score input to an empty value
  if (!Number.isInteger(hp) || !Number.isInteger(score)) {
    bossHP.value = bossScore.value = "";
    return;
  }

  // change hp/score to be between 0-bossHPMaxX/0-60000
  hp = Math.max(hp, 0);
  hp = Math.min(hp, option == 1 ? bossHPMax1 : bossHPMax2);
  score = Math.max(score, 0);
  score = Math.min(score, 60000);

  // calculate hp/score to the closest threshold
  let hpCalc = 0, hpCalcFinal = option == 1 ? bossHPMax1 : bossHPMax2;
  let scoreCalc = 0, scoreCalcFinal = 60000;
  let hpThreshold, scoreThreshold;
  let bossCurve = calcDropdown.value == "Trial" ? [[0, 0, 0], [1200, 4, 4000], [1700, 4, 4800], [2200, 4, 7200], [2500, 4, 9600], [3000, 4, 10400], [5000, 3, 7800], [5000, 6, 16200]] :
                                                  [[0, 0, 0], [3600, 4, 3000], [3600, 4, 4000], [3600, 2, 3000], [6000, 4, 14000], [8000, 1, 3500], [10000, 7, 24500], [10000, 2, 8000]];
  for (c = 0; c < bossCurve.length; ++c) {
    hpThreshold = bossCurve[c][0] * bossCurve[c][1] * bossData[1] / (calcDropdown.value == "Trial" ? 874 : 1580) / 100;
    scoreThreshold = bossCurve[c][2];
    if (hpCalc + hpThreshold > hp + 1 || scoreCalc + scoreThreshold > score) break;
    hpCalc += hpThreshold;
    scoreCalc += scoreThreshold;
  }

  // calculate hp/score to a specific value
  if (c < bossCurve.length) {
    hpCalcFinal = hpCalc + (score - scoreCalc) / scoreThreshold * hpThreshold;
    scoreCalcFinal = scoreCalc + (hp - hpCalc) / hpThreshold * scoreThreshold;
  }

  // display hp/score
  bossHP.value = showNumberFormat(score != 60000 ? Math.floor(hpCalcFinal) : hp);
  bossScore.value = score != 60000 ? score : Math.floor(scoreCalcFinal);
}

// change boss version hp/score
bossHP1.addEventListener("change", () => { generateBossStats(parseInt(bossHP1.value.replaceAll(".", "").replaceAll(",", "")), 60000, 1); });
bossHP2.addEventListener("change", () => { generateBossStats(parseInt(bossHP2.value.replaceAll(".", "").replaceAll(",", "")), 60000, 2); });
bossScore1.addEventListener("change", () => { generateBossStats(bossHPMax1, parseInt(bossScore1.value.replaceAll(".", "").replaceAll(",", "")), 1); });
bossScore2.addEventListener("change", () => { generateBossStats(bossHPMax2, parseInt(bossScore2.value.replaceAll(".", "").replaceAll(",", "")), 2); });

/* ------------------------------------------------------------------------- CHART ------------------------------------------------------------------------- */

// display/hide chart
function toggleChart() {
  chartIsOpen = !chartIsOpen;
  let chart = document.getElementById("ch");
  document.body.style.overflow = chartIsOpen ? "hidden" : "auto";
  chart.style.display = chartIsOpen ? "flex" : "none";
  if (chartIsOpen) showChart();
}

// download chart
function downloadChart() {
  let downloadButton = document.createElement("a");
  downloadButton.href = hpChart.toBase64Image("image/png", 1.0);
  downloadButton.download = `Deadly Assault HP - ${chartScoreNum == "60k" ? chartScoreNum : document.querySelector(".ch-score-opt").innerHTML} Score - ${chartType}`;
  downloadButton.click();
}

// display chart score
function changeChartScore(n) {
  chartScoreNum = n;
  showChart();
}

// build chart hp dataset
function generateChartDataset(label, data, color) {
  return {label, data, backgroundColor: "#ffffff", radius: 2, borderWidth: 2, borderColor: color, hoverRadius: 4, hoverBorderWidth: 2, hoverBorderColor: color};
}

// display chart
function showChart() {
  // chart plugins thanks to Chart.js documentation/videos & Stack Overflow
  // chart hover vertical dotted line: https://www.youtube.com/watch?v=-6xqMLOi7Uc
  const verticalDottedLineHover = {
    id: "verticalDottedLineHover",
    beforeDatasetsDraw(chart, args, plugins) {
      let {ctx, chartArea: {top, bottom, height}} = chart;
      ctx.save();
      for (let hp = 0; hp < 3; ++hp)
        chart.getDatasetMeta(hp).data.forEach((dataPoint, index) => {
          if (dataPoint.active) {
            ctx.beginPath();
            ctx.strokeStyle = "#888888";
            ctx.setLineDash([4, 6]);
            ctx.moveTo(dataPoint.x, top);
            ctx.lineTo(dataPoint.x, bottom);
            ctx.stroke();
          }
        })
      ctx.restore();
    }
  }
  // chart legend padding: https://stackoverflow.com/a/67723827
  const legendPadding = {
    id: "legendPadding",
    beforeInit(chart) {
      let oldLegend = chart.legend.fit;
      chart.legend.fit = function fit() {
        oldLegend.bind(chart.legend)();
        chart.legend.height += 15;
      }
    }
  }
  // chart tooltip hide outside: https://stackoverflow.com/a/72488373
  const hideTooltipOutside = {
    id: "hideTooltipOutside",
    afterEvent(chart, args) {
      let {left, right, top, bottom} = chart.chartArea;
      let {x, y} = args.event;
      if (x < left || x > right || y < top || y > bottom) {
        chart.tooltip.setActiveElements([]);
        chart.setActiveElements([]);
        chart.tooltip.update();
        chart.update();
      }
    }
  }

  // chart tooltip position
  Chart.Tooltip.positioners.cursor = function(elements, eventPosition) {
    if (!eventPosition) return false;
    let {top, bottom} = this.chart.chartArea;
    let {x, y} = eventPosition;
    y += y >= (top + bottom) / 3 ? -40 : 55;
    return {x, y};
  }

  // display new chart
  if (!hpChart) {
    hpChart = new Chart("hpChart", {
      // chart plugins
      type: "line", plugins: [verticalDottedLineHover, legendPadding, hideTooltipOutside],

      // chart settings
      options: {
        // chart functionality
        animation: false, responsive: true, maintainAspectRatio: false,
        interaction: {mode: "nearest", axis: "x", intersect: false},
        layout: {padding: {left: 0, right: 15, top: 15, bottom: 15}},

        // chart formatting
        scales: {
          // chart axes formatting
          x: {
            offset: true,
            border: {display: false},
            grid: {color: "transparent"},
            ticks: {
              padding: 15, maxRotation: 0,
              font: {family: "Inconsolata", size: 12}, color: "#888888",
              callback: function(value, index) { return index % 4 == 0 ? this.getLabelForValue(value) : ""; }
            }
          },
          y: {
            offset: false,
            border: {display: false},
            grid: {color: function(context) { return context.index % 2 == 0 ? "#888888" : "#444444"; }},
            ticks: {
              padding: 15, maxRotation: 0,
              font: {family: "Inconsolata", size: 12}, color: "#888888",
              callback: function(value, index) { return index % 2 == 0 ? showNumberFormat(value) : ""; }
            }
          }
        },
        plugins: {
          // chart header formatting
          title: {
            display: true,
            font: {family: "Inconsolata", size: 18}, color: "#ffffff"
          },
          legend: {
            labels: {
              usePointStyle: true, boxHeight: 8,
              font: {family: "Inconsolata", size: 14, weight: "bold"},
              generateLabels: function(chart) {
                // chart legend formatting
                let chartLegend = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                chartLegend.forEach((label, index) => {
                  label.fontColor = label.strokeStyle = chart.isDatasetVisible(index) ? chart.data.datasets[label.datasetIndex].borderColor : "#888888";
                });
                return chartLegend;
              }
            }
          },

          // chart tooltip formatting
          tooltip: {
            usePointStyle: true, boxHeight: 8, position: "cursor", caretSize: 0,
            titleFont: {family: "Inconsolata", size: 12, weight: "bold", lineHeight: 0.75},
            bodyFont: {family: "Inconsolata", size: 12},
            callbacks: {
              labelTextColor: function(context) { return context.dataset.borderColor; },
              label: function(context) { return context.dataset.label + ": " + showNumberFormat(context.parsed.y); }
            }
          }
        }
      }
    });
  }

  // chart global settings
  chartType = chartDropdown.value;
  let hpDataNew = chartType == "Trial" ? hpData.slice(0, 4) : hpData.slice(4, 8).map(ver => ver.slice(vAdv - 1, versionIDs.length));
  let chartScoreOptions = document.querySelectorAll(".ch-score-opt");
  chartScoreOptions.forEach(opt => opt.classList.toggle("selected", opt.dataset.format == chartScoreNum));
  document.querySelector(".ch-score-opt").innerHTML = chartType == "Trial" ? `20k` : `30k`;

  hpChart.data.labels = versionIDs.slice(chartType == "Trial" ? 0 : vAdv - 1, versionIDs.length);
  hpChart.data.datasets = [
    generateChartDataset("Raw HP", chartScoreNum == "60k" ? hpDataNew[1] : hpDataNew[0], "#ff5555"),
    generateChartDataset("Alt HP", chartScoreNum == "60k" ? hpDataNew[3] : hpDataNew[2], "#f6b969")
  ];
  hpChart.options.plugins.title.text = `Deadly Assault HP - ${chartScoreNum == "60k" ? chartScoreNum : document.querySelector(".ch-score-opt").innerHTML} Score - ${chartType}`;
  hpChart.options.scales.y.min = chartScoreNum == "60k" ? 160000000 : 40000000;
  hpChart.options.scales.y.max = chartScoreNum == "60k" ? 1000000000 : 600000000;
  hpChart.options.scales.y.ticks.stepSize = (hpChart.options.scales.y.max - hpChart.options.scales.y.min) / 14;
  hpChart.update();

  // save current settings/page
  saveState();
}