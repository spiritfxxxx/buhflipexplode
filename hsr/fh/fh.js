/* ------------------------------------------------------------------------ MAIN PAGE ----------------------------------------------------------------------- */

let vLive = 43, vBeta = 44, v13 = 10, v15 = 16, v16 = 18, v20 = 20, v43 = 42, modeNumOld = 3, modeNum = 3;
let leaksToggle = document.getElementById("lks");
let spoilersToggle = document.getElementById("spl");
let versionNumOld, versionNum, nodeNum, chartNodeNum, currNumberFormat;
let menuIsOpen = versionSelectorIsOpen = chartIsOpen = false;

let versionData, enemyData, buffData, hpChart;
let versionBuffIDs, versionEnemies;
let versionIDs = [], versionNames = [], hpData = [];

let nodeLvlData = [];
let nodeLvlDataCitadel = [32, 36, 39, 42, 44, 45, 47, 50, 52, 54, 55, 57, 60, 63, 65];
let nodeLvlDataAstrigera = [50, 60, 70, 80, 85, 90];
let nodeLvlDataChaos = [68, 70, 73, 75, 78, 80, 82, 85, 88, 90, 92, 95];

// list of numbers thanks to HomDGCat's database
let nodeHPMultEasy = [74.4000000692904, 97.65000000433065, 102.3000000086613, 126.71417406038381, 132.874866069993, 139.1457630742807, 145.52714407537133, 152.0191950746812, 158.62238107575104, 165.33670207858086, 176.93863814114593, 188.5405739871785, 200.14251004974358, 211.74435304664075, 223.34628910920583, 234.9482250418514, 246.55016110441647, 258.15200410131365, 269.7539401638787, 281.3558760099113, 301.97658001841046, 322.59728409186937, 343.21798810036853, 363.8386921088677, 384.4593960957136, 405.08019303996116, 425.7008970484603, 446.3216010569595, 466.94230510876514, 487.56300905230455, 527.3853301119525, 567.2075579543598, 607.0298790140077, 646.8522000736557, 686.6745211116504, 726.4968421712983, 766.3190700786654, 806.1413910733536, 845.9637120463885, 885.7860331060365, 1003.110462059034, 1120.4349840560462, 1237.759506009752, 1355.0839351576287, 1472.4084571113344, 1589.7329790433869, 1707.0574080613442, 1824.3819300150499, 1941.706452098675, 2059.0308810300194, 2343.4623600086197, 2627.89383905218, 2912.32531803078, 3196.7567970743403, 3481.1882760529406, 3765.6197550965007, 4050.051234075101, 4334.482713053701, 4618.914192097262, 4903.345671075862, 5296.391757140402, 5689.437843053369, 6082.483929052949, 6475.530015052529, 6868.576101117069, 7261.622187094996, 7654.668273029616, 8047.714359094156, 8440.760445158696, 8833.806531093316, 9326.928336032666, 9820.050234124297, 10313.172132086009, 10806.294030026067, 11299.41583505203, 11792.537733143661, 12285.65963108372, 12778.781529045431, 13271.903427072102, 13765.025232011452, 14460.33117604279, 15181.363431091653, 15929.073852087138, 16704.449634075863, 17508.514242099132, 18342.32927101222, 19206.99546907679, 20103.65431799856, 21033.489522042917, 21997.728588072583, 22997.64459301578, 24034.55748600606, 25109.836041072384, 26224.899996090448, 27381.22126209503];
let nodeHPMultHard = [74.4000000692904, 97.65000000433065, 102.3000000086613, 126.71417406038381, 132.874866069993, 139.1457630742807, 145.52714407537133, 152.0191950746812, 158.62238107575104, 165.33670207858086, 176.93863814114593, 188.5405739871785, 200.14251004974358, 211.74435304664075, 223.34628910920583, 234.9482250418514, 246.55016110441647, 258.15200410131365, 269.7539401638787, 281.3558760099113, 301.97658001841046, 322.59728409186937, 343.21798810036853, 363.8386921088677, 384.4593960957136, 405.08019303996116, 425.7008970484603, 446.3216010569595, 466.94230510876514, 487.56300905230455, 527.3853301119525, 567.2075579543598, 607.0298790140077, 646.8522000736557, 686.6745211116504, 726.4968421712983, 766.3190700786654, 806.1413910733536, 845.9637120463885, 885.7860331060365, 1003.110462059034, 1120.4349840560462, 1237.759506009752, 1355.0839351576287, 1472.4084571113344, 1589.7329790433869, 1707.0574080613442, 1824.3819300150499, 1941.706452098675, 2059.0308810300194, 2343.4623600086197, 2627.89383905218, 2912.32531803078, 3196.7567970743403, 3481.1882760529406, 3765.6197550965007, 4050.051234075101, 4334.482713053701, 4618.914192097262, 4903.345671075862, 5296.391757140402, 5689.437843053369, 6082.483929052949, 6475.530015052529, 6868.576101117069, 7261.622187094996, 7654.668273029616, 8047.714359094156, 8440.760445158696, 8833.806531093316, 9533.403774039354, 10233.001017050352, 10932.598260083003, 11632.195503029041, 12331.792746061692, 13031.38998907269, 13730.98732504109, 14430.584568052087, 15130.181811084738, 15829.779054095736, 16714.268016069196, 17642.981361080892, 18618.13044307963, 19642.037007096922, 20717.13886211696, 21845.99583312194, 23031.29562005005, 24275.860401083948, 25582.653342072386, 26954.786037063226, 28395.525390009396, 29908.30161308963, 31496.716689101653, 33164.55255606584, 34915.78012807737];
let nodeSPDMult = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.32, 1.32, 1.32, 1.32, 1.32, 1.32, 1.32, 1.32, 1.32, 1.32];

