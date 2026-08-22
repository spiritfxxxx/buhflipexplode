/* ------------------------------------------------------------------------ MAIN PAGE ----------------------------------------------------------------------- */

let vLive = 43, vBeta = 45, vMias = 19, vWind = 35, vAdv = 42;
let leaksToggle = document.getElementById("lks")
let spoilersToggle = document.getElementById("spl");
let chartDropdown = document.getElementById("c-dd");
let calcDropdown = document.getElementById("cc-dd");
let calcBossDropdown = document.getElementById("cc-b-dd");
let calcVerDropdown1 = document.getElementById("cc-b-v-dd1"), calcScore1 = document.getElementById("cc-b-score1"), calcHP1 = document.getElementById("cc-b-hp1");
let calcVerDropdown2 = document.getElementById("cc-b-v-dd2"), calcScore2 = document.getElementById("cc-b-score2"), calcHP2 = document.getElementById("cc-b-hp2");
let versionNum, chartScoreNum, chartDisplayType, currCalcBossID, currCalcData1, currCalcData2, currCalcVersion1, currCalcVersion2, currCalcMaxHP1, currCalcMaxHP2, currNumberFormat;
let menuIsOpen = versionSelectorIsOpen = calcIsOpen = chartIsOpen = false;

let versionData, enemyData, buffData, hpChart;
let versionBuffIDs, versionHPMult, versionDazeMult, versionAnomMult, versionEnemies;
let versionIDs = [], hpData = [], hpDataSpecific = Object.create(null);
let elementsData = ["ice", "fire", "electric", "ether", "physical", "wind"];

// build & display main page
async function loadPage() {
  versionData = await (await fetch("da-versions.json")).json();
  enemyData = await (await fetch("../../assets/zzz/enemies.json")).json();
  buffData = await (await fetch("../../assets/zzz/buffs.json")).json();
  versionIDs = Object.keys(versionData);
  loadHPData();
  loadSavedState();
  showVersion();
  changeNumberFormat();
}

// build hp database
function loadHPData() {
  hpData = Array.from({length: 8}, () => Array.from({length: versionIDs.length}).fill(null));
  for (let v = 1; v <= versionIDs.length; ++v) {
    let versionEnemies = versionData[versionIDs[v - 1]].versionEnemies;
    let raw60kTrialEnemyHP = alt60kTrialEnemyHP = 0;
    let raw60kAdversityEnemyHP = alt60kAdversityEnemyHP = 0;

    // build boss hp database
    for (let s = 1; s <= versionEnemies.length; ++s) {
      let sideHPMult = versionData[versionIDs[v - 1]].versionHPMult[s - 1];

      let currEnemy = versionEnemies[s - 1];
      let currEnemyID = currEnemy.id;
      let currEnemyType = currEnemy.type;
      let currEnemyHPMult = currEnemy.hpMult ? currEnemy.hpMult : sideHPMult;
      let currEnemyData = enemyData[currEnemyID];
      let eHP = currEnemyData.baseHP[currEnemyType] * 24795 * currEnemyHPMult * (s != 4 ? 8.74 : 15.8) / 10000;
      let eTags = currEnemyData.tags;

      // calculate boss raw hp
      if (s != 4) raw60kTrialEnemyHP += eHP;
      else raw60kAdversityEnemyHP += eHP;

      // calculate boss alt hp
      let altHP = eHP * (currEnemyID[2] >= "2" && currEnemyData.baseDEF[currEnemyType] < 60 ? (794 + currEnemyData.baseDEF[currEnemyType] * 1588 / 100) / (794 + 60 * 1588 / 100) : 1);
      if (eTags.length >= 1 && !(eTags.length == 1 && eTags.includes("spoiler"))) {
        // define boss hp tags
        let impairHP = eTags.find(tag => /^impr.+$/.test(tag));
        let miasmaHP = eTags.find(tag => /^mias.+$/.test(tag));
        let shutdownHP = eTags.find(tag => /^shut.+$/.test(tag));
        let convertHP = eTags.find(tag => /^conv.+$/.test(tag));

        if (impairHP) altHP -= eHP * impairHP.slice(7, 12) / 10000;
        if (miasmaHP) altHP -= eHP * (v < vMias ? 300 : miasmaHP.slice(7, 12)) / 10000;
        if (shutdownHP) altHP -= eHP * shutdownHP.slice(7, 12) / 10000;
        if (convertHP) altHP -= eHP * (convertHP.slice(7, 12) - convertHP.slice(13, 18)) / 10000;
      }
      if (s != 4) alt60kTrialEnemyHP += altHP;
      else alt60kAdversityEnemyHP += altHP;

      // add boss appearance to boss hp map
      if (!hpDataSpecific[currEnemyID]) hpDataSpecific[currEnemyID] = [];
      hpDataSpecific[currEnemyID].push([versionIDs[v - 1], Math.round(eHP)]);
    }

    // trial hp data
    hpData[0][v - 1] = Math.round(raw60kTrialEnemyHP * 0.281083138);
    hpData[1][v - 1] = Math.round(raw60kTrialEnemyHP);
    hpData[2][v - 1] = Math.round(alt60kTrialEnemyHP * 0.281083138);
    hpData[3][v - 1] = Math.round(alt60kTrialEnemyHP);

    // adversity hp data
    hpData[4][v - 1] = Math.round(raw60kAdversityEnemyHP * 0.571428571);
    hpData[5][v - 1] = Math.floor(raw60kAdversityEnemyHP);
    hpData[6][v - 1] = Math.round(alt60kAdversityEnemyHP * 0.571428571);
    hpData[7][v - 1] = Math.round(alt60kAdversityEnemyHP);
  }
}

