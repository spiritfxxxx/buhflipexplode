/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */

          // CHANGE FINAL DAZE MULT FOR SPECIFIC VERSION
          // CHANGE FINAL DAZE MULT FOR SPECIFIC VERSION
          // CHANGE FINAL DAZE MULT FOR SPECIFIC VERSION
          // CHANGE FINAL DAZE MULT FOR SPECIFIC VERSION
          // CHANGE FINAL DAZE MULT FOR SPECIFIC VERSION
          // CHANGE FINAL DAZE MULT FOR SPECIFIC VERSION
          // CHANGE FINAL DAZE MULT FOR SPECIFIC VERSION
          // CHANGE FINAL DAZE MULT FOR SPECIFIC VERSION
          // CHANGE FINAL DAZE MULT FOR SPECIFIC VERSION
          // CHANGE FINAL DAZE MULT FOR SPECIFIC VERSION
          // CHANGE FINAL DAZE MULT FOR SPECIFIC VERSION
          // CHANGE FINAL DAZE MULT FOR SPECIFIC VERSION
          // CHANGE FINAL DAZE MULT FOR SPECIFIC VERSION
          // 1, 1.15, 1.15, 1, 1, 1, 1
          // 1.2, 1, 1.2, 1, 1, 1, 1
          // 1, 1, 1, 1, 1, 1, 1
          // 1, 1, 1, 1, 1, 1, 1
          // 1, 1, 1, 1, 1, 1, 1
        
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- TEST ----------------------------------------------------------------------- */

// CHART
/*let myChart = new Chart("myChart", {
  type: "line",
  data: {},
  options: {}
});*/

// DOTTED LINE THINGY

