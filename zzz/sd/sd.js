/* ----------------------------------------------------------------------- MAIN PAGE ----------------------------------------------------------------------- */

let vLive = 59, vBeta = 60, vPost = 38, vWind = 47, modeNumOld = modeNum = 4;
let menuBarIsOpen = versionSelectorIsOpen = chartIsOpen = false;
let elementData = ["ice", "fire", "electric", "ether", "physical", "wind"];
let currNumberFormat, leaksToggle = document.getElementById("lks"), spoilersToggle = document.getElementById("spl");
let chartDropdown = document.getElementById("ch-dd");

let versionData, enemyData, buffData, versionIDs = [];
let hpData = [], hpChart;
let versionBuffIDs, versionBuffMain, versionDazeMult, versionAnomMult, versionEnemies;
let versionNumOld, versionNum, nodeNum, chartNodeNum, chartTypeOld, chartType;

let nodeLvl = [];
let nodeLvlStable = [25, 28, 30, 33, 35, 38, 40, 43, 45, 50];
let nodeLvlDisputed = [40, 43, 45, 48, 50, 53, 55, 60];
let nodeLvlAmbush = [50, 53, 55, 60, 65];
let nodeLvlCriticalPre = [50, 53, 55, 58, 60, 65, 70];
let nodeLvlCriticalPost = [50, 55, 60, 65, 70];

// full list of numbers thanks to Dimbreath's database
let coeffLvl = [50, 54, 58, 62, 66, 71, 76, 82, 88, 94, 100, 107, 114, 121, 129, 137, 145, 153, 162, 172, 181, 191, 201, 211, 222, 233, 245, 256, 268, 281, 293, 306, 319, 333, 347, 361, 375, 390, 405, 421, 436, 452, 469, 485, 502, 519, 537, 555, 573, 592, 610, 629, 649, 669, 689, 709, 730, 751, 772, 794, 794, 794, 794, 794, 794, 794, 794, 794, 794, 794];
let coeffHP = [100, 116, 135, 157, 181, 193, 206, 220, 235, 271, 291, 314, 338, 364, 419, 431, 444, 458, 472, 543, 618, 703, 801, 912, 1049, 1134, 1227, 1328, 1437, 1653, 1792, 1942, 2106, 2283, 2626, 2865, 3126, 3411, 3722, 4281, 4717, 5197, 5727, 6311, 7258, 7691, 8151, 8637, 9153, 10527, 11227, 11975, 12772, 13623, 15667, 15957, 16252, 16553, 16860, 19389, 19716, 20049, 20387, 20731, 21081, 21437, 21799, 22167, 22541, 24795];
let coeffDEF = [100, 108, 116, 124, 132, 142, 152, 164, 176, 188, 200, 214, 228, 242, 258, 274, 290, 306, 324, 344, 362, 382, 402, 422, 444, 466, 490, 512, 536, 562, 586, 612, 638, 666, 694, 722, 750, 780, 810, 842, 872, 904, 938, 970, 1004, 1038, 1074, 1110, 1146, 1184, 1220, 1258, 1298, 1338, 1378, 1418, 1460, 1502, 1544, 1588, 1588, 1588, 1588, 1588, 1588, 1588, 1588, 1588, 1588, 1588];
let coeffDaze = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 101, 102, 103, 104, 104, 105, 106, 107, 108, 110, 113, 115, 118, 120, 123, 125, 128, 130, 133, 137, 142, 146, 151, 155, 160, 164, 169, 173, 178, 180, 183, 186, 189, 192, 195, 197, 200, 203, 206, 209, 212, 215, 217, 220, 223, 226, 229, 232, 235];