// display version/time/id
function showVersion() {
  let currVersion = versionData[versionIDs[versionNum - 1]];
  versionBuffIDs = currVersion.versionBuffIDs;
  versionHPMult = currVersion.versionHPMult;
  versionDazeMult = currVersion.versionDazeMult;
  versionAnomMult = currVersion.versionAnomMult;
  versionEnemies = currVersion.versionEnemies;
  document.getElementById("v-name").innerHTML = currVersion.versionName + (versionNum == vLive ? `<span style="color:#ff0000;font-weight:bold;"> (LIVE)</span>` : versionNum >= vBeta ? `<span style="color:#52a9f7;font-weight:bold;"> (BETA)</span>` : ``);
  document.getElementById("v-time").innerHTML = currVersion.versionTime;
  document.getElementById("v-id").innerHTML = `ID: 69${versionNum.toString().padStart(3, `0`)}${versionNum >= vBeta ? `1` : ``}`;
  showBuffs();
  showEnemies();
}
function changeVersion(n) {
  let maxVersion = leaksToggle.checked ? versionIDs.length : vLive;
  versionNum = (versionNum - 1 + n + maxVersion) % maxVersion + 1;
  showVersion();
}

// display buffs
function showBuffs() {
  for (let buff = 1; buff <= versionBuffIDs.length; ++buff) {
    let b = document.getElementById(`b${buff}`);
    let buffImg = document.createElement("img");
    let buffName = document.createElement("div");
    let buffDesc = document.createElement("div");
    buffImg.className = "b-img";
    buffName.className = "b-name";
    buffDesc.className = "bt-desc";
    b.innerHTML = ``;
    buffImg.src = `../../assets/zzz/buffs/${buffData[versionBuffIDs[buff - 1]][1]}.webp`;
    buffName.innerHTML = buffData[versionBuffIDs[buff - 1]][0];
    buffDesc.innerHTML = buffData[versionBuffIDs[buff - 1]][2];
    b.appendChild(buffImg);
    b.appendChild(buffName);
    b.appendChild(buffDesc);
  }
}

