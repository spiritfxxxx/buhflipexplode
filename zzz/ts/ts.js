/* ----------------------------------------------------------------------- MAIN PAGE ----------------------------------------------------------------------- */

let vLive = 2, vBeta = 3, vPost = 2, vWind = 2, modeNumOld = modeNum = 2;
let menuBarIsOpen = versionSelectorIsOpen = false;
let elementData = ["ice", "fire", "electric", "ether", "physical", "wind"];
let currNumberFormat, leaksToggle = document.getElementById("lks"), spoilersToggle = document.getElementById("spl");

let versionData, enemyData, buffData, versionIDs = [];
let hpData = [];
let versionBuffIDs, versionDazeMultEnemy, versionDazeMultBoss, versionAnomMultEnemy, versionAnomMultBoss, versionEnemies;
let versionNumOld, versionNum, nodeNum, nMax, variantNum;

let nodeLvl = [];
let nodeLvlEasy = [55, 58, 60, 65];
let nodeLvlHardPre = [60, 63, 65, 70, 70, 70];
let nodeLvlHardPost = [60, 65, 70, 70, 70];

// full list of numbers thanks to Dimbreath's database
let coeffLvl = [50, 54, 58, 62, 66, 71, 76, 82, 88, 94, 100, 107, 114, 121, 129, 137, 145, 153, 162, 172, 181, 191, 201, 211, 222, 233, 245, 256, 268, 281, 293, 306, 319, 333, 347, 361, 375, 390, 405, 421, 436, 452, 469, 485, 502, 519, 537, 555, 573, 592, 610, 629, 649, 669, 689, 709, 730, 751, 772, 794, 794, 794, 794, 794, 794, 794, 794, 794, 794, 794];
let coeffHPEnemy = [100, 116, 135, 157, 181, 193, 206, 220, 235, 271, 291, 314, 338, 364, 419, 431, 444, 458, 472, 543, 618, 703, 801, 912, 1049, 1111, 1176, 1246, 1320, 1518, 1609, 1706, 1809, 1919, 2207, 2320, 2440, 2566, 2698, 3103, 3404, 3734, 4097, 4494, 5169, 5591, 6049, 6544, 7079, 8141, 8826, 9569, 10374, 11246, 12934, 13260, 13595, 13938, 14290, 16434, 16774, 17121, 17475, 17837, 18206, 18583, 18968, 19361, 19761, 21738];
let coeffHPBoss = [100, 116, 135, 157, 181, 193, 206, 220, 235, 271, 291, 314, 338, 364, 419, 431, 444, 458, 472, 543, 618, 703, 801, 912, 1049, 1134, 1227, 1328, 1437, 1653, 1792, 1942, 2106, 2283, 2626, 2865, 3126, 3411, 3722, 4281, 4717, 5197, 5727, 6311, 7258, 7691, 8151, 8637, 9153, 10527, 11227, 11975, 12772, 13623, 15667, 15957, 16252, 16553, 16860, 19389, 19716, 20049, 20387, 20731, 21081, 21437, 21799, 22167, 22541, 24795];
let coeffDEF = [100, 108, 116, 124, 132, 142, 152, 164, 176, 188, 200, 214, 228, 242, 258, 274, 290, 306, 324, 344, 362, 382, 402, 422, 444, 466, 490, 512, 536, 562, 586, 612, 638, 666, 694, 722, 750, 780, 810, 842, 872, 904, 938, 970, 1004, 1038, 1074, 1110, 1146, 1184, 1220, 1258, 1298, 1338, 1378, 1418, 1460, 1502, 1544, 1588, 1588, 1588, 1588, 1588, 1588, 1588, 1588, 1588, 1588, 1588];
let coeffDaze = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 101, 102, 103, 104, 104, 105, 106, 107, 108, 110, 113, 115, 118, 120, 123, 125, 128, 130, 133, 137, 142, 146, 151, 155, 160, 164, 169, 173, 178, 180, 183, 186, 189, 192, 195, 197, 200, 203, 206, 209, 212, 215, 217, 220, 223, 226, 229, 232, 235];