let elementsData = ["physical", "fire", "ice", "lightning", "wind", "quantum", "imaginary"];

// build & display main page
async function loadPage() {
  versionData = await (await fetch("fh-versions.json")).json();
  enemyData = await (await fetch("../../assets/hsr/enemies.json")).json();
  buffData = await (await fetch("../../assets/hsr/buffs.json")).json();
  for (let m = 1; m <= 3; ++m) versionIDs.push(Object.keys(versionData[m - 1].versions));
  loadHPData();
  loadSavedState();
  showVersion();
  changeNumberFormat();
}

// build hp database
function loadHPData() {
  hpData = [Array.from({length: 15}, () => Array.from({length: 2}, () => Array.from({length: 1}).fill(null))),
            Array.from({length: 6}, () => Array.from({length: 2}, () => Array.from({length: 1}).fill(null))),
            Array.from({length: 13}, () => Array.from({length: 2}, () => Array.from({length: versionIDs[2].length}).fill(null))) ];
  for (let m = 1; m <= hpData.length; ++m) {
    for (let v = 1; v <= versionIDs[m - 1].length; ++v) {
      nodeLvlData = m == 1 ? nodeLvlDataCitadel : m == 2 ? nodeLvlDataAstrigera : nodeLvlDataChaos;
      versionEnemies = versionData[m - 1].versions[versionIDs[m - 1][v - 1]].versionEnemies;
      if (m == 3) versionNames.push(`${versionData[m - 1].versions[versionIDs[m - 1][v - 1]].versionName} (${versionIDs[m - 1][v - 1]})`);
      for (let n = 1; n <= versionEnemies.nodes.length; ++n) {
        let currNode = versionEnemies.nodes[n - 1];
        let rawHP = aoeHP = 0;
        let rawHPStar = aoeHPStar = 0;

        // build enemy hp database
        for (let s = 1; s <= currNode.sides.length; ++s) {
          let currSide = currNode.sides[s - 1];
          if (!currSide) continue;
          let sideHPMult = currSide.sideHPMult;
          for (let w = 1; w <= currSide.waves.length; ++w) {
            let maxHP = 0;
            let currWave = currSide.waves[w - 1];
            for (let e = 1; e <= currWave.enemies.length; ++e) {
              let currEnemy = currWave.enemies[e - 1];
              let currEnemyID = currEnemy.id;
              let currEnemyPhase = currEnemy.phase ? currEnemy.phase : 1;
              let currEnemyHPMult = currEnemy.hpMult ? currEnemy.hpMult : sideHPMult;
              let currEnemyData = enemyData[currEnemyID];
              let eTags = currEnemyData.tags;
              let eHP = currEnemyData.baseHP * (m == 2 || (m == 3 && v < v15) ? nodeHPMultEasy : nodeHPMultHard)[nodeLvlData[n - 1] - 1 + (m == 3 && v < v20 && n == 7)] * currEnemyPhase * currEnemyHPMult / 100;

              if (v >= v43 && n == 12 && s == 3) rawHPStar += eHP;
              else rawHP += eHP;
              let shareHP = eTags.find(tag => /^share\d+$/.test(tag));
              maxHP = Math.max(maxHP, eHP / (shareHP ? shareHP.slice(5) : 1));
            }
            if (v >= v43 && n == 12 && s == 3) aoeHPStar += maxHP;
            else aoeHP += maxHP;
          }
        }
        hpData[m - 1][n - 1][0][v - 1] = Math.round(rawHP);
        hpData[m - 1][n - 1][1][v - 1] = Math.round(aoeHP);
        if (v >= v43 && n == 12) { hpData[m - 1][n][0][v - 1] = Math.round(rawHPStar); hpData[m - 1][n][1][v - 1] = Math.round(aoeHPStar); }
      }
    }
  }
}