// display enemies
function showEnemies() {
  // display sides
  let side1 = document.getElementById("s1"), side2 = document.getElementById("s2"), side3 = document.getElementById("s3"), sideH = document.getElementById("sh");
  side1.innerHTML = side2.innerHTML = side3.innerHTML = sideH.innerHTML = ``;
  document.getElementById("s-h").style.display = versionNum < vAdv ? "none" : "flex";

  // loop sides
  for (let s = 1; s <= versionEnemies.length; ++s) {
    let side = s == 1 ? side1 : s == 2 ? side2 : s == 3 ? side3 : sideH;

    // display side title
    let sideHeader = document.createElement("div");
    sideHeader.className = "s-header";
    sideHeader.innerHTML = (s != 4 ? `Trial ${s}` : `Adversity`) + ` Lv70`;

    // display side HP multiplier
    let hpMult = document.createElement("div");
    let sideHPMult = versionHPMult[s - 1], sideDazeMult = versionDazeMult[s - 1], sideAnomMult = versionAnomMult[s - 1];
    hpMult.className = "s-hp-daze-anom-mult";
    hpMult.innerHTML = `HP: <span style="color:#ff5555;">${sideHPMult}%</span> | Daze: <span style="color:#ffe599;">${sideDazeMult}%</span> | Anom: <span style="color:#7b78ff;">${sideAnomMult}%</span>`;
    sideHeader.appendChild(hpMult);
    side.appendChild(sideHeader);

    // display wave
    let waveEnemies = document.createElement("div");
    waveEnemies.className = "w-e";

    let currEnemy = versionEnemies[s - 1];
    let currEnemyID = currEnemy.id;
    let currEnemyType = currEnemy.type;
    let currEnemyHPMult = currEnemy.hpMult ? currEnemy.hpMult : sideHPMult;
    let currEnemyData = enemyData[currEnemyID];

    // define enemy parameters
    let eTags = currEnemyData.tags;
    let eMods = currEnemyData.mods;
    let showEnemySpoilers = spoilersToggle.checked || !eTags.includes("spoiler");
    let eName = showEnemySpoilers ? currEnemyData.name : "SPOILER BOSS";
    let eImg = showEnemySpoilers ? `../../assets/zzz/enemies/${currEnemyData.image}.webp` : `../../assets/zzz/enemies/doppelganger-i.webp`;

    // define enemy stats
    let eHP = Math.floor((s != 4 ? 8.74 : 15.8) * sideHPMult * currEnemyData.baseHP[currEnemyType] * 24795 / 10000);
    let eDEF = Math.ceil(currEnemyData.baseDEF[currEnemyType] * 1588 / 100);
    let eDaze = currEnemyData.baseDaze[currEnemyType] * 2.35;
    let eStunMult = currEnemyData.stunMult;
    let eStunTime = currEnemyData.stunTime;
    let eAnom = currEnemyData.baseAnom;
    let eElementMult = currEnemyData.elementMult;

    // display enemy
    let enemy = document.createElement("div");
    enemy.className = "e";

    let enemyImg = document.createElement("img");
    let enemyName = document.createElement("div");
    let enemyHover = document.createElement("div");
    enemyImg.className = "e-img";
    enemyName.className = "e-name";
    enemyHover.className = "e-hover";
    enemyImg.src = eImg;
    enemyHover.appendChild(enemyImg);
    enemyName.innerHTML = eName;
    enemyHover.appendChild(enemyName);
    enemy.appendChild(enemyHover);

    // display enemy weaknesses/resistances
    let enemyWR = document.createElement("div");
    enemyWR.className = "wr";
    generateWR(eElementMult, enemyWR, currEnemyID);
    enemy.appendChild(enemyWR);

    // display enemy hp
    let hp = document.createElement("div");
    let enemyHP = document.createElement("div");
    hp.className = "hp";
    enemyHP.className = "e-hp";
    enemyHP.innerHTML = showNumberFormat(eHP);
    hp.appendChild(enemyHP);

    // display special enemy tooltip
    if (eTags.length >= 1 && !(eTags.length == 1 && eTags.includes("spoiler"))) {
      let ttHP = document.createElement("div");
      ttHP.className = "tt-e-hp";

      let lowDEF = currEnemyID[2] >= "2" && currEnemyData.baseDEF[currEnemyType] < 60;
      let eHPNew = eHP * (lowDEF ? (794 + currEnemyData.baseDEF[currEnemyType] * 1588 / 100) / (794 + 60 * 1588 / 100) : 1);
      let color = "#ffffff";
      ttHP.innerHTML += lowDEF ? `<span style="font-weight:bold;">NORMALIZED to 953 DEF</span> → <span style="font-weight:bold;">×${Math.round(eHPNew / eHP * 100000) / 1000}%</span><br>`: ``;

      // define enemy hp tags
      let impairHP = eTags.find(tag => /^impr.+$/.test(tag));
      let miasmaHP = eTags.find(tag => /^mias.+$/.test(tag));
      let shutdownHP = eTags.find(tag => /^shut.+$/.test(tag));
      let convertHP = eTags.find(tag => /^conv.+$/.test(tag));

      if (impairHP) {
        eHPNew -= eHP * impairHP.slice(7, 12) / 10000;
        color = "#ca9a00";
        ttHP.innerHTML += instant(color, "IMPAIRED!!", impairHP.slice(5, 6), impairHP.slice(7, 12) / 100, 0, "") + `<br>`;
      }
      if (miasmaHP) {
        eHPNew -= eHP * (versionNum < vMias ? 300 : miasmaHP.slice(7, 12)) / 10000;
        color = "#b4317b";
        ttHP.innerHTML += instant(color, "PURIFIED!!", miasmaHP.slice(5, 6), (versionNum < vMias ? 3 : miasmaHP.slice(7, 12)) / 100, 0, "") + `<br>`;
      }
      if (shutdownHP) {
        eHPNew -= eHP * shutdownHP.slice(7, 12) / 10000;
        color = "#b47ede";
        ttHP.innerHTML += instant(color, "SHUTDOWN!!", shutdownHP.slice(5, 6), shutdownHP.slice(7, 12) / 100, 0, "") + `<br>`;
      }
      if (convertHP) {
        eHPNew -= eHP * (convertHP.slice(7, 12) - convertHP.slice(13, 18)) / 10000;
        color = "#007bb8";
        ttHP.innerHTML += instant(color, "CONVERT!!", convertHP.slice(5, 6), convertHP.slice(7, 12) / 100, convertHP.slice(13, 18) / 100, "Corruptive Barrier(s)") + `<br>`;
      }

      // display tooltip text
      ttHP.innerHTML = alt(color, eName, eHPNew, eHP, lowDEF) + ttHP.innerHTML;
      hp.appendChild(ttHP);
    }

    // display enemy specific hp multiplier
    if (sideHPMult != currEnemyHPMult) {
      let specificHPMult = document.createElement("div");
      specificHPMult.className = "e-hp-mult";
      specificHPMult.innerHTML = `[${currEnemyHPMult}%]`;
      hp.appendChild(specificHPMult);
    }
    enemy.appendChild(hp);

    // display enemy def
    let enemyDEF = document.createElement("div");
    enemyDEF.className = "e-def";
    enemyDEF.innerHTML = eDEF;
    enemy.appendChild(enemyDEF);

    // display enemy misc stats
    let ttMiscStat = document.createElement("div");
    ttMiscStat.className = "tt-e-stat";
    ttMiscStat.innerHTML = `+<span class="tt-text">${generateEnemyStats(currEnemyID, sideDazeMult / 100 * eDaze, eStunMult, eStunTime, sideAnomMult / 100 * eAnom, eElementMult, eMods)}</span>`;
    enemy.appendChild(ttMiscStat);

    // display enemy 40%+ resistances
    let enemyR = document.createElement("div");
    enemyR.className = "res-40plus";
    generateR(eElementMult, enemyR, currEnemyID, enemy);

    waveEnemies.appendChild(enemy);
    side.appendChild(waveEnemies);

    // add enemy stage description
    let currEnemyDesc = currEnemy.desc;
    let currEnemyPerf = currEnemy.perf;
    let currEnemyMisc = currEnemy.misc;
    if (side == sideH && currEnemyID[2] == "4") {
      let traitTitle = document.getElementById("t-title");
      let traitDesc = document.getElementById("t-desc");
      traitTitle.innerHTML = `Adversity Boss Traits`;
      traitDesc.innerHTML = buffData[currEnemyID + `dad${eTags.includes("spoiler") && !spoilersToggle.checked ? "s" : ""}`][currEnemyDesc] + `<br>` +
                            buffData[currEnemyID + `dap${eTags.includes("spoiler") && !spoilersToggle.checked ? "s" : ""}`][currEnemyPerf] + `<br>` +
                            (currEnemyMisc != -1 ? buffData[currEnemyID + `dam`][currEnemyMisc] : ``);
    }
    else {
      let trait = document.createElement("div");
      let traitTitle = document.createElement("div");
      let traitDesc = document.createElement("div");
      trait.className = "t";
      traitTitle.className = "t-title";
      traitDesc.className = "bt-desc";
      traitTitle.innerHTML = `Trial ${s} Boss Traits`;
      trait.appendChild(traitTitle);
      traitDesc.innerHTML = buffData[currEnemyID + `dad${eTags.includes("spoiler") && !spoilersToggle.checked ? "s" : ""}`][currEnemyDesc] + `<br>` +
                            buffData[currEnemyID + `dap${eTags.includes("spoiler") && !spoilersToggle.checked ? "s" : ""}`][currEnemyPerf] + `<br>` +
                            (currEnemyMisc != -1 ? buffData[currEnemyID + `dam`][currEnemyMisc] : ``);
      trait.appendChild(traitDesc);
      side.appendChild(trait);
    }
  }

  // display trial HP values
  document.getElementById("v-hp-raw-20000-tri").innerHTML = showNumberFormat(hpData[0][versionNum - 1]);
  document.getElementById("v-hp-raw-60000-tri").innerHTML = showNumberFormat(hpData[1][versionNum - 1]);
  document.getElementById("v-hp-alt-20000-tri").innerHTML = showNumberFormat(hpData[2][versionNum - 1]);
  document.getElementById("v-hp-alt-60000-tri").innerHTML = showNumberFormat(hpData[3][versionNum - 1]);

  // display adversity HP values
  document.getElementById("tri").style.display = versionNum < vAdv ? "none" : "inline";
  document.getElementById("v-hp-adv").style.display = versionNum < vAdv ? "none" : "flex";
  document.getElementById("v-hp-raw-20000-adv").innerHTML = showNumberFormat(hpData[4][versionNum - 1]);
  document.getElementById("v-hp-raw-60000-adv").innerHTML = showNumberFormat(hpData[5][versionNum - 1]);
  document.getElementById("v-hp-alt-20000-adv").innerHTML = showNumberFormat(hpData[6][versionNum - 1]);
  document.getElementById("v-hp-alt-60000-adv").innerHTML = showNumberFormat(hpData[7][versionNum - 1]);

  // save current page/settings
  saveProgress();
}