// display main page
async function loadPage() {
  versionData = await (await fetch("ts-versions.json")).json();
  enemyData = await (await fetch("../../assets/zzz/enemies.json")).json();
  buffData = await (await fetch("../../assets/zzz/buffs.json")).json();
  for (let m = 1; m <= 2; ++m) versionIDs.push(Object.keys(versionData[m - 1].versions));
  loadHPData();
  loadSaveState();
  showVersion();
  changeNumberFormat();
}
window.addEventListener("DOMContentLoaded", () => { loadPage(); });

/* ----------------------------------------------------------------------- HP DATASET ----------------------------------------------------------------------- */

// build hp dataset
function loadHPData() {
  hpData = [Array.from({length: 4}, () => Array.from({length: 5}, () => Array.from({length: 1}).fill(null))),
            Array.from({length: 6}, () => Array.from({length: 5}, () => Array.from({length: versionIDs[1].length}).fill(null)))];
  for (let m = 1; m <= versionIDs.length; ++m) {
    for (let v = 1; v <= versionIDs[m - 1].length; ++v) {
      let versionEnemies = versionData[m - 1].versions[versionIDs[m - 1][v - 1]].versionEnemies;
      let nodeLvl = m == 1 ? nodeLvlEasy : v < vPost ? nodeLvlHardPre : nodeLvlHardPost;
      for (let n = 1; n <= versionEnemies.nodes.length; ++n) {
        let currNode = versionEnemies.nodes[n - 1];
        let hpRawEnemy = hpAOEEnemy = hpAltEnemy = hpRawBoss = hpAltBoss = 0;

        // build enemy hp dataset
        for (let s = 1; s <= currNode.sides.length - 1; ++s) {
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
              let eHP = eData.baseHP[eType] * coeffHPEnemy[nodeLvl[n - 1] - 1] * eHPMult / 10000;
              hpRawEnemy += (eID != "14000" ? eHP : 1) * eCount;
              hpAOEEnemy += addAOE ? eHP : 0;
              hpAltEnemy += addAOE ? eHP * (eID[2] >= "2" && eData.baseDEF[eType] < 60 ? (coeffLvl[nodeLvl[n - 1] - 1] + eData.baseDEF[eType] * coeffDEF[nodeLvl[n - 1] - 1] / 100) / (coeffLvl[nodeLvl[n - 1] - 1] + 60 * coeffDEF[nodeLvl[n - 1] - 1] / 100) : 1) : 0;
              if (eMods.length >= 1 && !eMods.includes("hitch")) {
                // define alt hp mods
                let modImpair = eMods.find(mod => /^impr.+$/.test(mod));
                let modPurify = eMods.find(mod => /^prfy.+$/.test(mod));
                let modShutdown = eMods.find(mod => /^shut.+$/.test(mod));
                let modConvert = eMods.find(mod => /^conv.+$/.test(mod));
                let modMiscD = eMods.find(mod => /^mscd.+$/.test(mod));
                let modMiscU = eMods.find(mod => /^mscu.+$/.test(mod));

                if (eMods.includes("palicus")) hpAltEnemy += eHP * 0.5;
                if (modImpair) hpAltEnemy -= eHP * modImpair.slice(7, 12) / 10000;
                if (modPurify) hpAltEnemy -= eHP * modPurify.slice(7, 12) / 10000;
                if (modShutdown) hpAltEnemy -= eHP * modShutdown.slice(7, 12) / 10000;
                if (modConvert) hpAltEnemy -= eHP * (modConvert.slice(7, 12) - modConvert.slice(13, 18)) / 10000;
                if (modMiscD) hpAltEnemy -= eHP * modMiscD.slice(7, 12) / 10000;
                if (modMiscU) hpAltEnemy += eHP * modMiscU.slice(13, 18) / 10000;
              }
              addAOE = false;
            }
            addAOE = true;
          }
        }

        // build boss hp dataset
        let currEnemy = currNode.sides[4].waves[0].enemies[0];
        let eID = currEnemy.id;
        let eType = currEnemy.type;
        let eHPMult = currEnemy.hpMult ? currEnemy.hpMult : currNode.sides[4].sideHPMult;
        let eData = enemyData[eID];
        let eMods = eData.mods;

        // define boss hp
        let eHP = eData.baseHP[eType] * coeffHPBoss[nodeLvl[n - 1] - 1] * eHPMult * 8.74 / 10000;
        hpRawBoss += eHP;
        hpAltBoss += eHP * (eID[2] >= "2" && eData.baseDEF[eType] < 60 ? (794 + eData.baseDEF[eType] * 1588 / 100) / (794 + 60 * 1588 / 100) : 1);
        if (eMods.length >= 1) {
          // define alt hp mods
          let modImpair = eMods.find(mod => /^impr.+$/.test(mod));
          let modPurify = eMods.find(mod => /^prfy.+$/.test(mod));
          let modShutdown = eMods.find(mod => /^shut.+$/.test(mod));
          let modConvert = eMods.find(mod => /^conv.+$/.test(mod));
          let modMiscD = eMods.find(mod => /^mscd.+$/.test(mod));
          let modMiscU = eMods.find(mod => /^mscu.+$/.test(mod));

          if (modImpair) hpAltBoss -= eHP * modImpair.slice(7, 12) / 10000;
          if (modPurify) hpAltBoss -= eHP * modPurify.slice(7, 12) / 10000;
          if (modShutdown) hpAltBoss -= eHP * modShutdown.slice(7, 12) / 10000;
          if (modConvert) hpAltBoss -= eHP * (modConvert.slice(7, 12) - modConvert.slice(13, 18)) / 10000;
          if (modMiscD) hpAltBoss -= eHP * modMiscD.slice(7, 12) / 10000;
          if (modMiscU) hpAltBoss += eHP * modMiscU.slice(13, 18) / 10000;
        }

        // build enemy/boss hp dataset
        hpData[m - 1][n - 1][0][v - 1] = Math.round(hpRawEnemy);
        hpData[m - 1][n - 1][1][v - 1] = Math.round(hpAOEEnemy);
        hpData[m - 1][n - 1][2][v - 1] = Math.round(hpAltEnemy);
        hpData[m - 1][n - 1][3][v - 1] = Math.round(hpRawBoss);
        hpData[m - 1][n - 1][4][v - 1] = Math.round(hpAltBoss);
      }
    }
  }
}

