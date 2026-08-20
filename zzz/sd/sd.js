/* ------------------------------------------------------------------------ MAIN PAGE ----------------------------------------------------------------------- */

let vLive = 55, vBeta = 57, v25 = 38, v28 = 47, modeNumOld = 4, modeNum = 4;
let leaksToggle = document.getElementById("lks");
let spoilersToggle = document.getElementById("spl");
let chartDropdown = document.getElementById("c-dd");
let versionNumOld, versionNum, nodeNum, chartNodeNum, oldChartDisplayType, chartDisplayType, currNumberFormat;
let menuIsOpen = versionSelectorIsOpen = chartIsOpen = false;

let versionData, enemyData, buffData, hpChart;
let versionBuffMain, versionBuffIDs, versionDazeMult, versionAnomMult, versionEnemies;
let versionIDs = [], hpData = [];

let nodeLvlData = [];
let nodeLvlDataStable = [25, 28, 30, 33, 35, 38, 40, 43, 45, 50];
let nodeLvlDataDisputed = [40, 43, 45, 48, 50, 53, 55, 60];
let nodeLvlDataAmbush = [50, 53, 55, 60, 65];
let nodeLvlDataCriticalPre25 = [50, 53, 55, 58, 60, 65, 70];
let nodeLvlDataCriticalPost25 = [50, 55, 60, 65, 70];

// full list of numbers thanks to Dimbreath's database
let nodeHPMult = [100,116,135,157,181,193,206,220,235,271,291,314,338,364,419,431,444,458,472,543,618,703,801,912,1049,1134,1227,1328,1437,1653,1792,1942,2106,2283,2626,2865,3126,3411,3722,4281,4717,5197,5727,6311,7258,7691,8151,8637,9153,10527,11227,11975,12772,13623,15667,15957,16252,16553,16860,19389,19716,20049,20387,20731,21081,21437,21799,22167,22541,24795];
let nodeDEFMult = [100,108,116,124,132,142,152,164,176,188,200,214,228,242,258,274,290,306,324,344,362,382,402,422,444,466,490,512,536,562,586,612,638,666,694,722,750,780,810,842,872,904,938,970,1004,1038,1074,1110,1146,1184,1220,1258,1298,1338,1378,1418,1460,1502,1544,1588,1588,1588,1588,1588,1588,1588,1588,1588,1588,1588];
let nodeDazeMult = [100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,101,102,103,104,104,105,106,107,108,110,113,115,118,120,123,125,128,130,133,137,142,146,151,155,160,164,169,173,178,180,183,186,189,192,195,197,200,203,206,209,212,215,217,220,223,226,229,232,235];

let elementsData = ["ice", "fire", "electric", "ether", "physical", "wind"];

// build & display main page
async function loadPage() {
  versionData = await (await fetch("sd-versions.json")).json();
  enemyData = await (await fetch("../../assets/zzz/enemies.json")).json();
  buffData = await (await fetch("../../assets/zzz/buffs.json")).json();
  for (let m = 1; m <= 4; ++m) versionIDs.push(Object.keys(versionData[m - 1].versions));
  loadHPData();
  loadSavedState();
  showVersion();
  changeNumberFormat();
}