/* -------------------------------------------------------------------- INFO GENERATOR -------------------------------------------------------------------- */

// display weaknesses/resistances
function generateWR(mult, wr, id) {
  let weakImg1 = document.createElement("img");
  let weakImg2 = document.createElement("img");
  let resImg1 = document.createElement("img");
  let resImg2 = document.createElement("img");
  weakImg1.className = weakImg2.className = "wk";
  resImg1.className = resImg2.className = "res";
  weakImg1.src = weakImg2.src = "../../assets/zzz/elements/none.webp";
  resImg1.src = resImg2.src = "../../assets/zzz/elements/none.webp";
  let wkCnt = resCnt = 0;
  for (let e = 0; e < elementsData.length - (versionNum < vWind); ++e) {
    if (mult[e] < 1) { (wkCnt == 0 ? weakImg1 : weakImg2).src = `../../assets/zzz/elements/${elementsData[e]}.webp`; ++wkCnt;}
    else if (mult[e] > 1) { (resCnt == 0 ? resImg1 : resImg2).src = `../../assets/zzz/elements/${elementsData[e]}.webp`; ++resCnt; }
  }
  wr.appendChild(weakImg1);
  if (versionNum >= vWind && id == "24300") {
    let weakImg3 = document.createElement("img");
    weakImg3.className = "wk";
    weakImg3.src = "../../assets/zzz/elements/physical.webp";
    wr.appendChild(weakImg3);
  }
  wr.appendChild(weakImg2);
  wr.appendChild(resImg1);
  wr.appendChild(resImg2);
}

// display 40%+ resistances
function generateR(mult, r, id, enemy) {
  let hasRES = false;
  let bossRES = document.createElement("div");
  let resEle = document.createElement("div");
  bossRES.className = "e-res-title";
  resEle.className = "e-res-ele";
  bossRES.innerHTML = "Boss DMG RES";

  for (let e = 0; e < elementsData.length - (versionNum < vWind); ++e) {
    if (mult[e] > 1.2) {
      hasRES = true;
      let res = document.createElement("div");
      let resImg = document.createElement("img");
      let resMult = document.createElement("div");
      res.className = "e-res";
      resImg.className = "res";
      resMult.className = "e-res-mult";
      resImg.style.borderWidth = "0px";
      resImg.src = `../../assets/zzz/elements/${elementsData[e]}.webp`;
      resMult.innerHTML = `${Math.round(mult[e] * 100) - 100}%`;
      res.appendChild(resImg);
      res.appendChild(resMult);
      resEle.appendChild(res);
    }
  }

  // display only for bosses
  if (id[2] >= "2" && hasRES) { r.appendChild(bossRES); r.appendChild(resEle); enemy.appendChild(r); }
}

// display special tooltip
function alt(color, name, hpNew, hp) {
  return `<span style="color:${color};">✦</span><span class="tt-text">
          <span style="font-weight:bold;text-decoration:underline;">${name}</span><br>
          <span style="color:#f6b26b;font-weight:bold;">Alt HP</span>: <span style="color:#f6b26b;font-weight:bold;">${showNumberFormat(Math.ceil(hpNew))}</span><br>
          <span style="font-weight:bold;">(${Math.round(hpNew / hp * 100000) / 1000}% of <span style="color:#ff5555;">Raw HP</span>)</span><br><br>`;
}
function instant(color, type, cnt, hpD, hpU, mech) { return `<span style="font-weight:bold;color:${color};">${type}</span> ${cnt} time(s) ${hpD == 3.6 ? ` on legs,<br>3 time(s) on core` : ``} → <span style="font-weight:bold;">-${hpD}%</span> ${hpU != 0 ? `<br>${mech} → <span style="font-weight:bold;">+${hpU}%</span>` : ``}`; }