/* ------------------------------------------------------------------------ VERSION ------------------------------------------------------------------------ */

// display version
function showVersion() {
  let currVersion = versionData[modeNum - 1].versions[versionIDs[modeNum - 1][versionNum - 1]];
  versionBuffIDs = currVersion.versionBuffIDs;
  versionDazeMultEnemy = currVersion.versionDazeMultEnemy;
  versionDazeMultBoss = currVersion.versionDazeMultBoss;
  versionAnomMultEnemy = currVersion.versionAnomMultEnemy;
  versionAnomMultBoss = currVersion.versionAnomMultBoss;
  versionEnemies = currVersion.versionEnemies;
  document.getElementById("v-l").style.display = document.getElementById("v-r").style.display = modeNum == 2 ? "flex" : "none";
  document.getElementById("v-name").innerHTML = currVersion.versionName + (modeNum == 2 && versionNum == vLive ? `<span style="color:#ff5555;font-weight:bold;"> (LIVE)</span>` : modeNum == 2 && versionNum >= vBeta ? `<span style="color:#6d9fff;font-weight:bold;"> (BETA)</span>` : ``);
  document.getElementById("v-time").innerHTML = currVersion.versionTime;
  document.getElementById("v-id").innerHTML = `${modeNum == 2 ? `Version: ${versionIDs[modeNum - 1][versionNum - 1].slice(0, 3)} Phase ${versionIDs[modeNum - 1][versionNum - 1].slice(4)} - ` : ``}ID: ${versionNum}0${versionNum == 1 ? modeNum : 1}`;
  showNode();
}