// display version/time/id
function showVersion() {
  let currVersion = versionData[modeNum - 1].versions[versionIDs[modeNum - 1][versionNum - 1]];
  versionBuffIDs = currVersion.versionBuffIDs;
  versionEnemies = currVersion.versionEnemies;
  document.getElementById("v-l").style.display = document.getElementById("v-r").style.display = modeNum == 3 ? "flex" : "none";
  document.getElementById("v-name").innerHTML = currVersion.versionName + ((modeNum == 3 && versionNum == vLive) ? `<span style="color:#ff0000;font-weight:bold;"> (LIVE)</span>` : (modeNum == 3 && versionNum >= vBeta) ? `<span style="color:#52a9f7;font-weight:bold;"> (BETA)</span>` : ``);
  document.getElementById("v-time").innerHTML = currVersion.versionTime;
  document.getElementById("v-id").innerHTML = (modeNum == 3 ? `Version: ${versionIDs[modeNum - 1][versionNum - 1].slice(0, 3)} Phase ${versionIDs[modeNum - 1][versionNum - 1].slice(4)} - ` : ``) + `ID: ${modeNum == 1 ? `100` : modeNum == 2 ? `900` : `1${versionNum < v13 ? `1${(versionNum + 6) % 10}` : `${(versionNum - 9).toString().padStart(3, `0`)}`}`}`;
  showNode();
}
function changeVersion(n) {
  if (modeNum != 3) return;
  let maxVersion = leaksToggle.checked ? versionIDs[modeNum - 1].length : vLive;
  versionNum = (versionNum - 1 + n + maxVersion) % maxVersion + 1;
  showVersion();
}

// display node
function showNode() {
  if (modeNumOld != modeNum) {
    nodeNum = modeNum == 3 ? parseInt(localStorage.getItem("lastFHNode")) : versionEnemies.nodes.length;
    modeNumOld = modeNum;
  }
  if (modeNum == 3) changePrePostNode();
  nodeLvlData = modeNum == 1 ? nodeLvlDataCitadel : modeNum == 2 ? nodeLvlDataAstrigera : nodeLvlDataChaos;
  document.getElementById("n-text").innerHTML = nodeNum;
  showBuffs();
  showEnemies();
}
function changeNode(n) { nodeNum = (nodeNum - 1 + n + versionEnemies.nodes.length) % versionEnemies.nodes.length + 1; showNode(); }
function changePrePostNode() {
  if (versionNumOld < v16 && versionNum >= v16 && nodeNum == 10) nodeNum = 12;
  else if (versionNumOld >= v16 && versionNum < v16) nodeNum = Math.min(nodeNum, 10);
  versionNumOld = versionNum;
}

// display chart node
function changeChartNode(n) {
  if (modeNum != 3) return;
  chartNodeNum = (chartNodeNum - 1 + n + 12) % 12 + 1;
  showHPChart();
}

// display buffs
function showBuffs() { document.getElementById("b-desc").innerHTML = buffData[versionBuffIDs[(modeNum != 3 ? nodeNum : 1) - 1]]; }