// display misc stats
function generateEnemyStats(id, daze, stun, time, anom, dmg, mods) {
  let anomMult = [1, 1, 1, 1, 1.2, 0.5];
  let color = ["#98eff0", "#ff5521", "#2eb6ff", "#fe437e", "#f0d12b", "#a6c5fd"];
  let stats = `<span style="font-weight:bold;">Max Daze: <span style="color:#ffe599;">${Math.round(daze * 10000) / 10000}</span></span><br>
              (<span style="color:#ffe599;font-weight:bold;">${stun}%</span> DMG for <span style="color:#ffe599;font-weight:bold;">${time}s</span>)<br><br>`;
  if (mods.includes("no-anom")) return stats + `<span style="font-weight:bold;">IMMUNE TO ANOMALY</span>`;
  else {
    stats += `<span style="font-weight:bold;">Min Anomaly Buildup:</span><br>`;
    for (let i = 0; i < elementsData.length - (versionNum < vWind); ++i) stats += `<span style="color:${color[i]};font-weight:bold;">${Math.round(anom * (id[2] == "1" && i == 5 ? 46/45 : 1) * anomMult[i] * (1 / (2 - Math.min(dmg[i], 1.2))) * 100) / 100}</span>/`;
    stats = stats.slice(0, -1) + `<br>${mods.includes("no-freeze") ? `<span style="color:#98eff0;font-weight:bold;">UNFREEZABLE</span>` : ``}`;
  }
  return stats;
}

/* ------------------------------------------------------------ MISCELLANEOUS + QOL + NAVIGATION ------------------------------------------------------------ */

// load last page/settings
// !!!!!!!!!!!!!!!!!! DEFAULT TO LATEST DA !!!!!!!!!!!!!!!!!!
function loadSavedState() {
  if (localStorage.getItem("leaksEnabled") == "true") leaksToggle.checked = true;
  if (localStorage.getItem("spoilersEnabled") == "true") spoilersToggle.checked = true;
  versionNum = parseInt(localStorage.getItem("lastDAVersion") || `${vLive}`);
  chartScoreNum = localStorage.getItem("lastDAChartScore") || "60k";
  chartDisplayType = localStorage.getItem("lastDAChartType") || "Trial";
  chartDropdown.value = chartDisplayType;
  currNumberFormat = localStorage.getItem("numberFormat") || "period";
  if (!leaksToggle.checked) versionNum = Math.min(versionNum, vLive);
  saveProgress();
}

// save current page/settings
function saveProgress() {
  localStorage.setItem("lastDAVersion", versionNum);
  localStorage.setItem("lastDAChartScore", chartScoreNum);
  localStorage.setItem("lastDAChartType", chartDisplayType);
  localStorage.setItem("numberFormat", currNumberFormat);
  localStorage.setItem("leaksEnabled", leaksToggle.checked);
  localStorage.setItem("spoilersEnabled", spoilersToggle.checked);
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
  if (e.key == "Escape") { e.preventDefault(); versionSelectorIsOpen ? toggleVersionSelector() : chartIsOpen ? toggleChart() : calcIsOpen ? toggleCalc() : toggleMenu(); }
  else if (e.key == "`" && !menuIsOpen && !versionSelectorIsOpen && !calcIsOpen) { e.preventDefault(); toggleChart(); }
  else if (e.key == "Tab" && !menuIsOpen && !versionSelectorIsOpen && !chartIsOpen) { e.preventDefault(); toggleCalc(); }
  else if (e.key == "Enter" && !menuIsOpen && !versionSelectorIsOpen && !chartIsOpen && !calcIsOpen) { e.preventDefault(); jumpToTop(); }
  else if (e.key == " " && !menuIsOpen && !chartIsOpen && !calcIsOpen) { e.preventDefault(); toggleVersionSelector(); }
  else if (e.key == "ArrowLeft" && !menuIsOpen && !versionSelectorIsOpen && !chartIsOpen && !calcIsOpen) { e.preventDefault(); changeVersion(-1); }
  else if (e.key == "ArrowRight" && !menuIsOpen && !versionSelectorIsOpen && !chartIsOpen && !calcIsOpen) { e.preventDefault(); changeVersion(1); }
  else if (e.key == "ArrowUp") { e.preventDefault(); }
  else if (e.key == "ArrowDown") { e.preventDefault(); }
});

/* ------------------------------------------------------------------------ MENU BAR ----------------------------------------------------------------------- */

// display/hide menu bar
function toggleMenu() {
  menuIsOpen = !menuIsOpen;
  let menuBar = document.getElementById("mb");
  let menuBarOverlay = document.getElementById("mb-o");
  document.body.style.overflow = menuIsOpen ? "hidden" : "auto";
  menuBar.style.display = menuBarOverlay.style.display = menuIsOpen ? "flex" : "none";
}