// change version
function changeVersion(n) {
  if (modeNum != 2) return;
  let vMax = leaksToggle.checked ? versionIDs[modeNum - 1].length : vLive;
  versionNum = (versionNum - 1 + n + vMax) % vMax + 1;
  showVersion();
}

/* -------------------------------------------------------------------------- NODE -------------------------------------------------------------------------- */

// display node
function showNode() {
  if (modeNumOld != modeNum) {
    nodeNum = modeNum == 2 ? parseInt(localStorage.getItem("lastTSNode")) : versionEnemies.nodes.length;
    modeNumOld = modeNum;
  }
  if (modeNum == 2) changeNodePrePost();
  nMax = versionNum >= vPost ? 3 : 4;
  nodeLvl = modeNum == 1 ? nodeLvlEasy : versionNum < vPost ? nodeLvlHardPre : nodeLvlHardPost;
  document.getElementById("n-text").innerHTML = Math.min(nodeNum, nMax);
  showVariant();
  showBuffs();
  showEnemies();
}

// change node
function changeNode(n) {
  nodeNum = (Math.min(nodeNum, nMax) - 1 + n + nMax) % nMax + 1;
  if (modeNum == 2 && nodeNum == nMax) nodeNum += variantNum - 1;
  showNode();
}
function changeNodePrePost() {
  if (versionNumOld < vPost && versionNum >= vPost) {
    if (nodeNum == 3 || (nodeNum >= nMax && nodeNum - nMax < 2)) --nodeNum;
    else if (nodeNum >= nMax && nodeNum - nMax >= 2) nodeNum = 4;
  }
  else if (versionNumOld >= vPost && versionNum < vPost && nodeNum >= 2) ++nodeNum;
  versionNumOld = versionNum;
}

/* ------------------------------------------------------------------------ VARIANT ------------------------------------------------------------------------ */

// display variants
function showVariant() {
  if (versionNum >= vPost) variantNum = Math.min(variantNum, 2);
  document.getElementById("var").style.display = modeNum == 2 && nodeNum >= nMax ? "flex" : "none";
  if (modeNum == 2 && nodeNum >= nMax) {
    document.getElementById("var3").style.display = versionNum >= vPost ? "none" : "flex";
    let variantOptions = document.querySelectorAll(".var-opt");
    variantOptions.forEach(opt => opt.classList.toggle("selected", opt.dataset.format == variantNum));
  }
}

// change variants
function changeVariant(n) {
  variantNum = n;
  nodeNum = (versionNum >= vPost ? 2 : 3) + n;
  showNode();
}

/* ------------------------------------------------------------------------- BUFFS ------------------------------------------------------------------------- */

// display buffs
function showBuffs() {
  for (let b = 1; b <= versionBuffIDs[0].length; ++b) {
    let buff = document.getElementById(`b${b}`);
    let buffImg = document.createElement("img");
    let buffName = document.createElement("div");
    let buffDesc = document.createElement("div");
    buffImg.className = "b-img";
    buffName.className = "b-name";
    buffDesc.className = "b-text";
    buff.innerHTML = ``;
    buffImg.src = `../../assets/zzz/buffs/${buffData[versionBuffIDs[nodeNum - 1][b - 1]][1]}.webp`;
    buffName.innerHTML = buffData[versionBuffIDs[nodeNum - 1][b - 1]][0];
    buffDesc.innerHTML = buffData[versionBuffIDs[nodeNum - 1][b - 1]][2];
    buff.appendChild(buffImg);
    buff.appendChild(buffName);
    buff.appendChild(buffDesc);
  }
}

/* ------------------------------------------------------------------------ ENEMIES ------------------------------------------------------------------------ */