// display main page
async function loadPage() {
  versionData = await (await fetch("sd-versions.json")).json();
  enemyData = await (await fetch("../../assets/zzz/enemies.json")).json();
  buffData = await (await fetch("../../assets/zzz/buffs.json")).json();
  for (let m = 1; m <= 4; ++m) versionIDs.push(Object.keys(versionData[m - 1].versions));
  loadHPData();
  loadSaveState();
  showVersion();
  changeNumberFormat();
}
window.addEventListener("DOMContentLoaded", () => { loadPage(); });

/* ----------------------------------------------------------------------- HP DATASET ----------------------------------------------------------------------- */

// build hp dataset
function loadHPData() {
  hpData = [Array.from({length: 10}, () => Array.from({length: 3}, () => Array.from({length: 1}).fill(null))),
            Array.from({length: 8}, () => Array.from({length: 3}, () => Array.from({length: 1}).fill(null))),
            Array.from({length: 5}, () => Array.from({length: 3}, () => Array.from({length: 1}).fill(null))),
            Array.from({length: 7}, () => Array.from({length: 3}, () => Array.from({length: versionIDs[3].length}).fill(null)))];
  for (let m = 1; m <= versionIDs.length; ++m) {
    for (let v = 1; v <= versionIDs[m - 1].length; ++v) {
      let versionEnemies = versionData[m - 1].versions[versionIDs[m - 1][v - 1]].versionEnemies;
      let nodeLvl = m == 1 ? nodeLvlStable : m == 2 ? nodeLvlDisputed : m == 3 ? nodeLvlAmbush : v < vPost ? nodeLvlCriticalPre : nodeLvlCriticalPost;
      for (let n = 1; n <= versionEnemies.nodes.length; ++n) {
        let currNode = versionEnemies.nodes[n - 1];
        let hpRaw = hpAOE = hpAlt = 0;

        // build enemy hp dataset
        for (let s = 1; s <= currNode.sides.length; ++s) {
          let currSide = currNode.sides[s - 1];
          if (!currSide) continue;
          for (let w = 1; w <= currSide.waves.length; ++w) {
            let currWave = currSide.waves[w - 1];
            let addAOE = true;
            for (let e = 1; e <= currWave.enemies.length; ++e) {
              let currEnemy = currWave.enemies[e - 1];
              let eID = currEnemy.id;
              let eType = currEnemy.type;
              let eCount = currEnemy.count;
              let eHPMult = currEnemy.hpMult ? currEnemy.hpMult : currSide.sideHPMult;
              let eData = enemyData[eID];
              let eMods = eData.mods;

              // define enemy hp
              let eHP = eData.baseHP[eType] * coeffHP[nodeLvl[n - 1] - 1] * eHPMult / 10000;
              hpRaw += (eID != "14000" ? eHP : 1) * eCount;
              hpAOE += addAOE ? eHP : 0;
              hpAlt += addAOE ? eHP * (eID[2] >= "2" && eData.baseDEF[eType] < 60 ? (coeffLvl[nodeLvl[n - 1] - 1] + eData.baseDEF[eType] * coeffDEF[nodeLvl[n - 1] - 1] / 100) / (coeffLvl[nodeLvl[n - 1] - 1] + 60 * coeffDEF[nodeLvl[n - 1] - 1] / 100) : 1) : 0;
              if (eMods.length >= 1 && !eMods.includes("hitch")) {
                // define alt hp mods
                let modImpair = eMods.find(mod => /^impr.+$/.test(mod));
                let modPurify = eMods.find(mod => /^prfy.+$/.test(mod));
                let modShutdown = eMods.find(mod => /^shut.+$/.test(mod));
                let modConvert = eMods.find(mod => /^conv.+$/.test(mod));

                if (eMods.includes("palicus")) hpAlt += eHP * 0.5;
                if (modImpair) hpAlt -= eHP * modImpair.slice(7, 12) / 10000;
                if (modPurify) hpAlt -= eHP * modPurify.slice(7, 12) / 10000;
                if (modShutdown) hpAlt -= eHP * modShutdown.slice(7, 12) / 10000;
                if (modConvert) hpAlt -= eHP * (modConvert.slice(7, 12) - modConvert.slice(13, 18)) / 10000;
              }
              addAOE = false;
            }
            addAOE = true;
          }
        }
        hpData[m - 1][n - 1][0][v - 1] = Math.round(hpRaw);
        hpData[m - 1][n - 1][1][v - 1] = Math.round(hpAOE);
        hpData[m - 1][n - 1][2][v - 1] = m <= 2 || (m == 4 && (v >= vPost ? n >= 4 : n >= 6)) ? Math.round(hpAlt) : null;
      }
    }
  }
}