// build hp database
function loadHPData() {
  hpData = [Array.from({length: 10}, () => Array.from({length: 3}, () => Array.from({length: 1}).fill(null))),
            Array.from({length: 8}, () => Array.from({length: 3}, () => Array.from({length: 1}).fill(null))),
            Array.from({length: 5}, () => Array.from({length: 3}, () => Array.from({length: 1}).fill(null))),
            Array.from({length: 7}, () => Array.from({length: 3}, () => Array.from({length: versionIDs[3].length}).fill(null))) ];
  for (let m = 1; m <= hpData.length; ++m) {
    for (let v = 1; v <= versionIDs[m - 1].length; ++v) {
      nodeLvlData = m == 1 ? nodeLvlDataStable : m == 2 ? nodeLvlDataDisputed : m == 3 ? nodeLvlDataAmbush : (v < v25 ? nodeLvlDataCriticalPre25 : nodeLvlDataCriticalPost25);
      versionEnemies = versionData[m - 1].versions[versionIDs[m - 1][v - 1]].versionEnemies;
      for (let n = 1; n <= versionEnemies.nodes.length; ++n) {
        let currNode = versionEnemies.nodes[n - 1];
        let rawHP = aoeHP = altHP = 0;
        let addAOE = true;

        // build enemy hp database
        for (let s = 1; s <= currNode.sides.length; ++s) {
          let currSide = currNode.sides[s - 1];
          if (!currSide) continue;
          let sideHPMult = currSide.sideHPMult;
          for (let w = 1; w <= currSide.waves.length; ++w) {
            let currWave = currSide.waves[w - 1];
            for (let e = 1; e <= currWave.enemies.length; ++e) {
              let currEnemy = currWave.enemies[e - 1];
              let currEnemyID = currEnemy.id;
              let currEnemyType = currEnemy.type;
              let currEnemyCount = currEnemy.count;
              let currEnemyHPMult = currEnemy.hpMult ? currEnemy.hpMult : sideHPMult;
              let currEnemyData = enemyData[currEnemyID];
              let eHP = currEnemyData.baseHP[currEnemyType] * nodeHPMult[nodeLvlData[n - 1] - 1] * currEnemyHPMult / 10000;
              let eTags = currEnemyData.tags;

              // calculate enemy hp
              rawHP += (currEnemyID != "14000" ? eHP : 1) * currEnemyCount;
              aoeHP += addAOE ? eHP : 0;
              altHP += addAOE ? eHP * (currEnemyID[2] >= "2" && currEnemyData.baseDEF[currEnemyType] < 60 ? (794 + currEnemyData.baseDEF[currEnemyType] * 1588 / 100) / (794 + 60 * 1588 / 100) : 1) : 0;
              if (eTags.length >= 1 && !(eTags.length == 1 && (eTags.includes("spoiler") || eTags.includes("hitch")))) {
                if (eTags.includes("palicus")) altHP += eHP * 0.5;
                if (eTags.includes("robot")) altHP -= eHP * 0.1;
                if (eTags.includes("brute")) altHP -= eHP * 0.08;
                if (eTags.includes("miasma")) altHP -= eHP * (currEnemyID == "26202" ? 0.3 : 0.15);
                if (eTags.includes("shutdown")) altHP -= eHP * 0.15;
                if (eTags.includes("convert")) altHP += eHP * 0.05;
              }
              addAOE = false;
            }
            addAOE = true;
          }
        }
        hpData[m - 1][n - 1][0][v - 1] = Math.round(rawHP);
        hpData[m - 1][n - 1][1][v - 1] = Math.round(aoeHP);
        hpData[m - 1][n - 1][2][v - 1] = (m == 4 && (v < v25 ? n > 5 : n > 3)) || m != 3 ? Math.round(altHP) : null;
      }
    }
  }
}

// display version/time/id
function showVersion() {
  let currVersion = versionData[modeNum - 1].versions[versionIDs[modeNum - 1][versionNum - 1]];
  versionBuffMain = currVersion.versionBuffMain;
  versionBuffIDs = currVersion.versionBuffIDs;
  versionDazeMult = currVersion.versionDazeMult;
  versionAnomMult = currVersion.versionAnomMult;
  versionEnemies = currVersion.versionEnemies;
  document.getElementById("v-l").style.display = document.getElementById("v-r").style.display = modeNum == 4 ? "flex" : "none";
  document.getElementById("v-name").innerHTML = currVersion.versionName + ((modeNum == 4 && versionNum == vLive) ? `<span style="color:#ff0000;font-weight:bold;"> (LIVE)</span>` : (modeNum == 4 && versionNum >= vBeta) ? `<span style="color:#52a9f7;font-weight:bold;"> (BETA)</span>` : ``);
  document.getElementById("v-time").innerHTML = currVersion.versionTime;
  document.getElementById("v-id").innerHTML = `ID: 6${modeNum != 4 ? `1` : `2`}${(modeNum != 4 ? modeNum : versionNum).toString().padStart(3, `0`)}${versionNum >= vBeta ? `1` : ``}`;
  showNode();
}
function changeVersion(n) {
  if (modeNum != 4) return;
  let maxVersion = leaksToggle.checked ? versionIDs[modeNum - 1].length : vLive;
  versionNum = (versionNum - 1 + n + maxVersion) % maxVersion + 1;
  showVersion();
}

