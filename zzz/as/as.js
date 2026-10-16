/* ----------------------------------------------------------------------- MAIN PAGE ----------------------------------------------------------------------- */

let vLive = 1, vBeta = 2;
let menuBarIsOpen = versionSelectorIsOpen = false;
let elementData = ["ice", "fire", "electric", "ether", "physical", "wind"];
let currNumberFormat, leaksToggle = document.getElementById("lks"), spoilersToggle = document.getElementById("spl");

let versionData, enemyData, buffData, versionIDs = [];
let hpData = [];
let versionAgentIDs, versionHPMult, versionDazeMult, versionAnomMult, versionEnemies;
let versionNum, variantNum;

// display main page
async function loadPage() {
  versionData = await (await fetch("as-versions.json")).json();
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
  hpData = Array.from({length: 4}, () => Array.from({length: versionIDs.length}).fill(null));
  for (let v = 1; v <= versionIDs.length; ++v) {
    let versionEnemies = versionData[versionIDs[v - 1]].versionEnemies;
    let hpRawStandard = hpAltStandard = hpRawExtreme = hpAltExtreme = 0;

    // build standard/extreme hp dataset
    for (let s = 1; s <= versionEnemies.length; ++s) {
      let sideHPMultStandard = versionData[versionIDs[v - 1]].versionHPMult[0][s - 1];
      let sideHPMultExtreme = versionData[versionIDs[v - 1]].versionHPMult[1][s - 1];

      let currEnemy = versionEnemies[s - 1];
      let eID = currEnemy.id;
      let eType = currEnemy.type;
      let eHPMult = currEnemy.hpMult ? currEnemy.hpMult : sideHPMultStandard;
      let eData = enemyData[eID];
      let eMods = eData.mods;

      // define enemy hp
      let eHP = eData.baseHP[eType] * 24795 * eHPMult / 10000;
      hpRawStandard += eHP;
      hpAltStandard += eHP * (eID[2] >= "2" && eData.baseDEF[eType] < 60 ? (794 + eData.baseDEF[eType] * 1588 / 100) / (794 + 60 * 1588 / 100) : 1);
      if (eMods.length >= 1) {
        // define alt hp mods
        let modImpair = eMods.find(mod => /^impr.+$/.test(mod));
        let modPurify = eMods.find(mod => /^prfy.+$/.test(mod));
        let modShutdown = eMods.find(mod => /^shut.+$/.test(mod));
        let modConvert = eMods.find(mod => /^conv.+$/.test(mod));

        if (modImpair) hpAltStandard -= eHP * modImpair.slice(7, 12) / 10000;
        if (modPurify) hpAltStandard -= eHP * modPurify.slice(7, 12) / 10000;
        if (modShutdown) hpAltStandard -= eHP * modShutdown.slice(7, 12) / 10000;
        if (modConvert) hpAltStandard -= eHP * (modConvert.slice(7, 12) - modConvert.slice(13, 18)) / 10000;
      }
      hpRawExtreme = hpRawStandard / sideHPMultStandard * sideHPMultExtreme;
      hpAltExtreme = hpAltStandard / sideHPMultStandard * sideHPMultExtreme;
    }
    hpData[0][v - 1] = Math.round(hpRawStandard);
    hpData[1][v - 1] = Math.round(hpAltStandard);
    hpData[2][v - 1] = Math.round(hpRawExtreme);
    hpData[3][v - 1] = Math.round(hpAltExtreme);
  }
}

/* ------------------------------------------------------------------------ VERSION ------------------------------------------------------------------------ */

