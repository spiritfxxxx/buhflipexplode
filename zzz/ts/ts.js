/* ------------------------------------------------------------------------ MAIN PAGE ----------------------------------------------------------------------- */

let vLive = 2, vBeta = 3, vPost = 2, vWind = 2, modeNumOld = 2, modeNum = 2;
let leaksToggle = document.getElementById("lks");
let spoilersToggle = document.getElementById("spl");
let versionNumOld, versionNum, nodeNum, nodeMax, endingNum, currNumberFormat;
let menuIsOpen = versionSelectorIsOpen = false;

let versionData, enemyData, buffData;
let versionBuffIDs, versionDazeMultBoss, versionDazeMultEnemy, versionAnomMultBoss, versionAnomMultEnemy, versionEnemies;
let versionIDs = [], hpData = [];

let nodeLvlData = [];
let nodeLvlDataEasy = [55, 58, 60, 65];
let nodeLvlDataHardPre26 = [60, 63, 65, 70, 70, 70];
let nodeLvlDataHardPost26 = [60, 65, 70, 70, 70];

// full list of numbers thanks to Dimbreath's database
let nodeHPMultBoss = [100,116,135,157,181,193,206,220,235,271,291,314,338,364,419,431,444,458,472,543,618,703,801,912,1049,1134,1227,1328,1437,1653,1792,1942,2106,2283,2626,2865,3126,3411,3722,4281,4717,5197,5727,6311,7258,7691,8151,8637,9153,10527,11227,11975,12772,13623,15667,15957,16252,16553,16860,19389,19716,20049,20387,20731,21081,21437,21799,22167,22541,24795];
let nodeHPMultEnemy = [100,116,135,157,181,193,206,220,235,271,291,314,338,364,419,431,444,458,472,543,618,703,801,912,1049,1111,1176,1246,1320,1518,1609,1706,1809,1919,2207,2320,2440,2566,2698,3103,3404,3734,4097,4494,5169,5591,6049,6544,7079,8141,8826,9569,10374,11246,12934,13260,13595,13938,14290,16434,16774,17121,17475,17837,18206,18583,18968,19361,19761,21738];
let nodeDEFMult = [100,108,116,124,132,142,152,164,176,188,200,214,228,242,258,274,290,306,324,344,362,382,402,422,444,466,490,512,536,562,586,612,638,666,694,722,750,780,810,842,872,904,938,970,1004,1038,1074,1110,1146,1184,1220,1258,1298,1338,1378,1418,1460,1502,1544,1588,1588,1588,1588,1588,1588,1588,1588,1588,1588,1588];
let nodeDazeMult = [100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,101,102,103,104,104,105,106,107,108,110,113,115,118,120,123,125,128,130,133,137,142,146,151,155,160,164,169,173,178,180,183,186,189,192,195,197,200,203,206,209,212,215,217,220,223,226,229,232,235];

let elementsData = ["ice", "fire", "electric", "ether", "physical", "wind"];

// build & display main page
async function loadPage() {
  versionData = await (await fetch("ts-versions.json")).json();
  enemyData = await (await fetch("../../assets/zzz/enemies.json")).json();
  buffData = await (await fetch("../../assets/zzz/buffs.json")).json();
  for (let m = 1; m <= 2; ++m) versionIDs.push(Object.keys(versionData[m - 1].versions));
  loadHPData();
  loadSavedState();
  showVersion();
  changeNumberFormat();
}