// display node
function showNode() {
  if (modeNumOld != modeNum) {
    nodeNum = modeNum == 4 ? parseInt(localStorage.getItem("lastSDNode")) : versionEnemies.nodes.length;
    modeNumOld = modeNum;
  }
  if (modeNum == 4) changePrePostNode();
  nodeLvlData = modeNum == 1 ? nodeLvlDataStable : modeNum == 2 ? nodeLvlDataDisputed : modeNum == 3 ? nodeLvlDataAmbush : (versionNum < v25 ? nodeLvlDataCriticalPre25 : nodeLvlDataCriticalPost25);
  document.getElementById("n-text").innerHTML = nodeNum;
  showBuffs();
  showEnemies();
}
function changeNode(n) { nodeNum = (nodeNum - 1 + n + versionEnemies.nodes.length) % versionEnemies.nodes.length + 1; showNode(); }
function changePrePostNode() {
  if (versionNumOld < v25 && versionNum >= v25) nodeNum = Math.floor((nodeNum + 2 + Math.floor(nodeNum / 7)) / 2);
  else if (versionNumOld >= v25 && versionNum < v25) nodeNum += Math.min(nodeNum - 1, 2);
  versionNumOld = versionNum;
}

// display chart node
function changeChartNode(n) {
  if (modeNum != 4) return;
  let chartNodeNumMax = chartDisplayType == "Pre 2.5" ? 7 : 5;
  chartNodeNum = (chartNodeNum - 1 + n + chartNodeNumMax) % chartNodeNumMax + 1;
  showHPChart();
}
function changePrePostChartNode() {
  if (oldChartDisplayType != chartDisplayType) {
    if (chartDisplayType == "Post 2.5") chartNodeNum = Math.floor((chartNodeNum + 2 + Math.floor(chartNodeNum / 7)) / 2);
    else chartNodeNum += Math.min(chartNodeNum - 1, 2);
    oldChartDisplayType = chartDisplayType;
  }
}

// display buffs
function showBuffs() {
  // display buff formatting
  let revamp = versionNum >= v25 && nodeNum == 5;
  document.getElementById("b").style.display = revamp ? "none" : "flex";
  document.getElementById("b1").style.display = document.getElementById("b2").style.display = document.getElementById("b3").style.display = revamp ? "flex" : "none";

  for (let s = 1; s <= versionBuffIDs.length; ++s) {
    let b = document.getElementById(revamp ? `b${s}` : `b`);
    let buffTitle = document.createElement("div");
    let buffName = document.createElement("div");
    let buffDesc = document.createElement("div");
    buffTitle.className = "b-title";
    buffName.className = "b-name";
    buffDesc.className = "b-desc";
    b.innerHTML = ``;
    buffTitle.innerHTML = `5-${s} Frontier Buff`;
    buffName.innerHTML = buffData[versionBuffIDs[(modeNum != 4 ? nodeNum : s) - 1]][0];
    buffDesc.innerHTML = buffData[versionBuffIDs[(modeNum != 4 ? nodeNum : s) - 1]][1];

    // display buff parts
    if (revamp || s == versionBuffMain || modeNum != 4) {
      if (revamp) b.appendChild(buffTitle);
      b.appendChild(buffName);
      b.appendChild(buffDesc);
      if (!revamp || modeNum != 4) break;
    }
  }
}