// display version
function showVersion() {
  let currVersion = versionData[versionIDs[versionNum - 1]];
  versionAgentIDs = currVersion.versionAgentIDs;
  versionHPMult = currVersion.versionHPMult;
  versionDazeMult = currVersion.versionDazeMult;
  versionAnomMult = currVersion.versionAnomMult;
  versionEnemies = currVersion.versionEnemies;
  document.getElementById("v-name").innerHTML = currVersion.versionName + (versionNum == vLive ? `<span style="color:#ff5555;font-weight:bold;"> (LIVE)</span>` : versionNum >= vBeta ? `<span style="color:#6d9fff;font-weight:bold;"> (BETA)</span>` : ``);
  document.getElementById("v-time").innerHTML = currVersion.versionTime;
  document.getElementById("v-id").innerHTML = `ID: ${versionNum}`;
  showVariant();
  showAgents();
  showEnemies();
}

// change version
function changeVersion(n) {
  let vMax = leaksToggle.checked ? versionIDs.length : vLive;
  versionNum = (versionNum - 1 + n + vMax) % vMax + 1;
  showVersion();
}

/* ------------------------------------------------------------------------ VARIANT ------------------------------------------------------------------------ */

// display variants
function showVariant() {
  let variantOptions = document.querySelectorAll(".var-opt");
  variantOptions.forEach(opt => opt.classList.toggle("selected", opt.dataset.format == variantNum));
}

// change variants
function changeVariant(n) {
  variantNum = n;
  showVersion();
}

/* ------------------------------------------------------------------------- AGENTS ------------------------------------------------------------------------- */

// display agents
function showAgents() {
  let agentContent = document.getElementById("a-cont");
  agentContent.innerHTML = ``;

  // display allowed agent options
  if (variantNum == 1) {
    let agentText = document.createElement("div");
    agentText.className = "a-text";
    agentText.innerHTML = `All released Agents in this version<br>are available in Standard Mode!`;
    agentContent.appendChild(agentText);
    return;
  }
  for (let a = 1; a <= versionAgentIDs.length; ++a) {
    let agent = document.createElement("div");
    agent.className = "a";

    // display agent option
    let agentImg = document.createElement("img");
    let agentName = document.createElement("div");
    let agentHover = document.createElement("div");
    agentImg.className = "a-img";
    agentName.className = "a-name";
    agentHover.className = "a-hover";
    agentImg.src = `../../assets/zzz/agents/${buffData[versionAgentIDs[a - 1]][1]}.webp`;
    agentName.innerHTML = buffData[versionAgentIDs[a - 1]][0];
    agentHover.appendChild(agentImg);
    agentHover.appendChild(agentName);
    agent.appendChild(agentHover);

    // display agent buff
    if (buffData[versionAgentIDs[a - 1]][2]) {
      let agentTTBuff = document.createElement("div");
      agentTTBuff.className = "a-tt-buff";
      agentTTBuff.innerHTML = `<span style="color:#2bad00;">✦</span><span class="tt-text"><span style="font-weight:bold;text-decoration:underline;">${buffData[versionAgentIDs[a - 1]][0]}</span><br>${buffData[versionAgentIDs[a - 1]][2]}</span>`;
      agent.appendChild(agentTTBuff);
    }
    agentContent.appendChild(agent);
  }
}

/* ------------------------------------------------------------------------ ENEMIES ------------------------------------------------------------------------ */