// build hp database
async function loadHPData() {
  hpData = [Array.from({length: 4}, () => Array.from({length: 5}, () => Array.from({length: 1}).fill(null))),
            Array.from({length: 6}, () => Array.from({length: 5}, () => Array.from({length: versionIDs[1].length}).fill(null))) ];
  for (let m = 1; m <= hpData.length; ++m) {
    for (let v = 1; v <= versionIDs[m - 1].length; ++v) {
      nodeLvlData = m == 1 ? nodeLvlDataEasy : (v < vPost ? nodeLvlDataHardPre26 : nodeLvlDataHardPost26);
      let versionEnemies = versionData[m - 1].versions[versionIDs[m - 1][v - 1]].versionEnemies;
      for (let n = 1; n <= versionEnemies.nodes.length; ++n) {
        let currNode = versionEnemies.nodes[n - 1];
        let raw60kEnemyHP = alt60kEnemyHP = rawHP = aoeHP = altHP = 0;
        let addAOE = true;

        let currEnemy = currNode.sides[0].waves[0].enemies[0];
        let currEnemyID = currEnemy.id;
        let currEnemyType = currEnemy.type;
        let currEnemyHPMult = currEnemy.hpMult ? currEnemy.hpMult : currNode.sides[0].sideHPMult;
        let currEnemyData = enemyData[currEnemyID];
        let eHP =  currEnemyData.baseHP[currEnemyType] * nodeHPMultBoss[nodeLvlData[n - 1] - 1] * currEnemyHPMult * 8.74 / 10000;
        let eTags = currEnemyData.tags;

        // calculate boss hp
        raw60kEnemyHP = eHP;
        alt60kEnemyHP += eHP * (currEnemyID[2] >= "2" && currEnemyData.baseDEF[currEnemyType] < 60 ? (794 + currEnemyData.baseDEF[currEnemyType] * 1588 / 100) / (794 + 60 * 1588 / 100) : 1);
        if (eTags.length >= 1 && !(eTags.length == 1 && eTags.includes("spoiler"))) {
          // define boss hp tags
          let impairHP = eTags.find(tag => /^impr.+$/.test(tag));
          let miasmaHP = eTags.find(tag => /^mias.+$/.test(tag));
          let shutdownHP = eTags.find(tag => /^shut.+$/.test(tag));
          let convertHP = eTags.find(tag => /^conv.+$/.test(tag));

          if (impairHP) alt60kEnemyHP -= eHP * impairHP.slice(7, 12) / 10000;
          if (miasmaHP) alt60kEnemyHP -= eHP * miasmaHP.slice(7, 12) / 10000;
          if (shutdownHP) alt60kEnemyHP -= eHP * shutdownHP.slice(7, 12) / 10000;
          if (convertHP) alt60kEnemyHP -= eHP * (convertHP.slice(7, 12) - convertHP.slice(13, 18)) / 10000;
        }

        // build enemy hp database
        for (let s = 2; s <= currNode.sides.length; ++s) {
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
              let eHP = currEnemyData.baseHP[currEnemyType] * nodeHPMultEnemy[nodeLvlData[n - 1] - 1] * currEnemyHPMult / 10000;
              let eTags = currEnemyData.tags;

              // calculate enemy hp
              rawHP += (currEnemyID != "14000" ? eHP : 1) * currEnemyCount;
              aoeHP += addAOE ? eHP : 0;
              altHP += addAOE ? eHP * (currEnemyID[2] >= "2" && currEnemyData.baseDEF[currEnemyType] < 60 ? (794 + currEnemyData.baseDEF[currEnemyType] * 1588 / 100) / (794 + 60 * 1588 / 100) : 1) : 0;
              if (eTags.length >= 1 && !(eTags.length == 1 && (eTags.includes("spoiler") || eTags.includes("hitch")))) {
                // define enemy hp tags
                let impairHP = eTags.find(tag => /^impr.+$/.test(tag));
                let miasmaHP = eTags.find(tag => /^mias.+$/.test(tag));
                let shutdownHP = eTags.find(tag => /^shut.+$/.test(tag));
                let convertHP = eTags.find(tag => /^conv.+$/.test(tag));

                if (eTags.includes("palicus")) altHP += eHP * 0.5;
                if (impairHP) altHP -= eHP * impairHP.slice(7, 12) / 10000;
                if (miasmaHP) altHP -= eHP * miasmaHP.slice(7, 12) / 10000;
                if (shutdownHP) altHP -= eHP * shutdownHP.slice(7, 12) / 10000;
                if (convertHP) altHP -= eHP * (convertHP.slice(7, 12) - convertHP.slice(13, 18)) / 10000;
              }
              addAOE = false;
            }
            addAOE = true;
          }
        }
        hpData[m - 1][n - 1][0][v - 1] = Math.round(raw60kEnemyHP);
        hpData[m - 1][n - 1][1][v - 1] = Math.round(alt60kEnemyHP);
        hpData[m - 1][n - 1][2][v - 1] = Math.round(rawHP);
        hpData[m - 1][n - 1][3][v - 1] = Math.round(aoeHP);
        hpData[m - 1][n - 1][4][v - 1] = Math.round(altHP);
      }
    }
  }
}