/* ------------------------------------------------------------------------ VERSION ------------------------------------------------------------------------ */

// display version
function showVersion() {
  let currVersion = versionData[modeNum - 1].versions[versionIDs[modeNum - 1][versionNum - 1]];
  versionBuffIDs = currVersion.versionBuffIDs;
  versionBuffMain = currVersion.versionBuffMain;
  versionDazeMult = currVersion.versionDazeMult;
  versionAnomMult = currVersion.versionAnomMult;
  versionEnemies = currVersion.versionEnemies;
  document.getElementById("v-l").style.display = document.getElementById("v-r").style.display = modeNum == 4 ? "flex" : "none";
  document.getElementById("v-name").innerHTML = currVersion.versionName + (modeNum == 4 && versionNum == vLive ? `<span style="color:#ff5555;font-weight:bold;"> (LIVE)</span>` : modeNum == 4 && versionNum >= vBeta ? `<span style="color:#6d9fff;font-weight:bold;"> (BETA)</span>` : ``);
  document.getElementById("v-time").innerHTML = currVersion.versionTime;
  document.getElementById("v-id").innerHTML = `ID: 6${modeNum == 4 ? `2` : `1`}${(modeNum == 4 ? versionNum : modeNum).toString().padStart(3, `0`)}${versionNum >= vBeta ? `1` : ``}`;
  showNode();
}

// change version
function changeVersion(n) {
  if (modeNum != 4) return;
  let vMax = leaksToggle.checked ? versionIDs[modeNum - 1].length : vLive;
  versionNum = (versionNum - 1 + n + vMax) % vMax + 1;
  showVersion();
}

/* -------------------------------------------------------------------------- NODE -------------------------------------------------------------------------- */

// display node
function showNode() {
  if (modeNumOld != modeNum) {
    nodeNum = modeNum == 4 ? parseInt(localStorage.getItem("lastSDNode")) : versionEnemies.nodes.length;
    modeNumOld = modeNum;
  }
  if (modeNum == 4) changeNodePrePost();
  nodeLvl = modeNum == 1 ? nodeLvlStable : modeNum == 2 ? nodeLvlDisputed : modeNum == 3 ? nodeLvlAmbush : versionNum < vPost ? nodeLvlCriticalPre : nodeLvlCriticalPost;
  document.getElementById("n-text").innerHTML = nodeNum;
  showBuffs();
  showEnemies();
}

// change node
function changeNode(n) {
  let nMax = versionEnemies.nodes.length;
  nodeNum = (nodeNum - 1 + n + nMax) % nMax + 1;
  showNode();
}
function changeNodePrePost() {
  if (versionNumOld < vPost && versionNum >= vPost) nodeNum = Math.floor((nodeNum + 2 + Math.floor(nodeNum / 7)) / 2);
  else if (versionNumOld >= vPost && versionNum < vPost) nodeNum += Math.min(nodeNum - 1, 2);
  versionNumOld = versionNum;
}

/* ------------------------------------------------------------------------- BUFFS ------------------------------------------------------------------------- */

