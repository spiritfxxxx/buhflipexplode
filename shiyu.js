/* ------------------------------------------------------------------------ MAIN PAGE ----------------------------------------------------------------------- */

var versionNum, nodeNum, chartNodeNum, currNumberFormat;
var versionDazeMult, versionEnemies;

let cntNoLeaks = 30;
let versionData = null, enemyData = null, hpChart = null;
let versionIDs = [], hpData = [];
let nodeLvlData = [50, 53, 55, 58, 60, 65, 70];
let nodeHPMult = [32.13, 34.60, 40.80, 41.58, 46.04, 47.74, 54.06];
let nodeDefMult = [592, 649, 689, 751, 794, 794, 794];
let nodeDazeMult = [1.78, 1.86, 1.92, 2.00, 2.06, 2.20, 2.35];
let elementsData = ["ice", "fire", "electric", "ether", "physical"];

let leaksToggle = document.getElementById("lks");
let spoilersToggle = document.getElementById("spl");
let menuIsOpen = false, versionSelectorIsOpen = false, chartIsOpen = false;

/* load main page data from .json files, and display */
async function loadShiyuPage() {
  versionData = await (await fetch("/shiyu-assets/shiyu-versions.json")).json();
  enemyData = await (await fetch("/shiyu-assets/shiyu-enemies.json")).json();
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
    versionEnemies = versionData[versionIDs[v - 1]].versionEnemies;
    for (let n = 1; n <= 7; n++) {
      let currNode = versionEnemies.nodes[n - 1];
      let totalEnemyHP = 0, aoeEnemyHP = 0, altEnemyHP = 0;
      let addAOE = false;
      for (let s = 1; s <= 2; s++) {
        let currSide = currNode.sides[s - 1];
        for (let w = 1; w <= currSide.waves.length; w++) {
          let currWave = currSide.waves[w - 1];
          for (let e = 1; e <= currWave.enemies.length; e++) {
            let currEnemy = currWave.enemies[e - 1];
            let currEnemyData = enemyData[currEnemy.id];
            let eHP = currEnemy.hp;
            let eTags = currEnemyData.tags;
            for (let cnt = 1; cnt <= currEnemy.count; cnt++) {
              if (eTags.length >= 1 && !(eTags.length == 1 && eTags.includes("spoiler"))) {
                if (eTags.includes("palicus")) altEnemyHP += Math.ceil(eHP * 0.75);
                else if (eTags.includes("robot")) altEnemyHP += Math.ceil(eHP * 0.9);
                else if (eTags.includes("brute")) altEnemyHP += Math.ceil(eHP * 0.92);
                else if (eTags.includes("miasma")) altEnemyHP += Math.ceil(eHP * 0.85);
              }
              else altEnemyHP += !addAOE ? eHP : 0;
              totalEnemyHP += currEnemy.id != "14000" ? eHP : 1;
              aoeEnemyHP += !addAOE ? eHP : 0;
              addAOE = true;
            }
          }
          hp[n - 1][0][v - 1] = totalEnemyHP;
          hp[n - 1][1][v - 1] = aoeEnemyHP;
          if (n > 5) hp[n - 1][2][v - 1] = altEnemyHP;
          addAOE = false;
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
  versionEnemies = currVersionData.versionEnemies;
  document.getElementById("v-name").innerHTML = currVersionData.versionName;
  document.getElementById("v-time").innerHTML = currVersionData.versionTime;
  document.getElementById("b-name").innerHTML = currVersionData.buffName;
  document.getElementById("b-text").innerHTML = currVersionData.buffDesc;
  showEnemies();
}
async function prevVersion() { versionNum = versionNum == 1 ? (leaksToggle.checked ? versionIDs.length : cntNoLeaks) : versionNum - 1; await showVersion(); }
async function nextVersion() { versionNum = versionNum == (leaksToggle.checked ? versionIDs.length : cntNoLeaks) ? 1 : versionNum + 1; await showVersion(); }

/* ◁ node # ▷ display */
function showNode() { document.getElementById("n-text").innerHTML = nodeNum; showEnemies() }
function prevNode() { nodeNum = nodeNum == 1 ? 7 : nodeNum - 1; showNode(); }
function nextNode() { nodeNum = nodeNum == 7 ? 1 : nodeNum + 1; showNode(); }
/* chart ◁ ▷ display */
function showChartNode() { displayHPChart(chartNodeNum); }
function prevChartNode() { chartNodeNum = chartNodeNum == 1 ? 7 : chartNodeNum - 1; showChartNode(); }
function nextChartNode() { chartNodeNum = chartNodeNum == 7 ? 1 : chartNodeNum + 1; showChartNode(); }

/* place and display elements/enemies/weaknesses/resistances/HP/count on screen */
function showEnemies() {
  /* add side 1 & 2 displays */
  let side1 = document.querySelector("#s1");
  let side2 = document.querySelector("#s2");
  side1.innerHTML = ``;
  side2.innerHTML = ``;
  side1.style.height = nodeNum > 5 ? "750px" : "1275px";
  side2.style.height = nodeNum > 5 ? "750px" : "1275px";

  let currNode = versionEnemies.nodes[nodeNum - 1];
  for (let s = 1; s <= 2; s++) {
    let side = s == 1 ? side1 : side2;
    let currSide = currNode.sides[s - 1];

    /* add side x-x LvXX title */
    let sideHeader = document.createElement("div");
    sideHeader.className = "s-header";
    sideHeader.innerHTML = `${nodeNum}-${s} Lv${nodeLvlData[nodeNum - 1]}`;

    /* add side supposed equal HP multiplier */
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
        let eImg = showEnemySpoilers ? `/shiyu-assets/shiyu-enemy-images/${currEnemyData.image}.webp` : `/shiyu-enemy-images/doppelganger-i.webp`;

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
          enemyImg.className = "e-img";
          enemyName.className = "e-name";
          enemyHover.className = "e-hover";
          enemyImg.src = eImg;
          enemyImg.loading = "lazy";
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
          enemy.appendChild(enemyHP);

          /* add enemy specific HP multiplier (if no match side HP multiplier) */
          if (currEnemy.mult) {
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
  if (altEnemyHP == null || aoeEnemyHP == altEnemyHP) hideShowAltHP.style.display = "none";
  else {
    hideShowAltHP.style.display = "block";
    document.getElementById("n-hp-alt").innerHTML = numberFormat(altEnemyHP);
  }

  /* save current page + settings */
  saveProgress();
}

/* -------------------------------------------------------------------- INFO GENERATOR -------------------------------------------------------------------- */

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
  weakImg1.src = "/shiyu-assets/elements/none.webp";
  weakImg2.src = "/shiyu-assets/elements/none.webp";
  resImg1.src = "/shiyu-assets/elements/none.webp";
  resImg2.src = "/shiyu-assets/elements/none.webp";
  weakImg1.loading = "lazy";
  weakImg2.loading = "lazy";
  resImg1.loading = "lazy";
  resImg2.loading = "lazy";
  let wkCnt = 0, resCnt = 0;
  for (let i = 0; i < 5; i++) {
    if (mult[i] < 1 && wkCnt == 0) { weakImg1.src = `/shiyu-assets/elements/${elementsData[i]}.webp`; wkCnt++;}
    else if (mult[i] < 1 && wkCnt == 1) weakImg2.src = `/shiyu-assets/elements/${elementsData[i]}.webp`;
    else if (mult[i] > 1 && resCnt == 0) { resImg1.src = `/shiyu-assets/elements/${elementsData[i]}.webp`; resCnt++; }
    else if (mult[i] > 1 && resCnt == 1) resImg2.src = `/shiyu-assets/elements/${elementsData[i]}.webp`;
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
          technically doesn't need to be killed`;
}
function palicus(hp) {
  return `<span style="font-weight:bold;text-decoration:underline;">Palicus</span><br>
          <span style="color:#f6b26b;font-weight:bold;">Alt HP</span>: <span style="color:#93c47d;font-weight:bold;">${numberFormat(Math.ceil(hp * 75 / 100))}</span> x2
          <span style="font-weight:bold;">(assume 75% of its HP)</span><br><br>
          hit both 50% of the time<br>`;
}
function instant(color, type, name, hp, dmg, cnt) {
  return `<span style="font-weight:bold;text-decoration:underline;">${name}</span><br>
          <span style="color:#f6b26b;font-weight:bold;">Alt HP</span>: <span style="color:${color};font-weight:bold;">${numberFormat(Math.ceil(hp * (100 - dmg * cnt) / 100))}</span>
          <span style="font-weight:bold;">(assume ${100 - dmg * cnt}% of its HP)</span><br><br>
          <span style="font-weight:bold;"><span style="color:${color};">${type}</span></span> ${cnt} time(s)`;
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

/* load last saved page location + settings */
/* !!!!!!!!!!!!!!!!!! DEFAULT TO LATEST SHIYU 7 !!!!!!!!!!!!!!!!!! */
function loadSavedState() {
  versionNum = parseInt(localStorage.getItem("lastVersion") || `${cntNoLeaks}`);
  nodeNum = parseInt(localStorage.getItem("lastNode") || "7");
  chartNodeNum = parseInt(localStorage.getItem("lastChartNode") || "7");
  currNumberFormat = localStorage.getItem("numberFormat") || "period";
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

/* keyboard shortcuts to navigate main page */
document.addEventListener("keydown", (e) => {
  e.stopPropagation();
  if (e.key == "Escape") { e.preventDefault(); chartIsOpen ? toggleChart() : (versionSelectorIsOpen ? toggleVersionSelector() : toggleMenu()); }
  else if (e.key == " " && !menuIsOpen && !chartIsOpen) { e.preventDefault(); toggleVersionSelector(); }
  else if (e.key == "Backspace" && !menuIsOpen && !versionSelectorIsOpen) { e.preventDefault(); toggleChart(); }
  else if (e.key == "ArrowLeft" && !menuIsOpen && !chartIsOpen && !versionSelectorIsOpen) { e.preventDefault(); prevVersion(); }
  else if (e.key == "ArrowRight" && !menuIsOpen && !chartIsOpen && !versionSelectorIsOpen) { e.preventDefault(); nextVersion(); }
  else if (e.key == "ArrowUp") { e.preventDefault(); !menuIsOpen && !chartIsOpen && !versionSelectorIsOpen ? nextNode() : nextChartNode(); }
  else if (e.key == "ArrowDown") { e.preventDefault(); !menuIsOpen && !chartIsOpen && !versionSelectorIsOpen ? prevNode() : prevChartNode(); }
  return;
});

/* ------------------------------------------------------------------------ MENU BAR ----------------------------------------------------------------------- */

/* enables/disables menu bar */
function toggleMenu() {
  let menuBar = document.getElementById("mb");
  let menuBarOverlay = document.getElementById("mb-o");
  let fixedMenuButton = document.getElementById("open-mb-btn");
  if (menuIsOpen) {
    document.body.classList.remove("no-scroll");
    menuBar.style.display = "none";
    menuBarOverlay.style.display = "none";
    fixedMenuButton.style.display = "none";
  }
  else {
    document.body.classList.add("no-scroll");
    menuBar.style.display = "block";
    menuBarOverlay.style.display = "block";
    fixedMenuButton.style.display = "block";
  }
  menuIsOpen = !menuIsOpen;
}

/* highlights selected number format button and updates example number */
/* 2222222 2,222,222 2.222.222 */
function updateNumberFormat(e) {
  if (e) currNumberFormat = e.dataset.format;
  let ex = document.getElementById("ex-num");
  let numFormatButtons = document.querySelectorAll(".nfb");
  ex.innerHTML = numberFormat(2222222);
  numFormatButtons.forEach(btn => btn.classList.toggle("selected", btn.dataset.format == currNumberFormat));
  showNode();
  displayHPChart(chartNodeNum);
}
function numberFormat(num) {
  if (currNumberFormat == "comma") return num.toLocaleString("en-US");
  if (currNumberFormat == "period") return num.toLocaleString("de-DE");
  return num;
}

/* enables/disables leaks/spoilers slider + access */
leaksToggle.addEventListener("change", () => {
  if (!leaksToggle.checked) {
    spoilersToggle.checked = false;
    if (versionNum > cntNoLeaks) versionNum = cntNoLeaks;
  }
  showVersion();
});
spoilersToggle.addEventListener("change", () => {
  if (spoilersToggle.checked) leaksToggle.checked = true;
  showEnemies();
});

/* -------------------------------------------------------------------- VERSION SELECTOR -------------------------------------------------------------------- */

/* enables/disables version selector menu */
function toggleVersionSelector() {
  let versionSelector = document.getElementById("vs");
  let versionSelectorOverlay = document.getElementById("vs-o");
  if (versionSelectorIsOpen) {
    document.body.classList.remove("no-scroll");
    versionSelector.style.display = "none";
    versionSelectorOverlay.style.display = "none";
  }
  else {
    document.body.classList.add("no-scroll");
    versionSelector.style.display = "flex";
    versionSelectorOverlay.style.display = "block";
    displayVersionSelectorGrid();
  }
  versionSelectorIsOpen = !versionSelectorIsOpen;
}

/* displays version selector */
function displayVersionSelectorGrid() {
  let versionSelector = document.getElementById("vs");
  let gridContent = versionSelector.querySelector("#vg");
  gridContent.innerHTML = ``;

  /* loop enabled versions to add it to the selector */
  for (let v = 1; v <= (leaksToggle.checked ? versionIDs.length : cntNoLeaks); v++) {
    let currVersion = versionIDs[v - 1];
    let currVersionData = versionData[currVersion];

    /* create a new version selection button */
    let versionButton = document.createElement("div");
    let nameDiv = document.createElement("div");
    let timeDiv = document.createElement("div");
    versionButton.className = "vg-c";
    nameDiv.className = "vg-c-name";
    timeDiv.className = "vg-c-time";
    nameDiv.innerHTML = currVersionData.versionName;
    timeDiv.innerHTML = currVersionData.versionTime;
    versionButton.appendChild(nameDiv);
    versionButton.appendChild(timeDiv);

    /* make it clickable, and if clicked go to that version */
    versionButton.onclick = () => {
      versionNum = v;
      toggleVersionSelector();
      showVersion();
    };

    gridContent.appendChild(versionButton);
  }
}

/* ----------------------------------------------------------------------------- CHART ----------------------------------------------------------------------- */

/* enables/disables version menu */
function toggleChart() {
  let chart = document.getElementById("c");
  if (chartIsOpen) { document.body.classList.remove("no-scroll"); chart.style.display = "none"; }
  else { document.body.classList.add("no-scroll"); chart.style.display = "flex"; }
  chartIsOpen = !chartIsOpen;
}
/* download the chart with the middle button in the chart top bar */
function downloadChart() {
  let downloadButton = document.createElement("a");
  downloadButton.href = hpChart.toBase64Image("image/png", 1.0);
  downloadButton.download = `Shiyu Defense - Critical Node ${chartNodeNum}.webp`;
  downloadButton.click();
}
/* format 3 hp dataset */
function createHPDataset(label, data, color) {
  return { label, data, pointRadius: 2, borderWidth: 2, borderColor: color, pointHoverRadius: 4, pointHoverBorderWidth: 2, pointHoverBorderColor: color, backgroundColor: "#ffffff" };
}

function displayHPChart(chartNodeNum) {
  
  /* hp data to load, alt hp doesn't exist for chartNodeNum <= 5 */
  let labels = versionIDs;
  let datasets = [
    createHPDataset("Raw HP", hpData[chartNodeNum - 1][0], "#e06666"),
    createHPDataset("AOE HP", hpData[chartNodeNum - 1][1], "#6d9eeb"),
    chartNodeNum > 5 ? createHPDataset("Alt HP", hpData[chartNodeNum - 1][2], "#f6b26b") : null
  ].filter(Boolean);

  /* various plugins thanks to Chart.js documentation + videos + Stack Overflow + friends */

  /* position hover line highlighting respective hp points */
  const verticalHoverLine = {
    id: "verticalHoverLine",
    beforeDatasetsDraw(chart, args, plugins) {
      let { ctx, chartArea: {top, bottom, height} } = chart;
      ctx.save();
      for (let hp = 0; hp <= 2; hp++)
        chart.getDatasetMeta(hp).data.forEach((dataPoint, index) => {
          if (dataPoint.active == true) {
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
      let newLegend = chart.legend.fit;
      chart.legend.fit = function fit() { newLegend.bind(chart.legend)(); chart.legend.height += 15; }
    }
  };
  /* force hide tooltip + vertical hover line if moved out of ACTUAL chart area */
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
  
  /* position hover tooltip */
  Chart.Tooltip.positioners.cursor = function(elements, eventPosition) {
    if (!eventPosition) return false;
    let {top, bottom} = this.chart.chartArea;
    let {x, y} = eventPosition;
    y += y <= (top + bottom) / 3 ? 50 : -50;
    return {x, y};
  };

  /* update chart data if a chart is already loaded */
  if (hpChart) {
    hpChart.data.labels = labels;
    hpChart.data.datasets = datasets;
    hpChart.options.plugins.title.text = `Shiyu Defense: Critical Node ${chartNodeNum} HP`;
    hpChart.update();
  }
  else {
    hpChart = new Chart("hpChart", {
      /* import x-axis, y-axis, and plguin data */
      type: "line",
      data: { labels: labels, datasets: datasets }, plugins: [verticalHoverLine, legendPadding, hideTooltipOutside],

      /* add chart settings */
      options: {
        /* disable chart animations, fit to screen, detect cursor position, positioning */
        animation: false, responsive: true, maintainAspectRatio: false,
        interaction: { mode: "nearest", axis: "x", intersect: false },
        layout: { padding: {top: 10, bottom: 15, left: 10, right: 25} },
        
        /* add x/y-axis formatting */
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
            min: 0, max: 60000000,
            border: { display: false },
            grid: { color: function(context) { return context.tick.value % 10000000 == 0 ? "#888888" : "#444444"; } },
            ticks: {
              padding: 15, font: { family: "Inconsolata", size: 12 }, color: "#888888", stepSize: 5000000, 
              callback: function(value, index) { return index % 2 == 0 ? numberFormat(value) : ""; }
            }
          }
        },

        /* add chart title, legend, hover tooltip formatting */
        plugins: {
          title: { display: true, color: "#ffffff", font: { family: "Inconsolata", size: 20, weight: "bold" }, text: `Shiyu Defense: Critical Node ${chartNodeNum} HP` },
          legend: {
            labels: { usePointStyle: true, boxHeight: 8,
              font: { family: "Inconsolata", size: 14 },
              /* make legend element grayscale if disabled */
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
              /* add tooltip text colors */
              labelTextColor: function(context) { return context.dataset.borderColor; },
              label: function(context) { return context.dataset.label + ": " + numberFormat(context.parsed.y); }
            }
          }
        }
      }
    });
  }
  
  saveProgress();
}


/* ----------------------------------------------------------------------------- MAIN ----------------------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", async () => {
  await loadShiyuPage();
});