// display version/time/id
function showVersion() {
  let currVersion = versionData[modeNum - 1].versions[versionIDs[modeNum - 1][versionNum - 1]];
  versionBuffIDs = currVersion.versionBuffIDs;
  versionDazeMultBoss = currVersion.versionDazeMultBoss;
  versionDazeMultEnemy = currVersion.versionDazeMultEnemy;
  versionAnomMultBoss = currVersion.versionAnomMultBoss;
  versionAnomMultEnemy = currVersion.versionAnomMultEnemy;
  versionEnemies = currVersion.versionEnemies;
  document.getElementById("v-l").style.display = document.getElementById("v-r").style.display = modeNum == 2 ? "flex" : "none";
  document.getElementById("v-name").innerHTML = currVersion.versionName + (modeNum == 2 && versionNum == vLive ? `<span style="color:#ff0000;font-weight:bold;"> (LIVE)</span>` : versionNum >= vBeta ? `<span style="color:#52a9f7;font-weight:bold;"> (BETA)</span>` : ``);
  document.getElementById("v-time").innerHTML = currVersion.versionTime;
  document.getElementById("v-id").innerHTML = (modeNum == 2 ? `Version: ${versionIDs[modeNum - 1][versionNum - 1].slice(0, 3)} Phase ${versionIDs[modeNum - 1][versionNum - 1].slice(4)} - ` : ``) + `ID: ${versionNum}0${modeNum == 2 && versionNum == 1 ? `2` : `1`}`;
  showNode();
}
function changeVersion(n) {
  if (modeNum != 2) return;
  let maxVersion = leaksToggle.checked ? versionIDs[modeNum - 1].length : vLive;
  versionNum = (versionNum - 1 + n + maxVersion) % maxVersion + 1;
  showVersion();
}

// display node
function showNode() {
  if (modeNumOld != modeNum) {
    nodeNum = modeNum == 2 ? parseInt(localStorage.getItem("lastTSNode")) : versionEnemies.nodes.length;
    modeNumOld = modeNum;
  }
  if (modeNum == 2) changePrePostNode();
  nodeMax = versionNum < vPost ? 4 : 3;
  nodeLvlData = modeNum == 1 ? nodeLvlDataEasy : (versionNum < vPost ? nodeLvlDataHardPre26 : nodeLvlDataHardPost26);
  document.getElementById("n-text").innerHTML = Math.min(nodeNum, nodeMax);
  showEndings();
  showBuffs();
  showEnemies();
}
function changeNode(n) {
  if (modeNum == 2 && nodeNum > nodeMax) nodeNum = nodeMax;
  nodeNum = (nodeNum - 1 + n + nodeMax) % nodeMax + 1;
  if (modeNum == 2 && nodeNum == nodeMax) nodeNum += endingNum - 1;
  showNode();
}
function changePrePostNode() {
  if (versionNumOld < vPost && versionNum >= vPost) {
    if (nodeNum == 3 || (nodeNum >= nodeMax && nodeNum - nodeMax < 2)) nodeNum--;
    else if (nodeNum >= nodeMax && nodeNum - nodeMax >= 2) nodeNum = 4;
  }
  else if (versionNumOld >= vPost && versionNum < vPost && nodeNum >= 2) nodeNum++;
  versionNumOld = versionNum;
}

// final node's endings display
function showEndings() {
  if (versionNum >= vPost && endingNum > 2) endingNum = 2;
  if (modeNum == 2 && nodeNum >= nodeMax) {
    document.getElementById("end").style.display = "flex";
    document.getElementById("end-3").style.display = versionNum < vPost ? "flex" : "none";
    let endingButtons = document.querySelectorAll(".end-text");
    endingButtons.forEach(btn => btn.classList.toggle("selected", btn.dataset.format == endingNum));
  }
  else document.getElementById("end").style.display = "none";
}
function changeEndings(n) { endingNum = n; nodeNum = (versionNum < vPost ? 3 : 2) + n; showNode(); }

// display buffs
function showBuffs() {
  for (let buff = 1; buff <= versionBuffIDs[0].length; ++buff) {
    let b = document.getElementById(`b${buff}`);
    let buffImg = document.createElement("img");
    let buffName = document.createElement("div");
    let buffDesc = document.createElement("div");
    buffImg.className = "b-img";
    buffName.className = "b-name";
    buffDesc.className = "b-desc";
    b.innerHTML = ``;
    buffImg.src = `../../assets/zzz/buffs/${buffData[versionBuffIDs[nodeNum - 1][buff - 1]][1]}.webp`;
    buffName.innerHTML = buffData[versionBuffIDs[nodeNum - 1][buff - 1]][0];
    buffDesc.innerHTML = buffData[versionBuffIDs[nodeNum - 1][buff - 1]][2];
    b.appendChild(buffImg);
    b.appendChild(buffName);
    b.appendChild(buffDesc);
  }
}