// display buffs
function showBuffs() {
  let vPostN5 = versionNum >= vPost && nodeNum == 5;
  document.getElementById("b").style.display = vPostN5 ? "none" : "flex";
  document.getElementById("b1").style.display = document.getElementById("b2").style.display = document.getElementById("b3").style.display = vPostN5 ? "flex" : "none";

  for (let b = 1; b <= versionBuffIDs.length; ++b) {
    let buff = document.getElementById(vPostN5 ? `b${b}` : `b`);
    let buffName = document.createElement("div");
    let buffDesc = document.createElement("div");
    buffName.className = "b-name";
    buffDesc.className = "b-text";
    buff.innerHTML = ``;
    buffName.innerHTML = buffData[versionBuffIDs[(modeNum == 4 ? b : nodeNum) - 1]][0];
    buffDesc.innerHTML = buffData[versionBuffIDs[(modeNum == 4 ? b : nodeNum) - 1]][1];

    // display buff parts
    if (vPostN5 || b == versionBuffMain) {
      if (vPostN5) {
        let buffHeader = document.createElement("div");
        buffHeader.className = "b-header";
        buffHeader.innerHTML = `5-${b} Frontier Buff`;
        buff.appendChild(buffHeader);
      }
      buff.appendChild(buffName);
      buff.appendChild(buffDesc);
      if (modeNum == 1 && nodeNum >= 7 && nodeNum <= 9) {
        let buffNameExtra = document.createElement("div");
        let buffDescExtra = document.createElement("div");
        buffNameExtra.className = "b-name";
        buffDescExtra.className = "b-text";
        buffNameExtra.innerHTML = `<br>` + buffData["61000010"][0];
        buffDescExtra.innerHTML = buffData["61000010"][1];
        buff.appendChild(buffNameExtra);
        buff.appendChild(buffDescExtra);
      }
      if (!vPostN5) break;
    }
  }
}

/* ------------------------------------------------------------------------ ENEMIES ------------------------------------------------------------------------ */