// display enemies
function showEnemies() {
  let currNode = versionEnemies.nodes[nodeNum - 1];

  // display sides
  let side1 = document.getElementById("s1"), side2 = document.getElementById("s2"), side3 = document.getElementById("s3");
  side1.innerHTML = side2.innerHTML = side3.innerHTML = ``;
  document.getElementById("bs3").style.display = !(versionNum >= v25 && nodeNum == 5) ? "none" : "flex";

  // change side height
  if (window.innerWidth > 1080) side1.style.minHeight = side2.style.minHeight = side3.style.minHeight = modeNum == 4 ? (versionNum >= v25 ? "1128.5px" : (nodeNum > 5 ? "663.5px" : "1128.5px")) : modeNum == 3 ? "431.5px" : modeNum == 2 ? "663.5px" : (nodeNum > 8 ? "663.5px" : "1128.5px");
  side1.style.marginTop = side2.style.marginTop = side3.style.marginTop = !(versionNum >= v25 && nodeNum == 5) ? "15px" : "30px";

  // loop sides
  for (let s = 1; s <= currNode.sides.length; ++s) {
    let side = s == 1 ? side1 : s == 2 ? side2 : side3;
    let currSide = currNode.sides[s - 1];

    // display side title
    let sideHeader = document.createElement("div");
    sideHeader.className = "s-header";
    sideHeader.innerHTML = `${nodeNum}-${s} Lv${nodeLvlData[nodeNum - 1]}`;

    // display side HP multiplier
    let hpMult = document.createElement("div");
    hpMult.className = "s-hp-daze-anom-mult";
    hpMult.innerHTML = `HP: <span style="color:#ff5555;">N/A</span> | Daze: <span style="color:#ffe599;">N/A</span> | Anom: <span style="color:#7b78ff;">N/A</span>`;
    sideHeader.appendChild(hpMult);

    // display side weaknesses/resistances
    let combWR = document.createElement("div");
    combWR.className = "wr";
    generateWR(currSide != null ? currNode.sides[s - 1].sideElementMult : [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], combWR);
    sideHeader.appendChild(combWR);
    side.appendChild(sideHeader);

    if (!currSide) continue;
    let sideHPMult = currSide.sideHPMult;
    hpMult.innerHTML = `HP: <span style="color:#ff5555;">${sideHPMult}%</span> | Daze: <span style="color:#ffe599;">${modeNum == 1 && nodeNum == 7 ? 97 : versionDazeMult}%</span> | Anom: <span style="color:#7b78ff;">${versionAnomMult}%</span>`;

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
        let currEnemyType = currEnemy.type;
        let currEnemyCount = currEnemy.count;
        let currEnemyHPMult = currEnemy.hpMult ? currEnemy.hpMult : sideHPMult;
        let currEnemyData = enemyData[currEnemyID];

        // define enemy parameters
        let eTags = currEnemyData.tags;
        let eMods = currEnemyData.mods;
        let showEnemySpoilers = spoilersToggle.checked || !eTags.includes("spoiler");
        let eName = showEnemySpoilers ? currEnemyData.name : "SPOILER ENEMY";
        let eImg = showEnemySpoilers ? `../../assets/zzz/enemies/${currEnemyData.image}.webp` : `../../assets/zzz/enemies/doppelganger-i.webp`;

        // define enemy stats
        let eHP = Math.round(currEnemyData.baseHP[currEnemyType] * nodeHPMult[nodeLvlData[nodeNum - 1] - 1] * currEnemyHPMult / 10000);
        let eDEF = Math.ceil(currEnemyData.baseDEF[currEnemyType] * nodeDEFMult[nodeLvlData[nodeNum - 1] - 1] / 100);
        let eDaze = currEnemyData.baseDaze[currEnemyType] * nodeDazeMult[nodeLvlData[nodeNum - 1] - 1] * (modeNum == 1 && nodeNum == 7 ? 0.97 : 1) / 100;
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

        // display enemy count (≥ 1)
        if (currEnemyCount > 1) {
          let enemyCount = document.createElement("div");
          enemyCount.className = "e-count";
          enemyCount.innerHTML = `x${currEnemyCount}`;
          enemyHover.appendChild(enemyCount);
        }

        // display enemy weaknesses/resistances
        let enemyWR = document.createElement("div");
        enemyWR.className = "wr";
        generateWR(eElementMult, enemyWR);
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

          if (eTags.includes("hitch")) {
            ttHP.innerHTML = hitch(eHP) + `<br>`;
            enemyHP.innerHTML = showNumberFormat(1);
          }
          else {
            let lowDEF = currEnemyID[2] >= "2" && currEnemyData.baseDEF[currEnemyType] < 60;
            let eHPNew = eHP * (lowDEF ? (794 + currEnemyData.baseDEF[currEnemyType] * 1588 / 100) / (794 + 60 * 1588 / 100) : 1);
            let color = "#ffffff";

            if (eTags.includes("palicus")) {
              eHPNew -= eHP * 0.25;
              color = "#93c47d";
              ttHP.innerHTML += palicus(eHPNew) + `<br>`;
            }
            if (eTags.includes("robot")) {
              eHPNew -= eHP * 0.1;
              color = "#ca9a00";
              ttHP.innerHTML += instant(color, "IMPAIRED!!", 2) + `<br>`;
            }
            if (eTags.includes("brute")) {
              eHPNew -= eHP * 0.08;
              color = "#ca9a00";
              ttHP.innerHTML += instant(color, "IMPAIRED!!", 1) + `<br>`;
            }
            if (eTags.includes("miasma")) {
              eHPNew -= eHP * (currEnemyID == "26202" ? 0.3 : 0.15);
              color = "#b4317b";
              ttHP.innerHTML += instant(color, "PURIFIED!!", currEnemyID == "26202" ? 2 : 1) + `<br>`;
            }
            if (eTags.includes("shutdown")) {
              eHPNew -= eHP * 0.15;
              color = "#b47ede";
              ttHP.innerHTML += instant(color, "SHUTDOWN!!", 1) + `<br>`;
            }
            if (eTags.includes("convert")) {
              eHPNew += eHP * 0.05;
              color = "#007bb8";
              ttHP.innerHTML += instant(color, "CONVERT!!", 1) + `<br>`;
            }

            // display tooltip text
            ttHP.innerHTML = alt(color, eName, eHPNew, eHP, lowDEF) + ttHP.innerHTML;
          }
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
        ttMiscStat.innerHTML = `+<span class="tt-text">${generateEnemyStats(versionDazeMult / 100 * eDaze, eStunMult, eStunTime, versionAnomMult / 100 * eAnom, eElementMult, eMods)}</span>`;
        enemy.appendChild(ttMiscStat);

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
  document.getElementById("v-hp-raw").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][0][versionNum - 1]);
  document.getElementById("v-hp-aoe").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][1][versionNum - 1]);
  document.getElementById("v-hp-alt").innerHTML = modeNum == 1 || modeNum == 2 || (modeNum == 4 && (v < v25 ? nodeNum > 5 : nodeNum > 3)) ? showNumberFormat(hpData[modeNum - 1][nodeNum - 1][2][versionNum - 1]) : showNumberFormat(hpData[modeNum - 1][nodeNum - 1][1][versionNum - 1]);

  // save current page/settings
  if (modeNum == 4) saveLastPage();
  saveSettings();
}