// display enemies
function showEnemies() {
  let currNode = versionEnemies.nodes[nodeNum - 1];

  // display sides
  let sideB = document.getElementById("sb");
  let side1 = document.getElementById("s1"), side2 = document.getElementById("s2"), side3 = document.getElementById("s3"), side4 = document.getElementById("s4");;
  sideB.innerHTML = ``; side1.innerHTML = ``; side2.innerHTML = ``; side3.innerHTML = ``; side4.innerHTML = ``;

  // loop sides
  for (let s = 1; s <= currNode.sides.length; ++s) {
    let side = s == 1 ? sideB : s == 2 ? side1 : s == 3 ? side2 : s == 4 ? side3 : side4;
    let currSide = currNode.sides[s - 1];

    // display side title
    let sideHeader = document.createElement("div");
    sideHeader.className = "s-header";
    sideHeader.innerHTML = `${s == 1 ? `Final BATTLE` : s <= 4 ? `Required` : `Optional`} ${Math.min(nodeNum, nodeMax)}${modeNum != 2 || nodeNum < nodeMax ? `` : `.${nodeNum - nodeMax + 1}`}${s != 1 ? `-${s - 1}` : ``} Lv${nodeLvlData[nodeNum - 1]}`;

    // display side HP multiplier
    let hpMult = document.createElement("div");
    hpMult.className = "s-hp-daze-anom-mult";
    hpMult.innerHTML = `HP: <span style="color:#ff5555;">N/A</span> | Daze: <span style="color:#ffe599;">N/A</span> | Anom: <span style="color:#7b78ff;">N/A</span>`;
    sideHeader.appendChild(hpMult);

    // display side weaknesses/resistances
    if (s >= 2) {
      let combWR = document.createElement("div");
      combWR.className = "wr";
      generateWR(currSide != null ? currNode.sides[s - 1].sideElementMult : [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], combWR, null, 0);
      sideHeader.appendChild(combWR);
    }
    side.appendChild(sideHeader);

    if (!currSide) continue;
    let sideHPMult = currSide.sideHPMult, sideDazeMult = s == 1 ? versionDazeMultBoss[nodeNum - 1] : versionDazeMultEnemy;
    hpMult.innerHTML = `HP: <span style="color:#ff5555;">${sideHPMult}%</span> | Daze: <span style="color:#ffe599;">${sideDazeMult}%</span> | Anom: <span style="color:#7b78ff;">${s == 1 ? versionAnomMultBoss : versionAnomMultEnemy}%</span>`;

    // loop waves
    for (let w = 1; w <= currSide.waves.length; ++w) {
      let wave = document.createElement("div");
      wave.className = "w";

      // display wave title
      if (s >= 2) {
        let waveHeader = document.createElement("div");
        waveHeader.className = "w-num";
        waveHeader.innerHTML = `WAVE ${w}`;
        wave.appendChild(waveHeader);
      }

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
        let eName = showEnemySpoilers ? currEnemyData.name : (s == 1 ? "SPOILER BOSS" : "SPOILER ENEMY");
        let eImg = showEnemySpoilers ? `../../assets/zzz/enemies/${currEnemyData.image}.webp` : `../../assets/zzz/enemies/doppelganger-i.webp`;

        // define enemy stats
        let eHP = (s == 1 ? Math.floor : Math.round)((s == 1 ? 8.74 : 1) * currEnemyHPMult * currEnemyData.baseHP[currEnemyType] * (s == 1 ? nodeHPMultBoss : nodeHPMultEnemy)[nodeLvlData[nodeNum - 1] - 1] / 10000);
        let eDEF = Math.ceil(currEnemyData.baseDEF[currEnemyType] * nodeDEFMult[nodeLvlData[nodeNum - 1] - 1] / 100);
        let eDaze = currEnemyData.baseDaze[currEnemyType] * nodeDazeMult[nodeLvlData[nodeNum - 1] - 1] / 100;
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
        generateWR(eElementMult, enemyWR, currEnemyID, s);
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
            ttHP.innerHTML += lowDEF ? `<span style="font-weight:bold;">NORMALIZED to 953 DEF</span> → <span style="font-weight:bold;">×${Math.round(eHPNew / eHP * 100000) / 1000}%</span><br>`: ``;

            // define enemy hp tags
            let impairHP = eTags.find(tag => /^impr.+$/.test(tag));
            let miasmaHP = eTags.find(tag => /^mias.+$/.test(tag));
            let shutdownHP = eTags.find(tag => /^shut.+$/.test(tag));
            let convertHP = eTags.find(tag => /^conv.+$/.test(tag));

            if (eTags.includes("palicus")) {
              eHPNew -= eHP * 0.25;
              color = "#93c47d";
              ttHP.innerHTML += palicus(eHPNew) + `<br>`;
            }
            if (impairHP) {
              eHPNew -= eHP * impairHP.slice(7, 12) / 10000;
              color = "#ca9a00";
              ttHP.innerHTML += instant(color, "IMPAIRED!!", impairHP.slice(5, 6), impairHP.slice(7, 12) / 100, 0, "") + `<br>`;
            }
            if (miasmaHP) {
              eHPNew -= eHP * miasmaHP.slice(7, 12) / 10000;
              color = "#b4317b";
              ttHP.innerHTML += instant(color, "PURIFIED!!", miasmaHP.slice(5, 6), miasmaHP.slice(7, 12) / 100, 0, "") + `<br>`;
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
          }

          // change styling for bosses
          if (s == 1) {
            ttHP.style.top = "-19.5px";
            ttHP.style.left = "-13.5px";
            ttHP.style.fontSize = "32px";
            ttHP.querySelector(".tt-text").style.bottom = "42.5px";
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
        ttMiscStat.innerHTML = `+<span class="tt-text">${generateEnemyStats(currEnemyID, sideDazeMult / 100 * eDaze, eStunMult, eStunTime, (currEnemyID[2] == "3" ? versionAnomMultBoss : versionAnomMultEnemy) / 100 * eAnom, eElementMult, eMods)}</span>`;
        if (s == 1) ttMiscStat.querySelector(".tt-text").style.top = "292.5px";
        enemy.appendChild(ttMiscStat);

        // display enemy 40%+ resistances
        let enemyR = document.createElement("div");
        enemyR.className = "res-40plus";
        generateR(eElementMult, enemyR, s, currEnemyID, enemy);

        waveEnemies.appendChild(enemy);

        // change styling for bosses
        if (s == 1) {
          enemyImg.style.height = enemyHover.style.height = "192px";
          enemyName.style.fontSize = enemyHP.style.fontSize = enemyDEF.style.fontSize = "14px";
          waveEnemies.style.minHeight = "403.5px";
          waveEnemies.style.marginTop = "0px";
        }

        // add enemy stage description
        if (side == sideB && currEnemyID[2] == "3") {
          let currEnemyDesc = currEnemy.desc;
          let currEnemyPerf = currEnemy.perf;
          let currEnemyMisc = currEnemy.misc;
          let traitTitle = document.getElementById("t-title");
          let traitDesc = document.getElementById("t-desc");
          traitTitle.innerHTML = `Final BATTLE ${Math.min(nodeNum, nodeMax)}${modeNum != 2 || nodeNum < nodeMax ? `` : `.${nodeNum - nodeMax + 1}`}${s != 1 ? `-${s - 1}` : ``} Boss Traits`;
          traitDesc.innerHTML = buffData[currEnemyID + `dad${eTags.includes("spoiler") && !spoilersToggle.checked ? "s" : ""}`][currEnemyDesc] + `<br>` +
                                buffData[currEnemyID + `dap${eTags.includes("spoiler") && !spoilersToggle.checked ? "s" : ""}`][currEnemyPerf] +
                                `<li>When an extra score multiplier is active in this stage, the <span style="color:#ffaf2c;font-weight:bold;">Performance Points</span> cap will increase accordingly.</li><br>` +
                                (currEnemyMisc != -1 ? buffData[currEnemyID + `dam`][currEnemyMisc] : ``);
        }
      }
      wave.appendChild(waveEnemies);
      side.appendChild(wave);
    }
  }

  // display HP values
  document.getElementById("v-hp-raw-b").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][0][versionNum - 1]);
  document.getElementById("v-hp-alt-b").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][1][versionNum - 1]);
  document.getElementById("v-hp-raw-e").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][2][versionNum - 1]);
  document.getElementById("v-hp-aoe-e").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][3][versionNum - 1]);
  document.getElementById("v-hp-alt-e").innerHTML = showNumberFormat(hpData[modeNum - 1][nodeNum - 1][4][versionNum - 1]);

  // save current page/settings
  if (modeNum == 2) saveLastPage();
  saveSettings();
}