// display number format & example: 2222222 2,222,222 2.222.222
function showNumberFormat(num) {
  if (currNumberFormat == "comma") return num.toLocaleString("en-US");
  if (currNumberFormat == "period") return num.toLocaleString("de-DE");
  return num;
}
function changeNumberFormat(e) {
  if (e) currNumberFormat = e.dataset.format;
  let ex = document.getElementById("mb-ex-num");
  let numFormatButtons = document.querySelectorAll(".nfb");
  ex.innerHTML = showNumberFormat(2222222);
  numFormatButtons.forEach(btn => btn.classList.toggle("selected", btn.dataset.format == currNumberFormat));
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
  let versionSelectorOverlay = document.getElementById("vs-o");
  document.body.style.overflow = versionSelectorIsOpen ? "hidden" : "auto";
  versionSelector.style.display = versionSelectorOverlay.style.display = versionSelectorIsOpen ? "flex" : "none";
  if (versionSelectorIsOpen) showVersionSelector();
}

// display version selector
function showVersionSelector() {
  let gridContent = document.getElementById("vg");
  gridContent.innerHTML = ``;

  // display allowed versions
  for (let v = 1; v <= (leaksToggle.checked ? versionIDs.length : vLive); ++v) {
    let currVersion = versionData[versionIDs[v - 1]];

    // display version selection button
    let versionButton = document.createElement("div");
    let nameDiv = document.createElement("div");
    let timeDiv = document.createElement("div");
    let idDiv = document.createElement("div");
    versionButton.className = "vg-c";
    nameDiv.className = "vg-c-name";
    timeDiv.className = "vg-c-time";
    idDiv.className = "vg-c-id";
    nameDiv.innerHTML = currVersion.versionName + (v == vLive ? `<span style="color:#ff0000;font-weight:bold;"> (LIVE)</span>` : v >= vBeta ? `<span style="color:#52a9f7;font-weight:bold;"> (BETA)</span>` : ``);
    timeDiv.innerHTML = currVersion.versionTime;
    idDiv.innerHTML = `ID: 69${v.toString().padStart(3, `0`)}${v >= vBeta ? `1` : ``}`;
    versionButton.appendChild(nameDiv);
    versionButton.appendChild(timeDiv);
    versionButton.appendChild(idDiv);
    gridContent.appendChild(versionButton);

    // go to version on click
    versionButton.onclick = () => {
      versionNum = v;
      toggleVersionSelector();
      showVersion();
    };
  }
}

/* -------------------------------------------------------------------------- CALCULATOR -------------------------------------------------------------------- */

// display/hide calculator
function toggleCalc() {
  calcIsOpen = !calcIsOpen;
  let calc = document.getElementById("cc");
  let calcOverlay = document.getElementById("cc-o");
  document.body.style.overflow = calcIsOpen ? "hidden" : "auto";
  calc.style.display = calcOverlay.style.display = calcIsOpen ? "flex" : "none";
  showHPCalc();
}
function showHPCalc() {
  // build boss dropdown
  let enemyIDs = Object.keys(enemyData);
  let select = document.getElementById("cc-b-dd");
  select.innerHTML = ``;
  for (let i = 0; i < enemyIDs.length; ++i) {
    if (calcDropdown.value == "Trial" ? (enemyIDs[i][2] == "3" && enemyIDs[i] != "10301" && enemyIDs[i] != "10302" && enemyIDs[i] != "10303" && enemyIDs[i] != "16300") : (enemyIDs[i][2] == "4" && enemyIDs[i] != "30400")) {
      let option = document.createElement("option");
      option.text = (spoilersToggle.checked || !enemyData[enemyIDs[i]].tags.includes("spoiler")) ? enemyData[enemyIDs[i]].name : "SPOILER BOSS";
      option.value = enemyIDs[i];
      select.appendChild(option);
    }
  }
  changeBoss();
}

// display specific boss
function changeBoss() {
  let calcBossDropdownResize = document.getElementById("cc-b-dd-resize");

  // display specific boss image
  let calcBossImg = document.getElementById("cc-b-img");
  calcBossImg.src = (spoilersToggle.checked || !enemyData[calcBossDropdown.value].tags.includes("spoiler")) ? `../../assets/zzz/enemies/${enemyData[calcBossDropdown.value].image}.webp` : `../../assets/zzz/enemies/doppelganger-i.webp`;;

  // resize boss dropdown based on name length (to look nicer)
  calcBossDropdown.selectedIndex = Math.max(calcBossDropdown.selectedIndex, 0);
  calcBossDropdownResize.textContent = calcBossDropdown.options[calcBossDropdown.selectedIndex].text;
  calcBossDropdown.style.width = calcBossDropdownResize.offsetWidth + 30 + "px";

  // build boss versions dropdowns
  calcVerDropdown1.innerHTML = ``, calcVerDropdown2.innerHTML = ``;
  for (let v = 0; v < hpDataSpecific[calcBossDropdown.value].length; ++v) {
    let option1 = document.createElement("option"), option2 = document.createElement("option");
    let versionHP = hpDataSpecific[calcBossDropdown.value][v][0];
    option1.text = option1.value = option2.text = option2.value = `${versionHP[0]}.${versionHP[2]} Phase ${versionHP[4]}`;
    calcVerDropdown1.appendChild(option1);
    calcVerDropdown2.appendChild(option2);
  }

  // display boss first version
  currCalcBossID = calcBossDropdown.value;
  currCalcData1 = hpDataSpecific[currCalcBossID][calcVerDropdown1.selectedIndex];
  currCalcData2 = hpDataSpecific[currCalcBossID][calcVerDropdown2.selectedIndex];
  currCalcVersion1 = currCalcData1[0];
  currCalcVersion2 = currCalcData2[0];
  currCalcMaxHP1 = currCalcData1[1];
  currCalcMaxHP2 = currCalcData2[1];

  // display max hp/score
  calcHP1.value = currCalcMaxHP1;
  calcHP2.value = currCalcMaxHP2;
  calcScore1.value = calcScore2.value = 60000;
  calculateBoss(currCalcMaxHP1, 60000, 1);
  calculateBoss(currCalcMaxHP2, 60000, 2);
}