// display enemies
function showEnemies() {
  let currNode = versionEnemies.nodes[nodeNum - 1];

  // display sides
  let side1 = document.getElementById("s1"), side2 = document.getElementById("s2"), side3 = document.getElementById("s3");
  side1.innerHTML = side2.innerHTML = side3.innerHTML = ``;
  document.getElementById("s3").style.display = !(versionNum >= v43 && nodeNum == 12) ? "none" : "flex";

  // loop sides
  for (let s = 1; s <= currNode.sides.length; ++s) {
    let side = s == 1 ? side1 : s == 2 ? side2 : side3;
    let currSide = currNode.sides[s - 1];

    // display side title
    let sideHeader = document.createElement("div");
    sideHeader.className = "s-header";
    sideHeader.innerHTML = `${nodeNum}-${s} Lv${nodeLvlData[nodeNum - 1] + (modeNum == 3 && versionNum < v20 && nodeNum == 7)}`;

    // display side HP multiplier
    let hpMult = document.createElement("div");
    hpMult.className = "s-hp-atk-mult";
    hpMult.innerHTML = `HP: <span style="color:#ff5555;">N/A</span>`;
    sideHeader.appendChild(hpMult);

    // display side weaknesses/resistances
    let combW = document.createElement("div");
    combW.className = "wk";
    generateW(currSide != null ? currNode.sides[s - 1].sideElementMult : [1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2], combW);
    sideHeader.appendChild(combW);
    side.appendChild(sideHeader);

    if (!currSide) continue;
    let sideHPMult = currSide.sideHPMult;
    hpMult.innerHTML = `HP: <span style="color:#ff5555;">${sideHPMult}%</span>`;

    // loop waves
    for (let w = 1; w <= currSide.waves.length; ++w) {
      let wave = document.createElement("div");
      wave.className = "w";

      // display wave title
      let waveHeader = document.createElement("div");
      waveHeader.className = "w-num";
      waveHeader.innerHTML = `WAVE ${w}`;
      wave.appendChild(waveHeader);

      // display wave
      let currWave = currSide.waves[w - 1];
      let waveEnemies = document.createElement("div");
      waveEnemies.className = "w-e";

      // loop enemies
      for (let e = 1; e <= currWave.enemies.length; ++e) {
        let currEnemy = currWave.enemies[e - 1];
        let currEnemyID = currEnemy.id;
        let currEnemyPhase = currEnemy.phase ? currEnemy.phase : 1;
        let currEnemyHPMult = currEnemy.hpMult ? currEnemy.hpMult : sideHPMult;
        let currEnemyData = enemyData[currEnemyID];

        // define enemy parameters
        let eTags = currEnemyData.tags;
        let eMods = currEnemyData.mods;
        let showEnemySpoilers = spoilersToggle.checked || !eTags.includes("spoiler");
        let eName = showEnemySpoilers ? currEnemyData.name : "SPOILER ENEMY";
        let eImg = showEnemySpoilers ? `../../assets/hsr/enemies/${currEnemyData.image}.webp` : `../../assets/hsr/enemies/spoiler.webp`;

        // define enemy stats
        let eHP = Math.round(currEnemyData.baseHP * (modeNum == 2 || (modeNum == 3 && versionNum < v15) ? nodeHPMultEasy : nodeHPMultHard)[nodeLvlData[nodeNum - 1] - 1 + (modeNum == 3 && versionNum < v20 && nodeNum == 7)] * currEnemyHPMult / 100);
        let eSPD = Math.round(currEnemyData.baseSPD * nodeSPDMult[nodeLvlData[nodeNum - 1] - 1 + (modeNum == 3 && versionNum < v20 && nodeNum == 7)]);
        let eToughness = currEnemyData.toughness;
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

        // display enemy weaknesses/toughness
        let enemyW = document.createElement("div");
        let enemyT = document.createElement("div");
        enemyW.className = "wk";
        enemyT.className = "e-tough";
        generateW(eElementMult, enemyW);
        enemyT.innerHTML = eToughness;
        enemyW.appendChild(enemyT);
        enemy.appendChild(enemyW);

        // display enemy hp
        let hp = document.createElement("div");
        let enemyHP = document.createElement("div");
        let enemyPhase = document.createElement("div");
        hp.className = "hp";
        enemyHP.className = "e-hp";
        enemyPhase.className = "e-phase";
        enemyHP.innerHTML = showNumberFormat(eHP);
        hp.appendChild(enemyHP);

        // display enemy hp phase multiplier
        if (currEnemyPhase > 1) {
          enemyPhase.innerHTML = `x${currEnemyPhase}`;
          hp.appendChild(enemyPhase);
        }

        // display enemy specific hp multiplier
        if (sideHPMult != currEnemyHPMult || (currEnemyID[5] && currEnemyData.baseHP != enemyData[Math.floor(currEnemyID)].baseHP)) {
          currEnemyHPMult *= currEnemyData.baseHP / enemyData[Math.floor(currEnemyID)].baseHP;
          let specificHPMult = document.createElement("div");
          specificHPMult.className = "e-hp-mult";
          specificHPMult.innerHTML = `[${Math.round(currEnemyHPMult)}%]`;
          hp.appendChild(specificHPMult);
        }
        enemy.appendChild(hp);

        // display enemy spd
        let enemySPD = document.createElement("div");
        enemySPD.className = "e-spd";
        enemySPD.innerHTML = eSPD;
        enemy.appendChild(enemySPD);

        // display enemy action advance/delay
        let advMod = eMods.find(mod => /^adv-?\d+$/.test(mod));
        if (advMod) {
          let enemyAdv = document.createElement("div");
          let advNum = advMod.slice(3);
          enemyAdv.className = "e-adv";
          enemyAdv.innerHTML = `${advNum > 0 ? "Advance" : "Delay"}: <span style="color:#5555ff">${Math.abs(advNum)}%</span>`;
          enemy.appendChild(enemyAdv);
        }

        // display enemy 40%+ resistances
        let enemyR = document.createElement("div");
        enemyR.className = "res-40plus";
        generateR(eElementMult, enemyR, currEnemyID, enemy);

        waveEnemies.appendChild(enemy);
      }
      wave.appendChild(waveEnemies);
      side.appendChild(wave);
    }
  }

  // display HP values
  document.getElementById("v-hp-raw").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][0][versionNum - 1]) + (versionNum >= v43 && nodeNum == 12 ? ` + ${showNumberFormat(hpData[modeNum - 1][12][0][versionNum - 1])}` : ``);
  document.getElementById("v-hp-aoe").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][1][versionNum - 1]) + (versionNum >= v43 && nodeNum == 12 ? ` + ${showNumberFormat(hpData[modeNum - 1][12][1][versionNum - 1])}` : ``);

  // save current page/settings
  if (modeNum == 3) saveLastPage();
  saveSettings();
}