/* -------------------------------------------------------------------- INFO GENERATOR -------------------------------------------------------------------- */

// display weaknesses/resistances
function generateWR(mult, wr, id, s) {
  let weakImg1 = document.createElement("img");
  let weakImg2 = document.createElement("img");
  let resImg1 = document.createElement("img");
  let resImg2 = document.createElement("img");
  weakImg1.className = weakImg2.className = "wk";
  resImg1.className = resImg2.className = "res";
  weakImg1.src = weakImg2.src = "../../assets/zzz/elements/none.webp";
  resImg1.src = resImg2.src = "../../assets/zzz/elements/none.webp";
  if (s == 1) weakImg1.style.height = weakImg2.style.height = resImg1.style.height = resImg2.style.height = "24px";
  let wkCnt = resCnt = 0;
  for (let e = 0; e < elementsData.length - (modeNum == 2 && versionNum < vWind); ++e) {
    if (mult[e] < 1) { (wkCnt == 0 ? weakImg1 : weakImg2).src = `../../assets/zzz/elements/${elementsData[e]}.webp`; ++wkCnt;}
    else if (mult[e] > 1) { (resCnt == 0 ? resImg1 : resImg2).src = `../../assets/zzz/elements/${elementsData[e]}.webp`; ++resCnt; }
  }
  wr.appendChild(weakImg1);
  if (versionNum >= vWind && id == "24300") {
    let weakImg3 = document.createElement("img");
    weakImg3.className = "wk";
    weakImg3.src = "../../assets/zzz/elements/physical.webp";
    weakImg3.style.height = "24px";
    wr.appendChild(weakImg3);
  }
  wr.appendChild(weakImg2);
  wr.appendChild(resImg1);
  wr.appendChild(resImg2);
}