// display new specific boss/version
calcBossDropdown.addEventListener("change", () => { changeBoss(); });
calcVerDropdown1.addEventListener("change", () => {
  currCalcData1 = hpDataSpecific[currCalcBossID][calcVerDropdown1.selectedIndex];
  currCalcVersion1 = currCalcData1[0];
  currCalcMaxHP1 = currCalcData1[1];
  calculateBoss(currCalcMaxHP1, 60000, 1);
});
calcVerDropdown2.addEventListener("change", () => {
  currCalcData2 = hpDataSpecific[currCalcBossID][calcVerDropdown2.selectedIndex];
  currCalcVersion2 = currCalcData2[0];
  currCalcMaxHP2 = currCalcData2[1];
  calculateBoss(currCalcMaxHP2, 60000, 2);
});

// display specific boss version hp/score
calcHP1.addEventListener("change", () => { calculateBoss(parseInt(calcHP1.value.replaceAll(".", "").replaceAll(",", "")), 60000, 1); });
calcHP2.addEventListener("change", () => { calculateBoss(parseInt(calcHP2.value.replaceAll(".", "").replaceAll(",", "")), 60000, 2); });
calcScore1.addEventListener("change", () => { calculateBoss(currCalcMaxHP1, parseInt(calcScore1.value), 1); });
calcScore2.addEventListener("change", () => { calculateBoss(currCalcMaxHP2, parseInt(calcScore2.value), 2); });

// calculate specific boss version hp/score
function calculateBoss(hp, score, option) {
  let finalHP = option == 1 ? currCalcMaxHP1 : currCalcMaxHP2, finalScore = 60000;
  let bossHP = option == 1 ? calcHP1 : calcHP2;
  let bossScore = option == 1 ? calcScore1 : calcScore2;
  let bossData = option == 1 ? currCalcData1 : currCalcData2;

  if (!Number.isInteger(hp) || !Number.isInteger(score)) { bossHP.value = ""; bossScore.value = ""; return; }

  // constrains hp/score within 0-maxHP/0-60000
  if (hp < 0) hp = 0;
  else if (option == 1 && hp > currCalcMaxHP1) hp = currCalcMaxHP1;
  else if (option == 2 && hp > currCalcMaxHP2) hp = currCalcMaxHP2;
  if (score < 0) score = 0;
  else if (score > 60000) score = 60000;

  let bossValues = Array.from({length: 8}, () => Array.from({length: 3}).fill(null));
  bossValues = calcDropdown.value == "Trial" ? [[0, 0, 0], [1200, 4, 4000], [1700, 4, 4800], [2200, 4, 7200], [2500, 4, 9600], [3000, 4, 10400], [5000, 3, 7800], [5000, 6, 16200]] : [[0, 0, 0], [3600, 4, 3000], [3600, 4, 4000], [3600, 2, 3000], [6000, 4, 14000], [8000, 1, 3500], [10000, 7, 24500], [10000, 2, 8000]];

  // calculate hp/score to the floored threshold
  let calcHP = 0, calcScore = 0, threshold;
  let hpToNextThreshold, scoreToNextThreshold;
  for (threshold = 0; threshold < bossValues.length; ++threshold) {
    hpToNextThreshold = bossValues[threshold][0] * bossValues[threshold][1] * bossData[1] / (calcDropdown.value == "Trial" ? 874 : 1580) / 100;
    scoreToNextThreshold = bossValues[threshold][2];
    if (calcHP + hpToNextThreshold > hp + 1) break;
    if (calcScore + scoreToNextThreshold > score) break;
    calcHP += hpToNextThreshold;
    calcScore += scoreToNextThreshold;
  }

  // add remaining needed hp/score
  if (threshold < bossValues.length) {
    finalHP = calcHP + (score - calcScore) / scoreToNextThreshold * hpToNextThreshold;
    finalScore = calcScore + (hp - calcHP) / hpToNextThreshold * bossValues[threshold][2];
  }

  // display hp/score
  bossHP.value = showNumberFormat(score != 60000 ? Math.floor(finalHP) : hp);
  bossScore.value = score != 60000 ? score : Math.floor(finalScore);
}

/* ----------------------------------------------------------------------------- CHART ----------------------------------------------------------------------- */

// display/hide chart
function toggleChart() {
  chartIsOpen = !chartIsOpen;
  let chart = document.getElementById("c");
  document.body.style.overflow = chartIsOpen ? "hidden" : "auto";
  chart.style.display = chartIsOpen ? "flex" : "none";
  if (chartIsOpen) showHPChart();
}
function changeChartPoints(n) {
  if (chartScoreNum == n) return;
  chartScoreNum = n;
  saveProgress();
  showHPChart();
}

// download chart
function downloadChart() {
  let downloadButton = document.createElement("a");
  downloadButton.href = hpChart.toBase64Image("image/png", 1.0);
  downloadButton.download = `Deadly Assault HP - ${chartScoreNum == "60k" ? chartScoreNum : document.querySelector(".c-k").innerHTML} Score - ${chartDisplayType}`;
  downloadButton.click();
}

// build chart hp dataset
function generateHPDataset(label, data, color) {
  return { label, data, pointRadius: 2, borderWidth: 2, borderColor: color, pointHoverRadius: 4, pointHoverBorderWidth: 2, pointHoverBorderColor: color, backgroundColor: "#ffffff" };
}