// display enemies
function showEnemies() {
  let currNode = versionEnemies.nodes[nodeNum - 1];

  for (let s = 1; s <= currNode.sides.length; ++s) {
    let side = document.getElementById(`s${s <= 4 ? s : `h`}`);
    side.innerHTML = ``;
    let currSide = currNode.sides[s - 1];

    // display side header
    let sideHeader = document.createElement("div");
    sideHeader.className = "s-header";
    sideHeader.innerHTML = `${s <= 3 ? `Required` : s == 4 ? `Optional` : `Final BATTLE`} ${Math.min(nodeNum, nMax)}${modeNum == 2 && nodeNum >= nMax ? `.${variantNum}` : ``}${s <= 4 ?  `-${s}` : ``} Lv${nodeLvl[nodeNum - 1]}`;

    // display side multipliers
    let sideHPMult = currSide ? currSide.sideHPMult : null, sideDazeMult = s <= 4 ? versionDazeMultEnemy : versionDazeMultBoss[nodeNum - 1], sideAnomMult = s <= 4 ? versionAnomMultEnemy : versionAnomMultBoss[nodeNum - 1];
    let sideMult = document.createElement("div");
    sideMult.className = "s-mult";
    sideMult.innerHTML = `HP: <span style="color:#ff5555;">${currSide ? `${sideHPMult}%` : `N/A`}</span> | Daze: <span style="color:#ffe599;">${currSide ? `${sideDazeMult}%` : `N/A`}</span> | Anom: <span style="color:#7b78ff;">${currSide ? `${sideAnomMult}%` : `N/A`}</span>`;
    sideHeader.appendChild(sideMult);

    // display side weaknesses/resistances
    if (s <= 4) {
      let sideWR = document.createElement("div");
      sideWR.className = "wr";
      generateWR(currSide ? currNode.sides[s - 1].sideElementMult : [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], sideWR, 0);
      sideHeader.appendChild(sideWR);
    }
    side.appendChild(sideHeader);
    if (!currSide) continue;

    for (let w = 1; w <= currSide.waves.length; ++w) {
      let wave = document.createElement("div");
      wave.className = "w";

      // display wave header
      if (s <= 4) {
        let waveHeader = document.createElement("div");
        waveHeader.className = "w-header";
        waveHeader.innerHTML = `WAVE ${w}`;
        wave.appendChild(waveHeader);
      }

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
        let eName = showSpoilers ? eData.name : (s == 5 ? "SPOILER BOSS" : "SPOILER ENEMY");
        let eImg = showSpoilers ? `../../assets/zzz/enemies/${eData.image}.webp` : `../../assets/zzz/enemies/doppelganger-i.webp`;
        let eHP = (s <= 4 ? Math.round : Math.floor)(eData.baseHP[eType] * (s <= 4 ? coeffHPEnemy : coeffHPBoss)[nodeLvl[nodeNum - 1] - 1] * eHPMult * (s <= 4 ? 1 : 8.74) / 10000);
        let eDEF = Math.ceil(eData.baseDEF[eType] * coeffDEF[nodeLvl[nodeNum - 1] - 1] / 100);
        let eDaze = eData.baseDaze[eType] * coeffDaze[nodeLvl[nodeNum - 1] - 1] / 100;
        let eStunMult = eData.stunMult;
        let eStunTime = eData.stunTime;
        let eAnom = eData.baseAnom;
        let eElementMult = currEnemy.customElementMult || eData.elementMult;

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
        generateWR(eElementMult, enemyWR, s);
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
            let modMiscD = eMods.find(mod => /^mscd.+$/.test(mod));
            let modMiscU = eMods.find(mod => /^mscu.+$/.test(mod));

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
            if (modMiscD) {
              eHPAlt -= eHP * modMiscD.slice(7, 12) / 10000;
              ttHPColor = "#ffffff";
              ttHP.innerHTML += `${generateInstant(ttHPColor, modMiscD.slice(5, 6), modMiscD.slice(19), modMiscD.slice(7, 12) / 100, "", 0)}<br>`;
            }
            if (modMiscU) {
              eHPAlt += eHP * modMiscU.slice(13, 18) / 10000;
              ttHPColor = "#ffffff";
              ttHP.innerHTML += `${generateInstant(ttHPColor, modMiscU.slice(5, 6), "", 0, modMiscU.slice(19), modMiscU.slice(13, 18) / 100)}<br>`;
            }

            // display enemy alt hp tooltip
            ttHP.innerHTML = generateAlt(ttHPColor, eName, eHPAlt, eHP) + ttHP.innerHTML;
          }
          hp.appendChild(ttHP);

          // change boss style
          if (s == 5) {
            ttHP.style.top = "-19.5px";
            ttHP.style.left = "-13.5px";
            ttHP.style.fontSize = "32px";
            ttHP.querySelector(".tt-text").style.bottom = "42.5px";
          }
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
        if (s == 5) {
          ttStat.style.fontSize = "18px";
          ttStat.querySelector(".tt-text").style.top = "292.5px";
        }
        enemy.appendChild(ttStat);

        // display boss resistances (>20%)
        if (eElementMult.some(num => num > 1.2)) {
          let enemyR20P = document.createElement("div");
          enemyR20P.className = "r20p";
          generateR20P(eElementMult, enemyR20P, s);
          enemy.appendChild(enemyR20P);
        }
        waveEnemies.appendChild(enemy);

        // display enemy stage description
        if (s == 5 && eID[2] == "3") {
          let enemyTraitDesc = currEnemy.desc;
          let enemyTraitPerf = currEnemy.perf;
          let enemyTraitMisc = currEnemy.misc;
          let traitHeader = document.getElementById("t-header");
          let traitDesc = document.getElementById("t-text");
          traitHeader.innerHTML = `Final BATTLE ${Math.min(nodeNum, nMax)}${modeNum == 2 && nodeNum >= nMax ? `.${variantNum}` : ``} Boss Traits`;
          traitDesc.innerHTML = buffData[eID + `dad${showSpoilers ? `` : `s`}`][enemyTraitDesc] + `<br>` +
                                buffData[eID + `dap${showSpoilers ? `` : `s`}`][enemyTraitPerf] +
                                `<li>When an extra score multiplier is active in this stage, the <span style="color:#f29e38;font-weight:bold;">Performance Points</span> cap will increase accordingly.</li>` +
                                (enemyTraitMisc != -1 ? `<br>` + buffData[eID + `dam`][enemyTraitMisc] : ``);
        }

        // change boss style
        if (s == 5) {
          waveEnemies.style.minHeight = "403.5px";
          waveEnemies.style.marginTop = "0px";
          enemyImg.style.height = enemyHover.style.height = "192px";
          enemyName.style.fontSize = enemyHP.style.fontSize = enemyDEF.style.fontSize = "14px";
        }
      }
      wave.appendChild(waveEnemies);
      side.appendChild(wave);
    }
  }

  // display enemy hp total
  document.getElementById("v-hp-e-raw").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][0][versionNum - 1]);
  document.getElementById("v-hp-e-aoe").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][1][versionNum - 1]);
  document.getElementById("v-hp-e-alt").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][2][versionNum - 1]);

  // display boss hp total
  document.getElementById("v-hp-h-raw").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][3][versionNum - 1]);
  document.getElementById("v-hp-h-alt").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][4][versionNum - 1]);

  // save current settings/page
  saveSettings();
  if (modeNum == 2) saveLastPage();
}