// display enemies
function showEnemies() {
  for (let s = 1; s <= versionEnemies.length; ++s) {
    let side = document.getElementById(`s${s}`);
    side.innerHTML = ``;

    // display side header
    let sideHeader = document.createElement("div");
    sideHeader.className = "s-header";
    sideHeader.innerHTML = `Side ${s} Lv70`;

    // display side multipliers
    let sideHPMult = versionHPMult[variantNum - 1][s - 1], sideDazeMult = versionDazeMult[s - 1], sideAnomMult = versionAnomMult[s - 1];
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
    let eHP = Math.floor(eData.baseHP[eType] * 24795 * sideHPMult / 10000);
    let eDEF = Math.ceil(eData.baseDEF[eType] * 1588 / 100);
    let eDaze = eData.baseDaze[eType] * 3.88;
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
        eHPAlt -= eHP * modPurify.slice(7, 12) / 10000;
        ttHPColor = "#da00ad";
        ttHP.innerHTML += `${generateInstant(ttHPColor, modPurify.slice(5, 6), "PURIFIED!!", modPurify.slice(7, 12) / 100, "", 0)}<br>`;
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
    let trait = document.createElement("div");
    let traitHeader = document.createElement("div");
    let traitDesc = document.createElement("div");
    trait.className = "t";
    traitHeader.className = "t-header";
    traitDesc.className = "bt-text";
    traitHeader.innerHTML = `Side ${s} Boss Traits`;
    traitDesc.innerHTML = buffData[eID + `asd${showSpoilers ? `` : `s`}`][enemyTraitDesc] + `<br>` +
                          buffData[eID + `asp${showSpoilers ? `` : `s`}`][enemyTraitPerf] +
                          (enemyTraitMisc != -1 ? `<br>` + buffData[eID + `asm`][enemyTraitMisc] : ``);
    trait.appendChild(traitHeader);
    trait.appendChild(traitDesc);
    side.appendChild(trait);
  }

  // display standard/extreme hp total
  document.getElementById("v-hp-raw").innerHTML = showNumberFormat(hpData[variantNum * 2 - 2][versionNum - 1]);
  document.getElementById("v-hp-alt").innerHTML = showNumberFormat(hpData[variantNum * 2 - 1][versionNum - 1]);

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
  for (let e = 0; e < elementData.length; ++e) {
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
  for (let e = 0; e < elementData.length; ++e) {
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
  for (let e = 0; e < elementData.length; ++e) stats += `<span style="color:${color[e]};font-weight:bold;">${Math.round(anom * anomMult[e] * (1 / (2 - Math.min(eleMult[e], 1.2))) * (id[2] == "1" && e == 5 ? 46/45 : 1) * 100) / 100}</span>/`;
  stats = stats.slice(0, -1) + (tags.includes("no-freeze") ? `<br>(<span style="color:#98eff0;font-weight:bold;">UNFREEZABLE</span>)` : ``);
  return stats;
}

/* ----------------------------------------------------------------------- QOL & NAV ----------------------------------------------------------------------- */

// load saved settings/page
function loadSaveState() {
  currNumberFormat = localStorage.getItem("numberFormat") || "period";
  leaksToggle.checked = localStorage.getItem("leaksEnabled") == "true";
  spoilersToggle.checked = localStorage.getItem("spoilersEnabled") == "true";
  versionNum = parseInt(localStorage.getItem("lastAZVersion") || vLive);
  variantNum = parseInt(localStorage.getItem("lastAZVariant") || 1);
  if (!leaksToggle.checked) versionNum = Math.min(versionNum, vLive);
  saveState();
}

// save current settings/page
function saveState() {
  localStorage.setItem("numberFormat", currNumberFormat);
  localStorage.setItem("leaksEnabled", leaksToggle.checked);
  localStorage.setItem("spoilersEnabled", spoilersToggle.checked);
  localStorage.setItem("lastAZVersion", versionNum);
  localStorage.setItem("lastAZVariant", variantNum);
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
  if (e.key == "Escape") { e.preventDefault(); versionSelectorIsOpen ? toggleVersionSelector() : toggleMenuBar(); }
  else if (e.key == " " && !menuBarIsOpen) { e.preventDefault(); toggleVersionSelector(); }
  else if (e.key == "Enter" && !menuBarIsOpen && !versionSelectorIsOpen) { e.preventDefault(); jumpToTop(); }
  else if (e.key == "ArrowLeft" && !menuBarIsOpen && !versionSelectorIsOpen) { e.preventDefault(); changeVersion(-1); }
  else if (e.key == "ArrowRight" && !menuBarIsOpen && !versionSelectorIsOpen) { e.preventDefault(); changeVersion(1); }
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
    optionID.innerHTML = `ID: ${v}`;
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