// display chart
function showHPChart() {
  // change chart
  chartDisplayType = chartDropdown.value;
  document.querySelector(".c-k").innerHTML = chartDisplayType == "Adversity" ? "30k" : "20k";

  // change color of selected score value
  let chartScoreButtons = document.querySelectorAll(".c-k");
  chartScoreButtons.forEach(btn => btn.classList.toggle("selected", btn.dataset.format == chartScoreNum));

  // various plugins thanks to Chart.js documentation + videos + Stack Overflow
  // hover dotted line
  const verticalHoverLine = {
    id: "verticalHoverLine",
    beforeDatasetsDraw(chart, args, plugins) {
      let { ctx, chartArea: {top, bottom, height} } = chart;
      ctx.save();
      for (let hp = 0; hp <= 2; ++hp)
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
  // legend padding
  const legendPadding = {
    id: "legendPadding",
    beforeInit(chart) {
      let newLegend = chart.legend.fit;
      chart.legend.fit = function fit() { newLegend.bind(chart.legend)(); chart.legend.height += 15; }
    }
  };
  // hide info outside of chart
  const hideTooltipOutside = {
    id: "hideTooltipOutside",
    afterEvent(chart, args) {
      let {top, bottom, left, right} = chart.chartArea;
      let {x, y} = args.event;
      if (x < left || x > right || y < top || y > bottom) {
        chart.tooltip.setActiveElements([]);
        chart.tooltip.update();
        chart.setActiveElements([]);
        chart.update();
      }
    }
  };

  // hover tooltip
  Chart.Tooltip.positioners.cursor = function(elements, eventPosition) {
    if (!eventPosition) return false;
    let {top, bottom} = this.chart.chartArea;
    let {x, y} = eventPosition;
    y += y <= (top + bottom) / 3 ? 50 : -50;
    return {x, y};
  };

  // display new chart
  if (!hpChart) {
    hpChart = new Chart("hpChart", {
      // import plugins
      type: "line", plugins: [verticalHoverLine, legendPadding, hideTooltipOutside],

      // chart settings
      options: {
        // fit & position chart, detect cursor, disable animations
        animation: false, responsive: true, maintainAspectRatio: false,
        interaction: { mode: "nearest", axis: "x", intersect: false },
        layout: { padding: {top: 10, bottom: 15, left: 10, right: 25} },

        // format x & y axis
        scales: {
          x: {
            offset: true,
            border: { display: false },
            grid: { color: "transparent" },
            ticks: {
              padding: 10, font: { family: "Inconsolata", size: 12 }, color: "#888888", maxRotation: 0,
              callback: function(value, index) { return index % 4 == 0 ? this.getLabelForValue(value) : ""; }
            }
          },
          y: {
            border: { display: false },
            grid: { color: function(context) { return context.index % 2 == 0 ? "#888888" : "#444444"; } },
            ticks: {
              padding: 15, font: { family: "Inconsolata", size: 12 }, color: "#888888",
              callback: function(value, index) { return index % 2 == 0 ? showNumberFormat(value) : ""; }
            }
          }
        },

        // format title, legend, tooltip
        plugins: {
          title: { display: true, color: "#ffffff", font: { family: "Inconsolata", size: 20, weight: "bold" } },
          legend: {
            labels: { usePointStyle: true, boxHeight: 8,
              font: { family: "Inconsolata", size: 14 },
              // grayscale disabled legend element
              generateLabels: function(chart) {
                let hpLegend = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                hpLegend.forEach((label, index) => {
                  if (!chart.isDatasetVisible(index)) { label.fontColor = "#888888"; label.strokeStyle = "#888888"; }
                  else label.fontColor = chart.data.datasets[label.datasetIndex].borderColor;
                });
                return hpLegend;
              },
            }
          },
          tooltip: { usePointStyle: true, boxHeight: 8, position: "cursor", caretSize: 0,
            titleFont: { family: "Inconsolata", size: 12, weight: "bold", lineHeight: 0.75 },
            bodyFont: { family: "Inconsolata", size: 12 },
            callbacks: {
              // format tooltip text
              labelTextColor: function(context) { return context.dataset.borderColor; },
              label: function(context) { return context.dataset.label + ": " + showNumberFormat(context.parsed.y); }
            }
          }
        }
      }
    });
  }

  // global chart settings
  let newHPData;
  if (chartDisplayType == "Trial") newHPData = hpData.slice(0, 4);
  else newHPData = hpData.slice(4, 8).map(row => row.slice(vAdv - 1, versionIDs.length));

  hpChart.data.labels = versionIDs.slice(chartDisplayType == "Trial" ? 0 : vAdv - 1, versionIDs.length);
  hpChart.data.datasets = [
    generateHPDataset(`Raw HP`, chartScoreNum != "60k" ? newHPData[0] : newHPData[1], "#ff5555"),
    generateHPDataset(`Alt HP`, chartScoreNum != "60k" ? newHPData[2] : newHPData[3], "#f6b26b")
  ];
  hpChart.options.plugins.title.text = `Deadly Assault HP - ${chartScoreNum == "60k" ? chartScoreNum : document.querySelector(".c-k").innerHTML} Score - ${chartDisplayType}`;
  hpChart.options.scales.y.min = chartScoreNum != "60k" ? 40000000 : 160000000;
  hpChart.options.scales.y.max = chartScoreNum != "60k" ? 600000000 : 1000000000;
  hpChart.options.scales.y.ticks.stepSize = (hpChart.options.scales.y.max - hpChart.options.scales.y.min) / 14;
  hpChart.update();
  saveProgress();
}

/* ----------------------------------------------------------------------------- MAIN ----------------------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", async () => { await loadPage(); });