// display 40%+ resistances
function generateR(mult, r, s, id, enemy) {
  let hasRES = false;
  let bossRES = document.createElement("div");
  let resEle = document.createElement("div");
  bossRES.className = "e-res-title";
  resEle.className = "e-res-ele";
  bossRES.innerHTML = "Boss DMG RES";

  for (let e = 0; e < elementsData.length - (modeNum == 2 && versionNum < vWind); ++e) {
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
      if (s == 1) resImg.style.height = "24px";
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
function hitch(hp) {
  return `<span style="color:#ffffff;">✦</span><span class="tt-text">
          <span style="font-weight:bold;text-decoration:underline;">Hitchspiker</span><br>
          True <span style="color:#ff5555;font-weight:bold;">Raw HP</span>: <span style="color:#ff5555;font-weight:bold;">${showNumberFormat(hp)}</span><br><br>
          technically doesn't<br>need to be killed</span>`;
}
function palicus() { return `hit both 50% of the time</span>`; }
function instant(color, type, cnt, hpD, hpU, mech) { return `<span style="font-weight:bold;color:${color};">${type}</span> ${cnt} time(s) → <span style="font-weight:bold;">-${hpD}%</span> ${hpU != 0 ? `<br>${mech} → <span style="font-weight:bold;">+${hpU}%</span>` : ``}`; }

// display misc stats
function generateEnemyStats(id, daze, stun, time, anom, dmg, mods) {
  let anomMult = [1, 1, 1, 1, 1.2, 0.5];
  let color = ["#98eff0", "#ff5521", "#2eb6ff", "#fe437e", "#f0d12b", "#a6c5fd"];
  let stats = `<span style="font-weight:bold;">Max Daze: <span style="color:#ffe599;">${Math.round(daze * 10000) / 10000}</span></span><br>
              (<span style="color:#ffe599;font-weight:bold;">${stun}%</span> DMG for <span style="color:#ffe599;font-weight:bold;">${time}s</span>)<br><br>`;
  if (mods.includes("no-anom")) return stats + `<span style="font-weight:bold;">IMMUNE TO ANOMALY</span>`;
  else {
    stats += `<span style="font-weight:bold;">Min Anomaly Buildup:</span><br>`;
    for (let i = 0; i < elementsData.length - (modeNum == 2 && versionNum < vWind); ++i) stats += `<span style="color:${color[i]};font-weight:bold;">${Math.round(anom * (id[2] == "1" && i == 5 ? 46/45 : 1) * anomMult[i] * (1 / (2 - Math.min(dmg[i], 1.2))) * 100) / 100}</span>/` + (window.innerWidth < 1360 && i == 2 ? `<br>`: ``);
    stats = stats.slice(0, -1) + `<br>${mods.includes("no-freeze") ? `<span style="color:#98eff0;font-weight:bold;">UNFREEZABLE</span>` : ``}`;
  }
  return stats;
}

/* ------------------------------------------------------------ MISCELLANEOUS + QOL + NAVIGATION ------------------------------------------------------------ */

// load last page/settings
// !!!!!!!!!!!!!!!!!! DEFAULT TO LATEST TS 3.1 !!!!!!!!!!!!!!!!!!
function loadSavedState() {
  if (localStorage.getItem("leaksEnabled") == "true") leaksToggle.checked = true;
  if (localStorage.getItem("spoilersEnabled") == "true") spoilersToggle.checked = true;
  versionNum = parseInt(localStorage.getItem("lastTSVersion") || `${vLive}`);
  versionNumOld = versionNum;
  nodeNum = parseInt(localStorage.getItem("lastTSNode") || "3");
  endingNum = parseInt(localStorage.getItem("lastTSEnding") || "1");
  currNumberFormat = localStorage.getItem("numberFormat") || "period";
  if (!leaksToggle.checked) versionNum = Math.min(versionNum, vLive);
  saveLastPage();
  saveSettings();
}

// save current page/settings
function saveLastPage() {
  localStorage.setItem("lastTSVersion", versionNum);
  localStorage.setItem("lastTSNode", nodeNum);
  localStorage.setItem("lastTSEnding", endingNum);
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
  if (e.key == "Escape") { e.preventDefault(); versionSelectorIsOpen ? toggleVersionSelector() : toggleMenu(); }
  else if (e.key == "Enter" && !menuIsOpen && !versionSelectorIsOpen) { e.preventDefault(); jumpToTop(); }
  else if (e.key == " " && !menuIsOpen) { e.preventDefault(); toggleVersionSelector(); }
  else if (e.key == "ArrowLeft" && !menuIsOpen && !versionSelectorIsOpen) { e.preventDefault(); changeVersion(-1); }
  else if (e.key == "ArrowRight" && !menuIsOpen && !versionSelectorIsOpen) { e.preventDefault(); changeVersion(1); }
  else if (e.key == "ArrowUp" && !menuIsOpen && !versionSelectorIsOpen) { e.preventDefault(); changeNode(1); }
  else if (e.key == "ArrowDown" && !menuIsOpen && !versionSelectorIsOpen) { e.preventDefault(); changeNode(-1); }
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
  title.innerHTML = `Hard Mode`;
  row2.innerHTML = ``;

  // display allowed versions
  for (let m = 1; m <= 2; ++m) {
    for (let v = 1; v <= (m == 2 ? (leaksToggle.checked ? versionIDs[m - 1].length : vLive) : 1); ++v) {
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
      nameDiv.innerHTML = currVersion.versionName + (m == 2 && v == vLive ? `<span style="color:#ff0000;font-weight:bold;"> (LIVE)</span>` : m == 2 && v >= vBeta ? `<span style="color:#52a9f7;font-weight:bold;"> (BETA)</span>` : ``);
      timeDiv.innerHTML = currVersion.versionTime;
      idDiv.innerHTML = m == 2 ? `Version: ${versionIDs[m - 1][v - 1].slice(0, 3)} Phase ${versionIDs[m - 1][v - 1].slice(4)} - ID: ${v}0${v == 1 ? 2 : 1}` : `ID: 101`;
      versionButton.appendChild(nameDiv);
      versionButton.appendChild(timeDiv);
      versionButton.appendChild(idDiv);
      m != 2 ? row1.appendChild(versionButton) : row2.appendChild(versionButton);

      // go to version on click
      versionButton.onclick = () => {
        modeNum = m;
        versionNum = modeNum == 2 ? v : 1;
        toggleVersionSelector();
        showVersion();
      };
    }
  }

  gridContent.appendChild(row1);
  gridContent.appendChild(title);
  gridContent.appendChild(row2);
}

/* ----------------------------------------------------------------------------- MAIN ----------------------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", async () => { await loadPage(); });