/* -------------------------------------------------------------------- INFO GENERATOR -------------------------------------------------------------------- */

// display weaknesses
function generateW(mult, w) {
  for (let e = 0; e < elementsData.length; ++e) {
    if (mult[e] <= 1) {
      let weakImg = document.createElement("img");
      weakImg.className = "ele";
      weakImg.src = `../../assets/hsr/elements/${elementsData[e]}.webp`;
      w.appendChild(weakImg);
    }
  }
}

// display 40%+ resistances
function generateR(mult, r, id, e) {
  let hasRES = false;
  let bossRES = document.createElement("div");
  let resEle = document.createElement("div");
  bossRES.className = "e-res-title";
  resEle.className = "e-res-ele";
  bossRES.innerHTML = "Boss DMG RES";

  for (let e = 0; e < 7; ++e) {
    if (mult[e] > 1.2) {
      hasRES = true;
      let res = document.createElement("div");
      let resImg = document.createElement("img");
      let resMult = document.createElement("div");
      res.className = "e-res";
      resImg.className = "ele";
      resMult.className = "e-res-mult";
      resImg.src = `../../assets/hsr/elements/${elementsData[e]}.webp`;
      resMult.innerHTML = `${Math.round(mult[e] * 100) - 100}%`;
      res.appendChild(resImg);
      res.appendChild(resMult);
      resEle.appendChild(res);
    }
  }

  // display only for bosses
  if (id[2] >= "2" && hasRES) { r.appendChild(bossRES); r.appendChild(resEle); e.appendChild(r); }
}

/* ------------------------------------------------------------ MISCELLANEOUS + QOL + NAVIGATION ------------------------------------------------------------ */