/* Exports a CSV file containing unique enemies, their HP, and Daze for the current node */
async function exportShiyuCSVUnique() {
  if (!versionEnemies || !enemyData) {
    console.log("Data not loaded yet");
    return;
  }

  const nodes = versionEnemies.nodes;
  const currNode = nodes[nodeNum - 1];
  let data = [];

  // Loop through both sides of the current node
  for (let s = 0; s < 2; s++) {
    const currSide = currNode.sides[s];
    for (let w = 0; w < currSide.waves.length; w++) {
      const currWave = currSide.waves[w];
      if (!currWave.enemies) continue;

      // Loop through enemies in the current wave
      for (let e = 0; e < currWave.enemies.length; e++) {
        const currEnemy = currWave.enemies[e];
        const currEnemyID = currEnemy.id;
        const currEnemyType = currEnemy.type;
        const currEnemyData = enemyData[currEnemyID];
        const currEnemyDaze = currEnemyData.baseDaze;

        // Handle spoilers based on toggle
        const showEnemySpoilers = !currEnemyData.tags.includes("spoiler") || spoilersToggle.checked;
        const eName = showEnemySpoilers ? currEnemyData.name : "SPOILER ENEMY";

        // Calculate daze value (same as in showEnemies)
        const daze = currEnemyDaze[currEnemyType] * nodeDazeMult[nodeNum - 1];
        const formattedDaze = Math.round(versionDazeMult * daze * 100) / 10000; // Match display format

        // Add enemy to data array
        data.push({
          name: eName,
          hp: currEnemy.hp,
          daze: formattedDaze
        });
      }
    }
  }
  // Deduplicate by *name + hp + daze* instead of just name
  const uniqueData = Array.from(
    new Map(
      data.map(item => [`${item.name}_${item.hp}_${item.daze}`, item])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Generate CSV content without header, using numberFormat for HP and Daze
  const csv = uniqueData
    .map(e => `"${e.name.replace(/"/g, '""')}","${numberFormat(e.hp)}","${numberFormat(e.daze)}"`)
    .join('\n');

  // Create and download CSV file
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `62${String(versionNum).padStart(3, '0')}.csv`; // e.g., 62033.csv
  a.click();
  URL.revokeObjectURL(url);

  console.log(`CSV downloaded as 62${String(versionNum).padStart(3, '0')}.csv`);
  nextNode();
}





/* ------------------------------------------------------------------------ MAIN PAGE ----------------------------------------------------------------------- */

var versionNum, nodeNum, chartNodeNum, versionDazeMult, versionEnemies;
let cntNoLeaks = 30;

let versionData = null, enemyData = null;
let versionIDs = [], hpData = [];
let nodeLvlData = [50, 53, 55, 58, 60, 65, 70];
let nodeHPMult = [32.13, 34.60, 40.80, 41.58, 46.04, 47.74, 54.06];
let nodeDefMult = [592, 649, 689, 751, 794, 794, 794];
let nodeDazeMult = [1.78, 1.86, 1.92, 2.00, 2.06, 2.20, 2.35];

/* load main page data from .json files, and display */
async function loadShiyuPage() {
  versionData = await (await fetch("/shiyu-versions/versions.json")).json();
  enemyData = await (await fetch("/shiyu-enemies/enemies.json")).json();
  versionIDs = Object.keys(versionData);
  hpData = await buildHPData(versionIDs, enemyData);
  loadSavedState();
  await showVersion();
  showNode();
  showChartNode();
  updateNumberFormat();
}

/* create hp database using 3D matrix */
async function buildHPData(versionIDs, enemyData) {
  let hp = Array.from({length: 7}, () => Array.from({length: 3}, () => Array.from({length: versionIDs.length}).fill(null)));
  for (let v = 1; v <= versionIDs.length; v++) {
    versionEnemies = await (await fetch(`/shiyu-versions/${versionIDs[v - 1]}-shiyu.json`)).json();
    for (let n = 1; n <= 7; n++) {
      let currNode = versionEnemies.nodes[n - 1];
      let totalEnemyHP = 0, aoeEnemyHP = 0, altEnemyHP = 0;
      for (let s = 1; s <= 2; s++) {
        let aoeFlag = false;
        let currSide = currNode.sides[s - 1];
        for (let w = 1; w <= currSide.waves.length; w++) {
          let currWave = currSide.waves[w - 1];
          for (let e = 1; e <= currWave.enemies.length; e++) {
            let currEnemy = currWave.enemies[e - 1];
            let currEnemyData = enemyData[currEnemy.id];
            let eHP = currEnemy.hp;
            let eTags = currEnemyData.tags;
            for (let cnt = 1; cnt <= currEnemy.count; cnt++) {
              if (eTags.length >= 1) {
                if (eTags.includes("palicus")) altEnemyHP += Math.ceil(eHP * 0.75);
                else if (eTags.includes("robot")) altEnemyHP += Math.ceil(eHP * 0.9);
                else if (eTags.includes("brute")) altEnemyHP += Math.ceil(eHP * 0.92);
                else if (eTags.includes("miasma")) altEnemyHP += Math.ceil(eHP * 0.85);
              }
              else altEnemyHP += (!aoeFlag ? eHP : 0);
              totalEnemyHP += (currEnemy.id != "14000" ? eHP : 1);
              aoeEnemyHP += (!aoeFlag ? eHP : 0);
              aoeFlag = true;
            }
          }
          hp[n - 1][0][v - 1] = totalEnemyHP;
          hp[n - 1][1][v - 1] = aoeEnemyHP;
          if (n > 5) hp[n - 1][2][v - 1] = altEnemyHP;
          aoeFlag = false;
        }
      }
    }
  }
  return hp;
}

/* ◁ [version # + time] ▷ display */
async function showVersion() {
  let currVersion = versionIDs[versionNum - 1];
  let currVersionData = versionData[currVersion];
  versionDazeMult = currVersionData.versionDazeMult;
  versionEnemies = await (await fetch(`/shiyu-versions/${currVersion}-shiyu.json`)).json();
  document.getElementById("v-name").innerHTML = currVersionData.versionName;
  document.getElementById("v-time").innerHTML = currVersionData.versionTime;
  document.getElementById("b-name").innerHTML = currVersionData.buffName;
  document.getElementById("b-desc").innerHTML = currVersionData.buffDesc;
  showEnemies();
}
async function prevVersion() {
  versionNum = versionNum == 1 ? (leaksToggle.checked ? versionIDs.length : cntNoLeaks) : versionNum - 1;
  await showVersion();
}
async function nextVersion() {
  versionNum = versionNum == (leaksToggle.checked ? versionIDs.length : cntNoLeaks) ? 1 : versionNum + 1;
  await showVersion();
}

/* ◁ node # ▷ display */
function showNode() {
  document.getElementById("n-num").innerHTML = nodeNum;
  showEnemies();
}
function prevNode() {
  nodeNum = nodeNum == 1 ? 7 : nodeNum - 1;
  showNode();
}
function nextNode() {
  nodeNum = nodeNum == 7 ? 1 : nodeNum + 1;
  showNode();
}
/* chart ◁ node # ▷ display */
function showChartNode() {
  renderHPChart(chartNodeNum);
  saveProgress();
}
function prevChartNode() {
  chartNodeNum = chartNodeNum == 1 ? 7 : chartNodeNum - 1;
  showChartNode();
}
function nextChartNode() {
  chartNodeNum = chartNodeNum == 7 ? 1 : chartNodeNum + 1;
  showChartNode();
}

/* place and display elements/enemies/weaknesses/resistances/HP/count on screen */
function showEnemies() {
  /* add side 1 & 2 displays */
  let side1 = document.querySelector(".s1");
  let side2 = document.querySelector(".s2");
  side1.innerHTML = ``;
  side2.innerHTML = ``;

  let currNode = versionEnemies.nodes[nodeNum - 1];
  for (let s = 1; s <= 2; s++) {
    let side = (s == 1) ? side1 : side2;
    let currSide = currNode.sides[s - 1];

    /* add side x-x LvXX title */
    let sideHeader = document.createElement("div");
    sideHeader.className = "s-header";
    sideHeader.innerHTML = `${nodeNum}-${s} Lv${nodeLvlData[nodeNum - 1]}`;

    /* add side supposed equal HP multiplier */






    console.log("aa", currSide.sideHPMult);






    let combHPMult = document.createElement("div");
    combHPMult.className = "s-hp-daze-anom-mult";
    combHPMult.innerHTML = `HP: <span style="color:#ff5555;">${currSide.sideHPMult}%</span>
                          ${versionDazeMult != 100 ? ` | Daze: <span style="color:#ffe599;">${versionDazeMult}%</span>` : ``}`;
    sideHeader.appendChild(combHPMult);

    /* add side combined weaknesses/resistances */
    let combWR = document.createElement("div");
    let currSideElementMult = currSide.sideElementMult;
    combWR.className = "wr";
    generateWR(currSideElementMult, combWR);
    sideHeader.appendChild(combWR);
    side.appendChild(sideHeader);

    /* loop side's waves */
    for (let w = 1; w <= currSide.waves.length; w++) {
      let wave = document.createElement("div");
      wave.className = "w";

      /* add wave WAVE # title */
      let waveHeader = document.createElement("div");
      waveHeader.className = "w-num";
      waveHeader.innerHTML = `WAVE ${w}`;
      wave.appendChild(waveHeader);

      /* add wave enemy display */
      let currWave = currSide.waves[w - 1];
      let waveEnemies = document.createElement("div");
      waveEnemies.className = "w-e";

      /* loop wave's enemies */
      for (let e = 1; e <= currWave.enemies.length; e++) {
        let currEnemy = currWave.enemies[e - 1];
        let currEnemyID = currEnemy.id;
        let currEnemyType = currEnemy.type;
        let currEnemyData = enemyData[currEnemyID];

        /* define current enemy's parameters */
        let eTags = currEnemyData.tags;
        let eMods = currEnemyData.mods;
        let showEnemySpoilers = spoilersToggle.checked || !eTags.includes("spoiler");
        let eName = showEnemySpoilers ? currEnemyData.name : "SPOILER ENEMY";
        let eImg = showEnemySpoilers ? `/shiyu-enemies/${currEnemyData.image}.png` : `/shiyu-enemies/doppelganger-i.png`;

        /* define current enemy's various stats */
        let eHP = currEnemy.hp;
        let eDef = Math.ceil(currEnemyData.baseDef / 50 * nodeDefMult[nodeNum - 1]);
        let eDaze = currEnemyData.baseDaze[currEnemyType] * nodeDazeMult[nodeNum - 1];
        let eStunMult = currEnemyData.stunMult;
        let eStunTime = currEnemyData.stunTime;
        let eAnom = currEnemyData.baseAnom;
        let eElementMult = currEnemyData.elementMult;

        /* loop each enemy appearance */ 
        for (let cnt = 1; cnt <= currEnemy.count; cnt++) {
          /* add enemy display */
          let enemy = document.createElement("div");
          enemy.className = "e";
          
          let enemyImg = document.createElement("img");
          let enemyName = document.createElement("div");
          let enemyHover = document.createElement("div");
          enemyName.className = "e-name";
          enemyHover.className = "e-hover";
          enemyImg.src = eImg;
          enemyHover.appendChild(enemyImg);
          enemyName.innerHTML = eName;
          enemyHover.appendChild(enemyName);
          enemy.appendChild(enemyHover);

          let enemyWR = document.createElement("div");
          enemyWR.className = "wr";
          generateWR(eElementMult, enemyWR);
          enemy.appendChild(enemyWR);

          /* add enemy hp display */
          let enemyHP = document.createElement("div");
          enemyHP.className = "e-hp";
          enemyHP.innerHTML = numberFormat(eHP);
          /* add special enemy tooltip (if necessary) */
          if (eTags.length >= 1 && !(eTags.length == 1 && eTags.includes("spoiler"))) {
            let ttHP = document.createElement("div");
            ttHP.className = "tt-e-hp";
            if (eTags.includes("hitch")) {
              ttHP.innerHTML = `<span style="color:#ffffff;">✦</span><span class="tt-text">${hitch(eHP)}</span>`;
              enemyHP.innerHTML = numberFormat(1);
            }
            else if (eTags.includes("palicus"))
              ttHP.innerHTML = `<span style="color:#93c47d;">✦</span><span class="tt-text">${palicus(eHP)}</span>`;
            else if (eTags.includes("robot"))
              ttHP.innerHTML = `<span style="color:#ecce45;">✦</span><span class="tt-text">${instant("#ecce45", "IMPAIRED!!", eName, eHP, 5, 2)}</span>`;
            else if (eTags.includes("brute"))
              ttHP.innerHTML = `<span style="color:#ecce45;">✦</span><span class="tt-text">${instant("#ecce45", "IMPAIRED!!", eName, eHP, 8, 1)}</span>`;
            else if (eTags.includes("miasma"))
              ttHP.innerHTML = `<span style="color:#d4317b;">✦</span><span class="tt-text">${instant("#d4317b", "PURIFIED!!", eName, eHP, 15, 1)}</span>`;
            enemyHP.appendChild(ttHP);
          }











          console.log("aaaaaaaaaaaaaaaaaaaaaa", hpData[5][0][33], hpData[5][1][33], hpData[5][2][33]);
          let mult = document.createElement("div");
          mult.className = "e-hp";
          mult.innerHTML = `${Math.round(currEnemy.hp / nodeHPMult[nodeNum - 1] / currEnemyData.baseHP[currEnemyType] * 10000) / 100}%`;
          console.log(Math.round(currEnemy.hp / nodeHPMult[nodeNum - 1] / currEnemyData.baseHP[currEnemyType] * 10000) / 100);
          enemyHP.appendChild(mult);












          enemy.appendChild(enemyHP);

          /* add enemy specific HP multiplier (if no match side HP multiplier) */
          if (currEnemy.mult){
            let specificHPMult = document.createElement("div");
            specificHPMult.className = "e-hp-mult";
            specificHPMult.innerHTML = `[${currEnemy.mult}%]`;
            enemy.appendChild(specificHPMult);
          }

          /* add enemy def display */
          let enemyDef = document.createElement("div");
          enemyDef.className = "e-def";
          enemyDef.innerHTML = eDef;
          enemy.appendChild(enemyDef);

          /* add enemy misc stat tooltip */
          let ttMiscStat = document.createElement("div");
          ttMiscStat.className = "tt-e-stat";
          ttMiscStat.innerHTML = `<span style="color:#888888;">+</span><span class="tt-text">${generateEnemyStats(versionDazeMult / 100 * eDaze, eStunMult, eStunTime, eAnom, eElementMult, eMods)}</span>`;
          enemy.appendChild(ttMiscStat);

          waveEnemies.appendChild(enemy);
        }
      }
      wave.appendChild(waveEnemies);
      side.appendChild(wave);
    }
  }

  /* add total + aoe + alt HP display */
  let rawEnemyHP = hpData[nodeNum - 1][0][versionNum - 1];
  let aoeEnemyHP = hpData[nodeNum - 1][1][versionNum - 1];
  let altEnemyHP = hpData[nodeNum - 1][2][versionNum - 1];
  document.getElementById("n-hp-raw").innerHTML = numberFormat(rawEnemyHP);
  document.getElementById("n-hp-aoe").innerHTML = numberFormat(aoeEnemyHP);
  let hideShowAltHP = document.getElementById("hide-show-n-hp-alt");
  if (altEnemyHP == null) hideShowAltHP.style.display = "none";
  else {
    hideShowAltHP.style.display = "block";
    document.getElementById("n-hp-alt").innerHTML = numberFormat(altEnemyHP);
  }

  /* save current page + settings */
  saveProgress();
}

/* -------------------------------------------------------------------- INFO GENERATOR -------------------------------------------------------------------- */

let elementsData = ["ice", "fire", "electric", "ether", "physical"];

/* add 2 weakness/resistance display */
function generateWR(mult, wr) {
  let weakImg1 = document.createElement("img");
  let weakImg2 = document.createElement("img");
  let resImg1 = document.createElement("img");
  let resImg2 = document.createElement("img");
  weakImg1.className = "wk";
  weakImg2.className = "wk";
  resImg1.className = "res";
  resImg2.className = "res";
  weakImg1.src = "/elements/none.png";
  weakImg2.src = "/elements/none.png";
  resImg1.src = "/elements/none.png";
  resImg2.src = "/elements/none.png";
  let wkCnt = 0, resCnt = 0;
  for (let i = 0; i < 5; i++){
    if (mult[i] < 1 && wkCnt == 0){ weakImg1.src = `/elements/${elementsData[i]}.png`; wkCnt++;}
    else if (mult[i] < 1 && wkCnt == 1) weakImg2.src = `/elements/${elementsData[i]}.png`;
    else if (mult[i] > 1 && resCnt == 0){ resImg1.src = `/elements/${elementsData[i]}.png`; resCnt++; }
    else if (mult[i] > 1 && resCnt == 1) resImg2.src = `/elements/${elementsData[i]}.png`;
  }
  wr.appendChild(weakImg1);
  wr.appendChild(weakImg2);
  wr.appendChild(resImg1);
  wr.appendChild(resImg2);
}

/* add special enemy tooltip text */
function hitch(hp) {
  return `<span style="font-weight:bold;text-decoration:underline;">Hitchspiker</span><br>
          True <span style="color:#ff5555;font-weight:bold;">Raw HP</span>: <span style="color:#ff5555;font-weight:bold;">${numberFormat(hp)}</span><br><br>
          <span style="font-weight:bold;">technically doesn't need to be killed</span>`;
}
function palicus(hp) {
  return `<span style="font-weight:bold;text-decoration:underline;">Palicus</span><br>
          <span style="color:#f6b26b;font-weight:bold;">Alt HP</span>: <span style="color:#93c47d;font-weight:bold;">${numberFormat(Math.ceil(hp * 75 / 100))}</span> x2<br><br>
          <span style="font-weight:bold;">hit both 50% of the time</span><br>
          (assume 75% of its HP)`;
}
function instant(color, type, name, hp, dmg, cnt) {
  return `<span style="font-weight:bold;text-decoration:underline;">${name}</span><br>
          <span style="color:#f6b26b;font-weight:bold;">Alt HP</span>: <span style="color:${color};font-weight:bold;">${numberFormat(Math.ceil(hp * (100 - dmg * cnt) / 100))}</span><br><br>
          <span style="font-weight:bold;"><span style="color:${color};">${type}</span> ${cnt} time(s)</span><br>
          (assume ${100 - dmg * cnt}% of its HP)`;
}

/* add enemy stat tooltip text */
function generateEnemyStats(daze, stun, time, anom, dmg, mods) {
  let anomMult = [1, 1, 1, 1, 1.2];
  let color = ["#98eff0", "#ff5521", "#2eb6ff", "#fe437e", "#f0d12b"];
  let stats = `<span style="font-weight:bold;">Max Daze: <span style="color:#ffe599;">${Math.round(daze * 10000) / 10000}</span></span><br>
              (<span style="color:#ffe599;font-weight:bold;">${stun}%</span> DMG for <span style="color:#ffe599;font-weight:bold;">${time}s</span>)<br><br>`;
  if (mods.includes("no-anom")) return stats + `<span style="font-weight:bold;">IMMUNE TO ANOMALY</span>`;
  else {
    stats += `<span style="font-weight:bold;">Max Anomaly Buildup:</span><br>`;
    for (let i = 0; i < 5; i++) stats += `<span style="color:${color[i]};font-weight:bold;">${Math.round(anom * anomMult[i] * dmg[i] * 100) / 100}</span>/`;
    stats = stats.slice(0, -1) + `<br>${mods.includes("no-freeze") ? `<span style="color:#98eff0;font-weight:bold;">UNFREEZABLE</span>` : ``}`;
  }
  return stats;
}

/* ------------------------------------------------------------ MISCELLANEOUS + QOL + NAVIGATION ------------------------------------------------------------ */

var currNumberFormat;
let leaksToggle = document.getElementById("lks");
let spoilersToggle = document.getElementById("spl");

/* load last saved page location + settings */
/* !!!!!!!!!!!!!!!!!! DEFAULT TO LATEST SHIYU 7 !!!!!!!!!!!!!!!!!! */
function loadSavedState() {
  versionNum = parseInt(localStorage.getItem("lastVersion") || `${cntNoLeaks}`);
  nodeNum = parseInt(localStorage.getItem("lastNode") || "7");
  chartNodeNum = parseInt(localStorage.getItem("lastChartNode") || "7");
  currNumberFormat = localStorage.getItem("numberFormat") || "none";
  if (localStorage.getItem("leaksEnabled") == "true") leaksToggle.checked = true;
  if (localStorage.getItem("spoilersEnabled") == "true") spoilersToggle.checked = true;
}

/* save current page location + settings */
function saveProgress() {
  localStorage.setItem("lastVersion", versionNum);
  localStorage.setItem("lastNode", nodeNum);
  localStorage.setItem("lastChartNode", chartNodeNum);
  localStorage.setItem("numberFormat", currNumberFormat);
  localStorage.setItem("leaksEnabled", leaksToggle.checked);
  localStorage.setItem("spoilersEnabled", spoilersToggle.checked);
}

/* formats numbers properly with _ or , or . */
/* ex.: 1234567 1,234,567 1.234.567 */
function numberFormat(num) {
  if (currNumberFormat == "comma") return num.toLocaleString("en-US");
  if (currNumberFormat == "period") return num.toLocaleString("de-DE");
  return num;
}

/* highlights selected number format button and updates example number*/
function updateNumberFormat(e) {
  if (e) currNumberFormat = e.dataset.format;
  let ex = document.getElementById("ex-num");
  let numFormatButtons = document.querySelectorAll(".nfb");
  ex.innerHTML = numberFormat(2222222);
  numFormatButtons.forEach(btn => btn.classList.toggle("selected", btn.dataset.format == currNumberFormat));
  showNode();
}

/* enables/disables leaks slider + access */
leaksToggle.addEventListener("change", () => {
  if (!leaksToggle.checked && spoilersToggle.checked) spoilersToggle.checked = leaksToggle.checked;

  /* goes back to latest version if currently in leaked content*/
  if (!leaksToggle.checked && versionNum > cntNoLeaks) versionNum = cntNoLeaks;
  showVersion();
});
/* enables/disables spoilers slider + leaks access */
spoilersToggle.addEventListener("change", () => {
  /* turn on spoilers for leaks + spoilers, turn off for just leaks */
  if (spoilersToggle.checked && !leaksToggle.checked) leaksToggle.checked = spoilersToggle.checked;

  showVersion();
});

/* keyboard shortcuts to navigate main page */
document.addEventListener("keydown", (e) => {
  e.stopPropagation();
  /* prevent scrolling with the spacebar (it's annoying af) */
  if (e.code == "Space") e.preventDefault();

  /* close version selection if it's open & ESC pressed */
  if (versionSelectorIsOpen && e.key == "Escape") {
    e.preventDefault();
    toggleVersionSelector();
    return;
  }

  /* close chart if it's open & ESC pressed */
  if (chartIsOpen  && (e.key == "Escape" || e.key == "Backspace" || e.key == "ArrowLeft" || e.key == "ArrowRight" || e.key == "ArrowUp" || e.key == "ArrowDown")) {
    e.preventDefault();
    if (e.key == "Escape" || e.key == "Backspace") toggleChart();
    else if (e.key == "ArrowUp") nextChartNode();
    else if (e.key == "ArrowDown") prevChartNode();
    return;
  }

  /* close menu bar if it's open & ESC pressed */
  /* otherwise disable main page navigation buttons */
  if (menuIsOpen) {
    if (e.key == "Escape") toggleMenu();
    else if (e.key == " " || e.key == "ArrowLeft" || e.key == "ArrowRight" || e.key == "ArrowUp" || e.key == "ArrowDown") e.preventDefault();
    return;
  }

  /* main page navigation buttons */
  if (e.key == "Escape" || e.key == "Backspace" || e.key == "ArrowLeft" || e.key == "ArrowRight" || e.key == "ArrowUp" || e.key == "ArrowDown") {
    e.preventDefault();
    if (e.key == "Escape") toggleMenu();
    else if (e.key == "Backspace") toggleChart();
    else if (e.key == "ArrowLeft") prevVersion();
    else if (e.key == "ArrowRight") nextVersion();
    else if (e.key == "ArrowUp") nextNode();
    else if (e.key == "ArrowDown") prevNode();
  }
  return;
});

/* ---------------------------------------------------------- MENU BAR + VERSION SELECTOR + CHART ---------------------------------------------------------- */

let menuIsOpen = false;
let hpChart = null;
let chartIsOpen = false;

/* eneables/disables menu bar */
function toggleMenu() {
  /* menu bar + out-of-menu-bar screen darken */
  let menuBar = document.getElementById("mb");
  let overlay = document.getElementById("mb-o");
  /* ☰ button for main page, and when menu bar is open */
  let menuButton = document.getElementById("mb-btn");
  let fixedMenuButton = document.getElementById("open-mb-btn");

  if (menuIsOpen) {
    document.body.classList.remove("no-scroll");
    menuBar.style.display = "none";
    overlay.style.display = "none";
    menuButton.style.display = "block";
    fixedMenuButton.style.display = "none";
  }
  else {
    document.body.classList.add("no-scroll");
    menuBar.style.display = "block";
    overlay.style.display = "block";
    menuButton.style.display = "none";
    fixedMenuButton.style.display = "block";
  }
  menuIsOpen = !menuIsOpen;
}

/* -------------------------------------------------------------------- VERSION SELECTOR -------------------------------------------------------------------- */

let versionSelectorIsOpen = false;

/* enables/disables version menu */
function toggleVersionSelector() {
  /* version selector + out-of-version-selector screen darken */
  let versionSelector = document.getElementById("vs");
  let overlay = document.getElementById("vs-o");

  if (!versionSelectorIsOpen) {
    document.body.classList.add("no-scroll");
    versionSelector.style.display = "flex";
    overlay.style.display = "block";
    displayVersionSelectorGrid();
  }
  else {
    document.body.classList.remove("no-scroll");
    versionSelector.style.display = "none";
    overlay.style.display = "none";
  }
  versionSelectorIsOpen = !versionSelectorIsOpen;
}

/* displays version selector */
function displayVersionSelectorGrid() {
  let versionSelector = document.getElementById("vs");
  let gridContent = versionSelector.querySelector(".vg");
  //let closeBtn = document.getElementById("vs-x");
  let leaksEnabled = leaksToggle.checked;
  let versionCap = leaksEnabled ? versionIDs.length : cntNoLeaks;
  
  gridContent.innerHTML = ``;
  //closeBtn.onclick = toggleVersionSelector;

  /* loop enabled versions to add it to the selector */
  for (let v = 1; v <= versionCap; v++) {
    let currVersion = versionIDs[v - 1];
    let currVersionData = versionData[currVersion];
    let versionButton = document.createElement("div");
    let nameDiv = document.createElement("div");
    let timeDiv = document.createElement("div");

    /* create a new version selection button */
    versionButton.className = "vg-c";
    nameDiv.className = "vg-c-name";
    nameDiv.innerHTML = currVersionData.versionName;
    timeDiv.className = "vg-c-time";
    timeDiv.innerHTML = currVersionData.versionTime;
    versionButton.appendChild(nameDiv);
    versionButton.appendChild(timeDiv);

    /* make it clickable, and if clicked go to that version*/
    versionButton.onclick = () => {
      versionNum = v;
      showVersion();
      toggleVersionSelector();
    };

    gridContent.appendChild(versionButton);
  }
}

/* ----------------------------------------------------------------------------- CHART ----------------------------------------------------------------------- */

/* enables/disables version menu */
function toggleChart() {
  /* version selector + out-of-version-selector screen darken */
  //let closeBtn = document.getElementById("c-x");
  //closeBtn.onclick = toggleChart;
  let chart = document.getElementById("c");

  if (!chartIsOpen) {
    document.body.classList.add("no-scroll");
    chart.style.display = "flex";
  }
  else {
    document.body.classList.remove("no-scroll");
    chart.style.display = "none";
  }
  chartIsOpen = !chartIsOpen;
}

/* format 3 hp dataset */
function createHPDataset(label, data, color) {
  return { 
    label, data, pointRadius: 2, borderWidth: 2, borderColor: color,
    pointHoverRadius: 4, pointHoverBorderWidth: 2, pointHoverBorderColor: color, backgroundColor: "#ffffff"
  };
}

function renderHPChart(chartNodeNum) {

  /* position hover tooltip */
  Chart.Tooltip.positioners.cursor = function(elements, eventPosition) {
    if (!eventPosition) return false;
    const area = this.chart.chartArea;
    let {x, y} = eventPosition;
    y += (y <= (area.top + area.bottom) / 3) ? 50 : -50;
    return {x, y};
  };

  /* position hover line highlighting respective hp points */
  /* thanks to Chart.js documentation + videos */
  const verticalHoverLine = {
    id: "verticalHoverLine",
    beforeDatasetsDraw(chart, args, plugins){
      //const activeElements = chart.tooltip.getActiveElements();
      //if (!activeElements.length) return;
      const { ctx, chartArea: {top, bottom} } = chart; // height
      ctx.save();
      for (let i = 0; i <= 2; i++)
        chart.getDatasetMeta(i).data.forEach((dataPoint, index) => {
          if (dataPoint.active == true){
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

  /* add padding below legend */
  const legendPadding = {
    id: "legendPadding",
    beforeInit(chart) {
      const fit = chart.legend.fit;
      chart.legend.fit = function fitWithPadding() {
        fit.bind(chart.legend)();
        this.height += 15;
      };
    }
  };

  /* force hide tooltip + vertical hover line if moved out of ACTUAL chart area */
  const hideTooltipOutside = {
    id: "hideTooltipOutside",
    afterEvent(chart, args) {
      const event = args.event;
      const tooltip = chart.tooltip;
      const { x, y } = event;
      const { top, bottom, left, right } = chart.chartArea;

      if ((typeof x !== "number" || typeof y !== "number") || !tooltip) return;

      const isOutside = x < left || x > right || y < top || y > bottom;

      if (isOutside) {
        // clear tooltip if outside chart area
        tooltip.setActiveElements([]);
        chart.setActiveElements([]);
        tooltip.update();
        args.changed = true;
        hideTooltipOutside.hasHovered = false;
      }
      else if (!hideTooltipOutside.hasHovered) {
        hideTooltipOutside.hasHovered = true;
        // No need to reset dataset properties here unless you have a custom use
      }
    }
  };
  hideTooltipOutside.hasHovered = false;










  
  /* hp data to load, alt hp doesn't exist for chartNodeNum <= 5 */
  let labels = versionIDs;
  let datasets = [
    createHPDataset("Raw HP", hpData[chartNodeNum - 1][0], "#e06666"),
    createHPDataset("AOE HP", hpData[chartNodeNum - 1][1], "#6d9eeb"),
    chartNodeNum > 5 ? createHPDataset("Alt HP", hpData[chartNodeNum - 1][2], "#f6b26b") : false
  ].filter(Boolean);

  /* update chart data if a chart is already loaded */
  if (hpChart) {
    hpChart.data.labels = labels;
    hpChart.data.datasets = datasets;
    hpChart.options.plugins.title.text = `Shiyu Defense: Critical Node ${chartNodeNum} HP`;
    hpChart.update();
  }
  else {
    hpChart = new Chart("myChart", {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets
      },
      plugins: [verticalHoverLine, legendPadding, hideTooltipOutside],
      options: {
        animation: false,
        transitions: {
          active: {
            animation: false
          },
            show: { animation: false },
            hide: { animation: false }
        },
        maintainAspectRatio: true,
        devicePixelRatio: window.devicePixelRatio,
        interaction: { mode: "nearest", axis: "x", intersect: false },
        layout: { padding: 20 },
        scales: {
          x: {
            offset: true,
            ticks: {
              padding: 5,
              maxRotation: 0,
              callback: function(value, index) { return (index % 2 == 0) ? this.getLabelForValue(value) : ""; },
              font: { family: "Inconsolata", size: 12, weight: "bold" },
              color: "#888888"
            },
            grid: { color: "transparent" },
            border: { display: false }
          },
          y: {
            min: 0, max: 60000000,
            ticks: {
              padding: 15,
              stepSize: 5000000,
              callback: function(value) { return (value % 10000000 == 0) ? numberFormat(value) : ""; },
              font: { family: "Inconsolata", size: 12, weight: "bold" },
              color: "#888888"
            },
            grid: { color: function(context) { return (context.tick.value % 10000000 == 0) ? "#888888" : "#444444"; } },
            border: { display: false }
          }
        },
        plugins: {
          title: {
            display: true,
            color: "#ffffff",
            font: { family: "Inconsolata", size: 20, weight: "bold" },
            text: `Shiyu Defense: Critical Node ${chartNodeNum} HP`
          },
          legend: {
            display: true,
            labels: {
              usePointStyle: true,
              boxHeight: 8,
              color: "#ffffff",
              font: { family: "Inconsolata", size: 14 },
              generateLabels: function(chart) {
                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                labels.forEach((label, index) => {
                  const dataset = chart.data.datasets[label.datasetIndex];
                  if (!chart.isDatasetVisible(index)) {
                    label.fontColor = "#888888";
                    label.strokeStyle = "#888888";
                  }
                  else {
                    label.fontColor = dataset.borderColor;
                  }
                });
                return labels;
              },
            }
          },
          tooltip: {
            position: "cursor",
            usePointStyle: true,
            boxHeight: 8,
            borderWidth: 2,
            caretSize: 0,
            titleFont: { family: "Inconsolata", size: 12, weight: "bold", lineHeight: 0.75 },
            bodyFont: { family: "Inconsolata", size: 12 },
            callbacks: {
              labelTextColor: function(context) { return context.dataset.borderColor; },
              label: function(context) {
                let label = context.dataset.label + ": ";
                if (context.parsed.y !== null) {
                  label += numberFormat(context.parsed.y);
                }
                return label;
              }
            }
          }
        }
      }
    });
  }
}

function downloadChart() {
  const link = document.createElement("a");
  link.href = hpChart.toBase64Image("image/png", 1.0);
  link.download = `Shiyu Defense - Critical Node ${chartNodeNum}.png`;
  link.click();
}

/* ----------------------------------------------------------------------------- MAIN ----------------------------------------------------------------------- */

/* main page display */
window.addEventListener("DOMContentLoaded", async () => {
  await loadShiyuPage();
  /* Add a button to trigger CSV export */
  document.getElementById("export-csv-btn").addEventListener("click", exportShiyuCSVUnique);
  //buildAllVersionsHPChart();
});