/* ----------------------------------------------------------------------- ENEMY INFO ----------------------------------------------------------------------- */

// display enemy weaknesses/resistances
function generateWR(eleMult, wr, s) {
  let wkImg1 = document.createElement("img"), wkImg2 = document.createElement("img"), wkImg3 = document.createElement("img");
  let rsImg1 = document.createElement("img"), rsImg2 = document.createElement("img"), rsImg3 = document.createElement("img");
  wkImg1.className = wkImg2.className = wkImg3.className = "wk";
  rsImg1.className = rsImg2.className = rsImg3.className = "rs";
  wkImg1.src = wkImg2.src = wkImg3.src = rsImg1.src = rsImg2.src = rsImg3.src = "../../assets/zzz/elements/none.webp";
  if (s == 5) wkImg1.style.height = wkImg2.style.height = wkImg3.style.height = rsImg1.style.height = rsImg2.style.height = rsImg3.style.height = "24px";
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
function generateR20P(eleMult, r20P, s) {
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
      if (s == 5) {
        rs20PHeader.style.fontSize = "16px";
        rs20PImg.style.height = "24px";
        rs20PMult.style.fontSize = "14px";
      }
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
  for (let e = 0; e < elementData.length - (versionNum < vWind); ++e) stats += `<span style="color:${color[e]};font-weight:bold;">${Math.round(anom * anomMult[e] * (1 / (2 - Math.min(eleMult[e], 1.2))) * (id[2] == "1" && e == 5 ? 46/45 : 1) * 100) / 100}</span>/` + (window.innerWidth < 1360 && e == 2 ? `<br>`: ``);
  stats = stats.slice(0, -1) + (tags.includes("no-freeze") ? `<br>(<span style="color:#98eff0;font-weight:bold;">UNFREEZABLE</span>)` : ``);
  return stats;
}

/* ----------------------------------------------------------------------- QOL & NAV ----------------------------------------------------------------------- */

// load saved settings/page
function loadSaveState() {
  currNumberFormat = localStorage.getItem("numberFormat") || "period";
  leaksToggle.checked = localStorage.getItem("leaksEnabled") == "true";
  spoilersToggle.checked = localStorage.getItem("spoilersEnabled") == "true";
  versionNumOld = versionNum = parseInt(localStorage.getItem("lastTSVersion") || vLive);
  nodeNum = parseInt(localStorage.getItem("lastTSNode") || 3);
  variantNum = parseInt(localStorage.getItem("lastTSVariant") || 1);
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
  localStorage.setItem("lastTSVersion", versionNum);
  localStorage.setItem("lastTSNode", nodeNum);
  localStorage.setItem("lastTSVariant", variantNum);
}

// go to top
function jumpToTop(e) {
  if (e == "body") { document.body.scrollTop = 0; document.documentElement.scrollTop = 0; }
  else { document.getElementById(e).scrollTop = 0; }
}

// go to bottom
function jumpToBottom(e) {
  if (e == "body") { document.body.scrollTop = document.body.scrollHeight; document.documentElement.scrollTop = document.documentElement.scrollHeight; }
  else { document.getElementById(e).scrollTop = document.getElementById(e).scrollHeight; }
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
  else if (e.key == "ArrowDown") { e.preventDefault(); !menuBarIsOpen && !versionSelectorIsOpen ? changeNode(-1) : null; }
  else if (e.key == "ArrowUp") { e.preventDefault(); !menuBarIsOpen && !versionSelectorIsOpen ? changeNode(1) : null; }
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
  versionSelectorHeader.innerHTML = `Hard Mode`;
  versionSelectorMain.innerHTML = ``;

  for (let m = 1; m <= 2; ++m) {
    // display allowed version selector options
    for (let v = 1; v <= (m == 2 ? (leaksToggle.checked ? versionIDs[m - 1].length : vLive) : 1); ++v) {
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
      optionName.innerHTML = currVersion.versionName + (m == 2 && v == vLive ? `<span style="color:#ff5555;font-weight:bold;"> (LIVE)</span>` : m == 2 && v >= vBeta ? `<span style="color:#6d9fff;font-weight:bold;"> (BETA)</span>` : ``);
      optionTime.innerHTML = currVersion.versionTime;
      optionID.innerHTML = `${m == 2 ? `Version: ${versionIDs[m - 1][v - 1].slice(0, 3)} Phase ${versionIDs[m - 1][v - 1].slice(4)} - ` : ``}ID: ${v}0${v == 1 ? m : 1}`;
      versionSelectorOption.appendChild(optionName);
      versionSelectorOption.appendChild(optionTime);
      versionSelectorOption.appendChild(optionID);
      m == 2 ? versionSelectorMain.appendChild(versionSelectorOption) : versionSelectorMisc.appendChild(versionSelectorOption);

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