// load last page/settings
// !!!!!!!!!!!!!!!!!! DEFAULT TO LATEST FH 12 !!!!!!!!!!!!!!!!!!
function loadSavedState() {
  if (localStorage.getItem("leaksEnabled") == "true") leaksToggle.checked = true;
  if (localStorage.getItem("spoilersEnabled") == "true") spoilersToggle.checked = true;
  versionNum = parseInt(localStorage.getItem("lastFHVersion") || `${vLive}`);
  versionNumOld = versionNum;
  nodeNum = parseInt(localStorage.getItem("lastFHNode") || "12");
  chartNodeNum = parseInt(localStorage.getItem("lastFHChartNode") || "12");
  currNumberFormat = localStorage.getItem("numberFormat") || "period";
  if (!leaksToggle.checked) versionNum = Math.min(versionNum, vLive);
  saveLastPage();
  saveSettings();
}

// save current page/settings
function saveLastPage() {
  localStorage.setItem("lastFHVersion", versionNum);
  localStorage.setItem("lastFHNode", nodeNum);
  localStorage.setItem("lastFHChartNode", chartNodeNum);
}
function saveSettings() {
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
  if (e.key == "Escape") { e.preventDefault(); versionSelectorIsOpen ? toggleVersionSelector() : chartIsOpen ? toggleChart() : toggleMenu(); }
  else if (e.key == "`" && !menuIsOpen && !versionSelectorIsOpen) { e.preventDefault(); toggleChart(); }
  else if (e.key == "Enter" && !menuIsOpen && !versionSelectorIsOpen && !chartIsOpen) { e.preventDefault(); jumpToTop(); }
  else if (e.key == " " && !menuIsOpen && !chartIsOpen) { e.preventDefault(); toggleVersionSelector(); }
  else if (e.key == "ArrowLeft" && !menuIsOpen && !versionSelectorIsOpen && !chartIsOpen) { e.preventDefault(); changeVersion(-1); }
  else if (e.key == "ArrowRight" && !menuIsOpen && !versionSelectorIsOpen && !chartIsOpen) { e.preventDefault(); changeVersion(1); }
  else if (e.key == "ArrowUp") { e.preventDefault(); chartIsOpen ? changeChartNode(1) : !menuIsOpen && !versionSelectorIsOpen ? changeNode(1) : null; }
  else if (e.key == "ArrowDown") { e.preventDefault(); chartIsOpen ? changeChartNode(-1) : !menuIsOpen && !versionSelectorIsOpen ? changeNode(-1) : null; }
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
  let row1 = document.getElementById("vg-misc");
  let title = document.getElementById("vg-title");
  let row2 = document.getElementById("vg-main");
  row1.innerHTML = ``;
  title.innerHTML = `Memory of Chaos`;
  row2.innerHTML = ``;

  // display allowed versions
  for (let m = 1; m <= 3; ++m) {
    for (let v = 1; v <= (m == 3 ? (leaksToggle.checked ? versionIDs[m - 1].length : vLive) : 1); ++v) {
      let currVersion = versionData[m - 1].versions[versionIDs[m - 1][v - 1]];

      // display version selection button
      let versionButton = document.createElement("div");
      let nameDiv = document.createElement("div");
      let timeDiv = document.createElement("div");
      let idDiv = document.createElement("div");
      versionButton.className = "vg-c";
      nameDiv.className = "vg-c-name";
      timeDiv.className = "vg-c-time";
      idDiv.className = "vg-c-id";
      nameDiv.innerHTML = currVersion.versionName + (m == 3 && v == vLive ? `<span style="color:#ff0000;font-weight:bold;"> (LIVE)</span>` : m == 3 && v >= vBeta ? `<span style="color:#52a9f7;font-weight:bold;"> (BETA)</span>` : ``);
      timeDiv.innerHTML = currVersion.versionTime;
      idDiv.innerHTML = (m == 3 ? `Version: ${versionIDs[m - 1][v - 1].slice(0, 3)} Phase ${versionIDs[m - 1][v - 1].slice(4)} - ` : ``) + `ID: ${m == 1 ? `100` : m == 2 ? `900` : `1${v < v13 ? `1${(v + 6) % 10}` : `${(v - 9).toString().padStart(3, `0`)}`}`}`;
      versionButton.appendChild(nameDiv);
      versionButton.appendChild(timeDiv);
      versionButton.appendChild(idDiv);
      m != 3 ? row1.appendChild(versionButton) : row2.appendChild(versionButton);

      // go to version on click
      versionButton.onclick = () => {
        modeNum = m;
        versionNum = modeNum == 3 ? v : 1;
        toggleVersionSelector();
        showVersion();
      };
    }
  }

  gridContent.appendChild(row1);
  gridContent.appendChild(title);
  gridContent.appendChild(row2);
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

// download chart
function downloadChart() {
  let downloadButton = document.createElement("a");
  downloadButton.href = hpChart.toBase64Image("image/png", 1.0);
  downloadButton.download = `Forgotten Hall HP - ${versionData[modeNum - 1].name} Node ` + (modeNum == 3 ? ` ${chartNodeNum}` : ``);
  downloadButton.click();
}

// build chart hp dataset
function generateHPDataset(label, data, color) {
  return { label, data, pointRadius: 2, borderWidth: 2, borderColor: color, pointHoverRadius: 4, pointHoverBorderWidth: 2, pointHoverBorderColor: color, backgroundColor: "#ffffff" };
}

// display chart
function showHPChart() {
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
              callback: function(value, index) { return index % 2 == 0 ? this.getLabelForValue(value) : ""; }
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
  let labels = [], rawHPData = [], aoeHPData = [], rawHPStarData = [], aoeHPStarData = [];
  if (modeNum != 3) {
    document.getElementById("c-l").style.display = document.getElementById("c-r").style.display = "none";
    labels = Array.from({length: versionEnemies.nodes.length}, (_, n) => `Node ${n + 1}`);
    for (let n = 0; n < versionEnemies.nodes.length; ++n) {
      rawHPData.push(hpData[modeNum - 1][n][0][0]);
      aoeHPData.push(hpData[modeNum - 1][n][1][0]);
    }
    hpChart.options.plugins.title.text = `Forgotten Hall HP - ${versionData[modeNum - 1].name}`;
    hpChart.options.scales.y.min = 0;
    hpChart.options.scales.y.max = modeNum == 1 ? 300000 : 3200000;
    hpChart.options.scales.y.ticks.stepSize = modeNum == 1 ? 25000 : 200000;
  }
  else {
    document.getElementById("c-l").style.display = document.getElementById("c-r").style.display = "flex";
    let startChartVersion = chartNodeNum <= 10 ? 0 : v16 - 1;
    let newHPData = hpData[modeNum - 1][chartNodeNum - 1].map(row => row.slice(startChartVersion, versionIDs[modeNum - 1].length));
    if (chartNodeNum == 12) {
      let starHPData = hpData[modeNum - 1][12].map(row => row.slice(startChartVersion, versionIDs[modeNum - 1].length));
      rawHPStarData = starHPData[0];
      aoeHPStarData = starHPData[1];
    }
    labels = versionNames.slice(startChartVersion, versionIDs[modeNum - 1].length);
    rawHPData = newHPData[0];
    aoeHPData = newHPData[1];
    hpChart.options.plugins.title.text = `Forgotten Hall HP - Memory of Chaos Node ${chartNodeNum}`;
    hpChart.options.scales.y.min = 0;
    hpChart.options.scales.y.max = 70000000;
    hpChart.options.scales.y.ticks.stepSize = 5000000;
  }

  // global chart settings
  hpChart.data.labels = labels;
  hpChart.data.datasets = [
    generateHPDataset("Raw HP", rawHPData, "#ff5555"),
    generateHPDataset("AOE HP", aoeHPData, "#6d9eeb")
  ].filter(Boolean);
  if (modeNum == 3 && chartNodeNum == 12) {
    hpChart.data.datasets.push(
      generateHPDataset("Raw 12-3 HP", rawHPStarData, "#ff5555"),
      generateHPDataset("AOE 12-3 HP", aoeHPStarData, "#6d9eeb")
    );
  }
  hpChart.update();
  if (modeNum == 3) saveLastPage();
  saveSettings();
}

/* ----------------------------------------------------------------------------- MAIN ----------------------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", async () => { await loadPage(); });