/* -------------------------------------------------------------------- INFO GENERATOR -------------------------------------------------------------------- */

// display weaknesses/resistances
function generateWR(mult, wr) {
  let weakImg1 = document.createElement("img");
  let weakImg2 = document.createElement("img");
  let resImg1 = document.createElement("img");
  let resImg2 = document.createElement("img");
  weakImg1.className = weakImg2.className = "wk";
  resImg1.className = resImg2.className = "res";
  weakImg1.src = weakImg2.src = "../../assets/zzz/elements/none.webp";
  resImg1.src = resImg2.src = "../../assets/zzz/elements/none.webp";
  let wkCnt = resCnt = 0;
  for (let e = 0; e < elementsData.length - ((modeNum == 3 || modeNum == 4) && versionNum < v28); ++e) {
    if (mult[e] < 1) { (wkCnt == 0 ? weakImg1 : weakImg2).src = `../../assets/zzz/elements/${elementsData[e]}.webp`; ++wkCnt;}
    else if (mult[e] > 1) { (resCnt == 0 ? resImg1 : resImg2).src = `../../assets/zzz/elements/${elementsData[e]}.webp`; ++resCnt; }
  }
  wr.appendChild(weakImg1);
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

  for (let e = 0; e < elementsData.length - ((modeNum == 3 || modeNum == 4) && versionNum < v28); ++e) {
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
function alt(color, name, hpNew, hp, def) {
  return `<span style="color:${color};">✦</span><span class="tt-text">
          <span style="font-weight:bold;text-decoration:underline;">${name}</span><br>
          <span style="color:#f6b26b;font-weight:bold;">Alt HP</span>: <span style="color:${color};font-weight:bold;">${showNumberFormat(Math.ceil(hpNew))}</span><br>
          <span style="font-weight:bold;">(${def ? `normalized → ` : ``}${Math.round(hpNew / hp * 1000) / 10}% of Base HP)</span><br><br>`;
}
function hitch(hp) {
  return `<span style="color:#ffffff;">✦</span><span class="tt-text">
          <span style="font-weight:bold;text-decoration:underline;">Hitchspiker</span><br>
          True <span style="color:#ff5555;font-weight:bold;">Raw HP</span>: <span style="color:#ff5555;font-weight:bold;">${showNumberFormat(hp)}</span><br><br>
          technically doesn't<br>need to be killed</span>`;
}
function palicus() { return `hit both 50% of the time</span>`; }
function instant(color, type, cnt) { return `<span style="font-weight:bold;"><span style="color:${color};">${type}</span></span> ${cnt} time(s)</span>`; }

// display misc stats
function generateEnemyStats(daze, stun, time, anom, dmg, mods) {
  let anomMult = [1, 1, 1, 1, 1.2, 0.5];
  let color = ["#98eff0", "#ff5521", "#2eb6ff", "#fe437e", "#f0d12b", "#a6c5fd"];
  let stats = `<span style="font-weight:bold;">Max Daze: <span style="color:#ffe599;">${Math.round(daze * 10000) / 10000}</span></span><br>
              (<span style="color:#ffe599;font-weight:bold;">${stun}%</span> DMG for <span style="color:#ffe599;font-weight:bold;">${time}s</span>)<br><br>`;
  if (mods.includes("no-anom")) return stats + `<span style="font-weight:bold;">IMMUNE TO ANOMALY</span>`;
  else {
    stats += `<span style="font-weight:bold;">Min Anomaly Buildup:</span><br>`;
    for (let i = 0; i < elementsData.length - ((modeNum == 3 || modeNum == 4) && versionNum < v28); ++i) stats += `<span style="color:${color[i]};font-weight:bold;">${Math.round(anom * anomMult[i] * (1 / (2 - Math.min(dmg[i], 1.2))) * 100) / 100}</span>/` + (window.innerWidth < 1360 && i == 2 ? `<br>`: ``);
    stats = stats.slice(0, -1) + `<br>${mods.includes("no-freeze") ? `<span style="color:#98eff0;font-weight:bold;">UNFREEZABLE</span>` : ``}`;
  }
  return stats;
}

/* ------------------------------------------------------------ MISCELLANEOUS + QOL + NAVIGATION ------------------------------------------------------------ */

// load last page/settings
// !!!!!!!!!!!!!!!!!! DEFAULT TO LATEST SD 5 !!!!!!!!!!!!!!!!!!
function loadSavedState() {
  if (localStorage.getItem("leaksEnabled") == "true") leaksToggle.checked = true;
  if (localStorage.getItem("spoilersEnabled") == "true") spoilersToggle.checked = true;
  versionNum = parseInt(localStorage.getItem("lastSDVersion") || `${vLive}`);
  versionNumOld = versionNum;
  nodeNum = parseInt(localStorage.getItem("lastSDNode") || "5");
  chartNodeNum = parseInt(localStorage.getItem("lastSDChartNode") || "5");
  chartDisplayType = localStorage.getItem("lastSDChartType") || "Post 2.5";
  oldChartDisplayType = chartDisplayType;
  chartDropdown.value = chartDisplayType;
  currNumberFormat = localStorage.getItem("numberFormat") || "period";
  if (!leaksToggle.checked) versionNum = Math.min(versionNum, vLive);
  saveLastPage();
  saveSettings();
}

// save current page/settings
function saveLastPage() {
  localStorage.setItem("lastSDVersion", versionNum);
  localStorage.setItem("lastSDNode", nodeNum);
  localStorage.setItem("lastSDChartNode", chartNodeNum);
  localStorage.setItem("lastSDChartType", chartDisplayType);
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
  title.innerHTML = `Critical Node`;
  row2.innerHTML = ``;

  // display allowed versions
  for (let m = 1; m <= 4; ++m) {
    for (let v = 1; v <= (m == 4 ? (leaksToggle.checked ? versionIDs[m - 1].length : vLive) : 1); ++v) {
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
      nameDiv.innerHTML = currVersion.versionName + (m == 4 && v == vLive ? `<span style="color:#ff0000;font-weight:bold;"> (LIVE)</span>` : m == 4 && v >= vBeta ? `<span style="color:#52a9f7;font-weight:bold;"> (BETA)</span>` : ``);
      timeDiv.innerHTML = currVersion.versionTime;
      idDiv.innerHTML = `ID: 6${m != 4 ? `1` : `2`}${(m != 4 ? m : v).toString().padStart(3, `0`)}${v >= vBeta ? `1` : ``}`;
      versionButton.appendChild(nameDiv);
      versionButton.appendChild(timeDiv);
      versionButton.appendChild(idDiv);
      m != 4 ? row1.appendChild(versionButton) : row2.appendChild(versionButton);

      // go to version on click
      versionButton.onclick = () => {
        modeNum = m;
        versionNum = modeNum == 4 ? v : 1;
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
  downloadButton.download = `Shiyu Defense HP - ${versionData[modeNum - 1].name}` + (modeNum == 4 ? ` ${chartNodeNum} - ${chartDisplayType}` : ``);
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
  if (modeNum == 4) changePrePostChartNode();
  chartDropdown.style.display = modeNum == 4 ? "flex" : "none";

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
  let labels = [], rawHPData = [], aoeHPData = [], altHPData = [];
  if (modeNum != 4) {
    document.getElementById("c-l").style.display = document.getElementById("c-r").style.display = "none";
    labels = Array.from({length: versionEnemies.nodes.length}, (_, n) => `Node ${n + 1}`);
    for (let n = 0; n < versionEnemies.nodes.length; ++n) {
      rawHPData.push(hpData[modeNum - 1][n][0][0]);
      aoeHPData.push(hpData[modeNum - 1][n][1][0]);
      altHPData.push(hpData[modeNum - 1][n][2][0]);
    }
    hpChart.options.plugins.title.text = `Shiyu Defense HP - ${versionData[modeNum - 1].name}`;
    hpChart.options.scales.y.min = 0;
    hpChart.options.scales.y.max = modeNum == 1 ? 7000000 : 21000000;
    hpChart.options.scales.y.ticks.stepSize = (hpChart.options.scales.y.max - hpChart.options.scales.y.min) / 14;
  }
  else {
    document.getElementById("c-l").style.display = document.getElementById("c-r").style.display = "flex";
    let startChartVersion = chartDisplayType == "Pre 2.5" ? 0 : v25 - 1;
    let endChartVersion = chartDisplayType == "Pre 2.5" ? v25 - 1 : versionIDs[modeNum - 1].length;
    let newHPData = hpData[modeNum - 1][chartNodeNum - 1].map(row => row.slice(startChartVersion, endChartVersion));
    labels = versionIDs[modeNum - 1].slice(startChartVersion, endChartVersion);
    rawHPData = newHPData[0];
    aoeHPData = newHPData[1];
    altHPData = newHPData[2];
    hpChart.options.plugins.title.text = `Shiyu Defense HP - Critical Node ${chartNodeNum} - ${chartDisplayType}`;
    hpChart.options.scales.y.min = chartDisplayType == "Pre 2.5" || chartNodeNum < 5 ? 0 : 70000000;
    hpChart.options.scales.y.max = chartDisplayType == "Pre 2.5" || chartNodeNum < 5 ? 70000000 : 210000000;
    hpChart.options.scales.y.ticks.stepSize = (hpChart.options.scales.y.max - hpChart.options.scales.y.min) / 14;
  }

  // global chart settings
  hpChart.data.labels = labels;
  hpChart.data.datasets = [
    generateHPDataset("Raw HP", rawHPData, "#e06666"),
    generateHPDataset("AOE HP", aoeHPData, "#6d9eeb"),
    modeNum == 1 || modeNum == 2 || (modeNum == 4 && (chartDisplayType == "Pre 2.5" ? chartNodeNum > 5 : chartNodeNum > 3)) ? generateHPDataset("Alt HP", altHPData, "#f6b26b") : null
  ].filter(Boolean);
  hpChart.update();
  if (modeNum == 4) saveLastPage();
  saveSettings();
}

/* ----------------------------------------------------------------------------- MAIN ----------------------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", async () => { await loadPage(); });