// display enemies
function showEnemies() {
  let currNode = versionEnemies.nodes[nodeNum - 1];
  document.getElementById("s-3").style.display = versionNum >= vPost && nodeNum == 5 ? "flex" : "none";

  for (let s = 1; s <= currNode.sides.length; ++s) {
    let side = document.getElementById(`s${s}`);
    if (window.innerWidth > 1080) side.style.minHeight = modeNum == 1 ? (nodeNum >= 9 ? "663.5px" : "1144.5px") : modeNum == 2 ? "663.5px" : modeNum == 3 ? "429.5px" : versionNum >= vPost ? "1144.5px" : (nodeNum >= 6 ? "663.5px" : "1144.5px");
    side.innerHTML = ``;
    let currSide = currNode.sides[s - 1];

    // display side header
    let sideHeader = document.createElement("div");
    sideHeader.className = "s-header";
    sideHeader.innerHTML = `${nodeNum}-${s} Lv${nodeLvl[nodeNum - 1]}`;

    // display side multipliers
    let sideHPMult = currSide ? currSide.sideHPMult : null, sideDazeMult = versionDazeMult, sideAnomMult = versionAnomMult;
    let sideMult = document.createElement("div");
    sideMult.className = "s-mult";
    sideMult.innerHTML = `HP: <span style="color:#ff5555;">${currSide ? `${sideHPMult}%` : `N/A`}</span> | Daze: <span style="color:#ffe599;">${currSide ? (modeNum != 1 || nodeNum != 7 ? `${sideDazeMult}%` : `97%`) : `N/A`}</span> | Anom: <span style="color:#7b78ff;">${currSide ? `${sideAnomMult}%` : `N/A`}</span>`;
    sideHeader.appendChild(sideMult);

    // display side weaknesses/resistances
    let sideWR = document.createElement("div");
    sideWR.className = "wr";
    generateWR(currSide ? currNode.sides[s - 1].sideElementMult : [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], sideWR);
    sideHeader.appendChild(sideWR);
    side.appendChild(sideHeader);
    if (!currSide) continue;

    for (let w = 1; w <= currSide.waves.length; ++w) {
      let wave = document.createElement("div");
      wave.className = "w";

      // display wave header
      let waveHeader = document.createElement("div");
      waveHeader.className = "w-header";
      waveHeader.innerHTML = `WAVE ${w}`;
      wave.appendChild(waveHeader);

      // display waves
      let currWave = currSide.waves[w - 1];
      let waveEnemies = document.createElement("div");
      waveEnemies.className = "w-e";

      for (let e = 1; e <= currWave.enemies.length; ++e) {
        // define enemy info
        let currEnemy = currWave.enemies[e - 1];
        let eID = currEnemy.id;
        let eType = currEnemy.type;
        let eCount = currEnemy.count;
        let eHPMult = currEnemy.hpMult || sideHPMult;
        let eData = enemyData[eID];
        let eMods = eData.mods;
        let eTags = eData.tags;

        let showSpoilers = spoilersToggle.checked || !eTags.includes("spoiler");
        let eName = showSpoilers ? eData.name : "SPOILER ENEMY";
        let eImg = showSpoilers ? `../../assets/zzz/enemies/${eData.image}.webp` : `../../assets/zzz/enemies/doppelganger-i.webp`;
        let eHP = Math.round(eData.baseHP[eType] * coeffHP[nodeLvl[nodeNum - 1] - 1] * eHPMult / 10000);
        let eDEF = Math.ceil(eData.baseDEF[eType] * coeffDEF[nodeLvl[nodeNum - 1] - 1] / 100);
        let eDaze = eData.baseDaze[eType] * coeffDaze[nodeLvl[nodeNum - 1] - 1] * (modeNum != 1 || nodeNum != 7 ? 1 : 0.97) / 100;
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

        // display enemy count (>1)
        if (eCount > 1) {
          let enemyCount = document.createElement("div");
          enemyCount.className = "e-count";
          enemyCount.innerHTML = `x${eCount}`;
          enemyHover.appendChild(enemyCount);
        }
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

          if (eMods.includes("hitch")) {
            ttHP.innerHTML = hitch(eHP) + `<br>`;
            enemyHP.innerHTML = showNumberFormat(1);
          }
          else {
            let eHPAlt = eHP * (eDEFLow ? (coeffLvl[nodeLvl[nodeNum - 1] - 1] + eData.baseDEF[eType] * coeffDEF[nodeLvl[nodeNum - 1] - 1] / 100) / (coeffLvl[nodeLvl[nodeNum - 1] - 1] + 60 * coeffDEF[nodeLvl[nodeNum - 1] - 1] / 100) : 1);
            let ttHPColor = "#ffffff";
            ttHP.innerHTML += eDEFLow ? `<span style="font-weight:bold;">NORMALIZED to 953 DEF</span> → <span style="color:#f6b969;font-weight:bold;">×${Math.round(eHPAlt / eHP * 100000) / 1000}%</span><br>`: ``;

            // define alt hp mods
            let modImpair = eMods.find(mod => /^impr.+$/.test(mod));
            let modPurify = eMods.find(mod => /^prfy.+$/.test(mod));
            let modShutdown = eMods.find(mod => /^shut.+$/.test(mod));
            let modConvert = eMods.find(mod => /^conv.+$/.test(mod));

            if (eMods.includes("palicus")) {
              eHPAlt -= eHP * 0.25;
              ttHPColor = "#adda2b";
              ttHP.innerHTML += `${palicus(eHPAlt)}<br>`;
            }
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
          }
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
      }
      wave.appendChild(waveEnemies);
      side.appendChild(wave);
    }
  }

  // display enemy hp total
  document.getElementById("v-hp-raw").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][0][versionNum - 1]);
  document.getElementById("v-hp-aoe").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][1][versionNum - 1]);
  document.getElementById("v-hp-alt").innerHTML = modeNum <= 2 || (modeNum == 4 && (v >= vPost ? nodeNum >= 4 : nodeNum >= 6)) ? showNumberFormat(hpData[modeNum - 1][nodeNum - 1][2][versionNum - 1]) : showNumberFormat(hpData[modeNum - 1][nodeNum - 1][1][versionNum - 1]);

  // save current settings/page
  saveSettings();
  if (modeNum == 4) saveLastPage();
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
  for (let e = 0; e < elementData.length - ((modeNum == 3 || modeNum == 4) && versionNum < vWind); ++e) {
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
  for (let e = 0; e < elementData.length - ((modeNum == 3 || modeNum == 4) && versionNum < vWind); ++e) {
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
  return  `<span style="color:${color};font-weight:bold;">${hpDMech}</span> ${hpDMechCnt} time(s) → <span style="color:#f6b969;font-weight:bold;">-${hpDMult}%</span>
          ${hpUMult != 0 ? `<br>${hpUMech} → <span style="color:#f6b969;font-weight:bold;">+${hpUMult}%</span>` : ``}`;
}
function hitch(hp) {
  return `<span style="color:#ffffff;">✦</span><span class="tt-text">
          <span style="font-weight:bold;text-decoration:underline;">Hitchspiker</span><br>
          True Raw HP: <span style="color:#ff5555;font-weight:bold;">${showNumberFormat(hp)}</span><br><br>
          technically does not<br>need to be killed</span>`;
}
function palicus() {
  return `hit both 50% of the time</span>`;
}

// display enemy stats
function generateEnemyStats(id, daze, stunMult, stunTime, anom, eleMult, tags) {
  let anomMult = [1, 1, 1, 1, 1.2, 0.5];
  let color = ["#98eff0", "#ff5521", "#2eb6ff", "#fe437e", "#f0d12b", "#a6c5fd"];
  let stats = `Max Daze: <span style="color:#ffe599;font-weight:bold;">${Math.round(daze * 100) / 100}</span><br>
              (<span style="color:#ffe599;font-weight:bold;">${stunMult}%</span> DMG for <span style="color:#ffe599;font-weight:bold;">${stunTime}s</span>)<br><br>`;
  if (tags.includes("no-anom")) return stats + `<span style="font-weight:bold;">IMMUNE TO ANOMALY</span>`;
  stats += `Min Anomaly Buildup:<br>`;
  for (let e = 0; e < elementData.length - ((modeNum == 3 || modeNum == 4) && versionNum < vWind); ++e) stats += `<span style="color:${color[e]};font-weight:bold;">${Math.round(anom * anomMult[e] * (1 / (2 - Math.min(eleMult[e], 1.2))) * (id[2] == "1" && e == 5 ? 46/45 : 1) * 100) / 100}</span>/` + (window.innerWidth < 1360 && e == 2 ? `<br>`: ``);
  stats = stats.slice(0, -1) + (tags.includes("no-freeze") ? `<br>(<span style="color:#98eff0;font-weight:bold;">UNFREEZABLE</span>)` : ``);
  return stats;
}

/* ----------------------------------------------------------------------- QOL & NAV ----------------------------------------------------------------------- */

// load saved settings/page
function loadSaveState() {
  currNumberFormat = localStorage.getItem("numberFormat") || "period";
  leaksToggle.checked = localStorage.getItem("leaksEnabled") == "true";
  spoilersToggle.checked = localStorage.getItem("spoilersEnabled") == "true";
  versionNumOld = versionNum = parseInt(localStorage.getItem("lastSDVersion") || vLive);
  nodeNum = parseInt(localStorage.getItem("lastSDNode") || 5);
  chartNodeNum = parseInt(localStorage.getItem("lastSDChartNode") || 5);
  chartDropdown.value = chartTypeOld = chartType = localStorage.getItem("lastSDChartType") || "Post 2.5";
  if (!leaksToggle.checked) versionNum = Math.min(versionNum, vLive);
  saveSettings();
  saveLastPage();
}

// save current settings/page
function saveSettings() {
  localStorage.setItem("numberFormat", currNumberFormat);
  localStorage.setItem("leaksEnabled", leaksToggle.checked);
  localStorage.setItem("spoilersEnabled", spoilersToggle.checked);
}
function saveLastPage() {
  localStorage.setItem("lastSDVersion", versionNum);
  localStorage.setItem("lastSDNode", nodeNum);
  localStorage.setItem("lastSDChartNode", chartNodeNum);
  localStorage.setItem("lastSDChartType", chartType);
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
  if (e.key == "Escape") { e.preventDefault(); chartIsOpen ? toggleChart() : versionSelectorIsOpen ? toggleVersionSelector() : toggleMenuBar(); }
  else if (e.key == " " && !menuBarIsOpen && !chartIsOpen) { e.preventDefault(); toggleVersionSelector(); }
  else if (e.key == "`" && !menuBarIsOpen && !versionSelectorIsOpen) { e.preventDefault(); toggleChart(); }
  else if (e.key == "Enter" && !menuBarIsOpen && !versionSelectorIsOpen && !chartIsOpen) { e.preventDefault(); jumpToTop(); }
  else if (e.key == "ArrowLeft" && !menuBarIsOpen && !versionSelectorIsOpen && !chartIsOpen) { e.preventDefault(); changeVersion(-1); }
  else if (e.key == "ArrowRight" && !menuBarIsOpen && !versionSelectorIsOpen && !chartIsOpen) { e.preventDefault(); changeVersion(1); }
  else if (e.key == "ArrowDown") { e.preventDefault(); chartIsOpen ? changeChartNode(-1) : !menuBarIsOpen && !versionSelectorIsOpen ? changeNode(-1) : null; }
  else if (e.key == "ArrowUp") { e.preventDefault(); chartIsOpen ? changeChartNode(1) : !menuBarIsOpen && !versionSelectorIsOpen ? changeNode(1) : null; }
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
  let versionSelectorMisc = document.getElementById("vs-misc");
  let versionSelectorHeader = document.getElementById("vs-header");
  let versionSelectorMain = document.getElementById("vs-main");
  versionSelectorMisc.innerHTML = ``;
  versionSelectorHeader.innerHTML = `Critical Node`;
  versionSelectorMain.innerHTML = ``;

  for (let m = 1; m <= 4; ++m) {
    // display allowed version selector options
    for (let v = 1; v <= (m == 4 ? (leaksToggle.checked ? versionIDs[m - 1].length : vLive) : 1); ++v) {
      let currVersion = versionData[m - 1].versions[versionIDs[m - 1][v - 1]];

      // display version selector option
      let versionSelectorOption = document.createElement("div");
      let optionName = document.createElement("div");
      let optionTime = document.createElement("div");
      let optionID = document.createElement("div");
      versionSelectorOption.className = "vs-opt";
      optionName.className = "vs-opt-name";
      optionTime.className = "vs-opt-time";
      optionID.className = "vs-opt-id";
      optionName.innerHTML = currVersion.versionName + (m == 4 && v == vLive ? `<span style="color:#ff5555;font-weight:bold;"> (LIVE)</span>` : m == 4 && v >= vBeta ? `<span style="color:#6d9fff;font-weight:bold;"> (BETA)</span>` : ``);
      optionTime.innerHTML = currVersion.versionTime;
      optionID.innerHTML = `ID: 6${m == 4 ? `2` : `1`}${(m == 4 ? v : m).toString().padStart(3, `0`)}${v >= vBeta ? `1` : ``}`;
      versionSelectorOption.appendChild(optionName);
      versionSelectorOption.appendChild(optionTime);
      versionSelectorOption.appendChild(optionID);
      m == 4 ? versionSelectorMain.appendChild(versionSelectorOption) : versionSelectorMisc.appendChild(versionSelectorOption);

      // go to version
      versionSelectorOption.onclick = () => {
        modeNum = m;
        versionNum = v;
        toggleVersionSelector();
        showVersion();
      }
    }
  }
}

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
  downloadButton.download = `Shiyu Defense HP - ${versionData[modeNum - 1].name + (modeNum == 4 ? ` ${chartNodeNum} - ${chartType}` : ``)}`;
  downloadButton.click();
}

// display chart node
function changeChartNode(n) {
  if (modeNum != 4) return;
  let chartNMax = chartType == "Post 2.5" ? 5 : 7;
  chartNodeNum = (chartNodeNum - 1 + n + chartNMax) % chartNMax + 1;
  showChart();
}
function changeChartNodePrePost() {
  if (chartTypeOld == "Pre 2.5" && chartType == "Post 2.5") chartNodeNum = Math.floor((chartNodeNum + 2 + Math.floor(chartNodeNum / 7)) / 2);
  else if (chartTypeOld == "Post 2.5" && chartType == "Pre 2.5") chartNodeNum += Math.min(chartNodeNum - 1, 2);
  chartTypeOld = chartType;
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
  let labels, hpDataRaw = [], hpDataAOE = [], hpDataAlt = [];
  document.getElementById("ch-n-l").style.display = document.getElementById("ch-n-r").style.display = chartDropdown.style.display = modeNum == 4 ? "flex" : "none";

  if (modeNum == 4) {
    changeChartNodePrePost();
    let chartVersionStart = chartType == "Post 2.5" ? vPost - 1 : 0;
    let chartVersionEnd = chartType == "Post 2.5" ? versionIDs[modeNum - 1].length : vPost - 1;
    let hpDataNew = hpData[modeNum - 1][chartNodeNum - 1].map(ver => ver.slice(chartVersionStart, chartVersionEnd));
    labels = versionIDs[modeNum - 1].slice(chartVersionStart, chartVersionEnd);
    hpDataRaw = hpDataNew[0];
    hpDataAOE = hpDataNew[1];
    hpDataAlt = hpDataNew[2];
    hpChart.options.scales.y.min = chartType == "Post 2.5" && chartNodeNum == 5 ? 70000000 : 0;
    hpChart.options.scales.y.max = chartType == "Post 2.5" && chartNodeNum == 5 ? 210000000 : 70000000;
  }
  else {
    labels = Array.from({length: versionEnemies.nodes.length}, (_, n) => `Node ${n + 1}`);
    for (let n = 0; n < versionEnemies.nodes.length; ++n) {
      hpDataRaw.push(hpData[modeNum - 1][n][0][0]);
      hpDataAOE.push(hpData[modeNum - 1][n][1][0]);
      hpDataAlt.push(hpData[modeNum - 1][n][2][0]);
    }
    hpChart.options.scales.y.min = 0;
    hpChart.options.scales.y.max = modeNum == 1 ? 7000000 : 21000000;
  }
  hpChart.data.labels = labels;
  hpChart.data.datasets = [
    generateChartDataset("Raw HP", hpDataRaw, "#ff5555"),
    generateChartDataset("AOE HP", hpDataAOE, "#6d9fff"),
    modeNum <= 2 || (modeNum == 4 && (chartType == "Post 2.5" ? chartNodeNum >= 4 : chartNodeNum >= 6)) ? generateChartDataset("Alt HP", hpDataAlt, "#f6b969") : null
  ].filter(Boolean);
  hpChart.options.plugins.title.text = `Shiyu Defense HP - ${versionData[modeNum - 1].name + (modeNum == 4 ? ` ${chartNodeNum} - ${chartType}` : ``)}`;
  hpChart.options.scales.y.ticks.stepSize = (hpChart.options.scales.y.max - hpChart.options.scales.y.min) / 14;
  hpChart.update();

  // save current settings/page
  saveSettings();
  if (modeNum == 4) saveLastPage();
}