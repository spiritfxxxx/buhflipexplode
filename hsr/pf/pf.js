/* ------------------------------------------------------------------------ MAIN PAGE ----------------------------------------------------------------------- */

let vLive = 25, vBeta = 27, v27 = 10, v43 = 24;
let leaksToggle = document.getElementById("lks");
let spoilersToggle = document.getElementById("spl");
let versionNum, nodeNum, chartNodeNum, currNumberFormat;
let menuIsOpen = versionSelectorIsOpen = chartIsOpen = false;

let versionData, enemyData, buffData, hpChart;
let versionBuffIDs, versionEnemies;
let versionIDs = [], versionNames = [], hpData = [];

// list of numbers thanks to HomDGCat's database
let nodeLvlData = [55, 65, 75, 85];
let nodeHPMult = [3481.1882760529406, 6868.576101117069, 11299.41583505203, 17508.514242099132];
let nodeSPDMult = [1, 1, 1.1, 1.2];
let elementsData = ["physical", "fire", "ice", "lightning", "wind", "quantum", "imaginary"];

// build & display main page
async function loadPage() {
  versionData = await (await fetch("pf-versions.json")).json();
  enemyData = await (await fetch("../../assets/hsr/enemies.json")).json();
  buffData = await (await fetch("../../assets/hsr/buffs.json")).json();
  versionIDs = Object.keys(versionData);
  loadHPData();
  loadSavedState();
  showVersion();
  changeNumberFormat();
}

// build hp database
function loadHPData() {
  hpData = Array.from({length: 5}, () => Array.from({length: 2}, () => Array.from({length: versionIDs.length}).fill(null)));
  for (let v = 1; v <= versionIDs.length; ++v) {
    let versionEnemies = versionData[versionIDs[v - 1]].versionEnemies;
    versionNames.push(`${versionData[versionIDs[v - 1]].versionName} (${versionIDs[v - 1]})`);
    for (let n = 1; n <= 4; ++n) {
      let currNode = versionEnemies.nodes[n - 1];
      let rawHP = aoeHP = 0;
      let rawHPStar = aoeHPStar = 0;

      // build enemy hp database
      for (let s = 1; s <= currNode.sides.length; ++s) {
        let currSide = currNode.sides[s - 1];
        for (let w = 1; w <= currSide.waves.length; ++w) {
          let currWave = currSide.waves[w - 1];
          let sideHPMult = currSide.sideHPMult[w - 1];
          for (let e = 1; e <= currWave.enemies.length; ++e) {
            let currEnemy = currWave.enemies[e - 1];
            let currEnemyID = currEnemy.id;
            let currEnemyCount = currEnemy.count;
            let currEnemyPhase = currEnemy.phase ? currEnemy.phase : 1;
            let currEnemyHPMult = currEnemy.hpMult ? currEnemy.hpMult : sideHPMult;
            let currEnemyData = enemyData[currEnemyID];
            let eHP = currEnemyData.baseHP * nodeHPMult[n - 1] * currEnemyPhase * currEnemyHPMult / 100;

            if (v >= v43 && n == 4 && s == 3) { rawHPStar += eHP * currEnemyCount; aoeHPStar += eHP * currEnemyCount * (v <= v27 ? 1 : (currEnemyID[2] != "0" ? 0.2 : 0.4)); }
            else { rawHP += eHP * currEnemyCount; aoeHP += eHP * currEnemyCount * (v <= v27 ? 1 : (currEnemyID[2] != "0" ? 0.2 : 0.4)); }
          }
        }
      }
      hpData[n - 1][0][v - 1] = Math.round(rawHP);
      hpData[n - 1][1][v - 1] = Math.round(aoeHP);
      if (v >= v43 && n == 4) { hpData[4][0][v - 1] = Math.round(rawHPStar); hpData[4][1][v - 1] = Math.round(aoeHPStar); }
    }
  }
}

// display version/time/id
function showVersion() {
  let currVersion = versionData[versionIDs[versionNum - 1]];
  versionBuffIDs = currVersion.versionBuffIDs;
  versionEnemies = currVersion.versionEnemies;
  document.getElementById("v-name").innerHTML = currVersion.versionName + (versionNum == vLive ? `<span style="color:#ff0000;font-weight:bold;"> (LIVE)</span>` : versionNum >= vBeta ? `<span style="color:#52a9f7;font-weight:bold;"> (BETA)</span>` : ``);
  document.getElementById("v-time").innerHTML = currVersion.versionTime;
  document.getElementById("v-id").innerHTML = `Version: ${versionIDs[versionNum - 1].slice(0, 3)} Phase ${versionIDs[versionNum - 1].slice(4)} - ID: 2${versionNum.toString().padStart(3, `0`)}`;
  showBuffs();
  showNode();
}
function changeVersion(n) {
  let maxVersion = leaksToggle.checked ? versionIDs.length : vLive;
  versionNum = (versionNum - 1 + n + maxVersion) % maxVersion + 1;
  showVersion();
}

// display node
function showNode() { document.getElementById("n-text").innerHTML = nodeNum; showEnemies(); }
function changeNode(n) { nodeNum = (nodeNum - 1 + n + 4) % 4 + 1; showNode(); }

// display chart node
function changeChartNode(n) { chartNodeNum = (chartNodeNum - 1 + n + 4) % 4 + 1; showHPChart(); }

// display buffs
function showBuffs() {
  document.querySelector(".b-name").innerHTML = buffData[versionBuffIDs[0][0]][0];
  document.querySelector(".b-desc").innerHTML = buffData[versionBuffIDs[0][0]][1];

  // display post revamp buffs
  document.getElementById("b1").style.minHeight = (versionNum > v27) ? (window.innerWidth > 1080 ? "284px" : "0px") : (window.innerWidth > 1080 ? "122.5px" : "143.5px");
  document.getElementById("b-conc").style.display = document.getElementById("b-surg").style.display = (versionNum > v27) ? "flex" : "none";

  if (versionNum > v27) {
    for (let buff = 1; buff <= versionBuffIDs[2].length; ++buff) {
      let b = document.getElementById(`b-${buff == 1 ? `conc` : `surg`}`);
      b.innerHTML = ``;
      let buffImg = document.createElement("img");
      let buffText = document.createElement("div");
      let buffName = document.createElement("div");
      let buffDesc = document.createElement("div");
      buffImg.className = "b-img";
      buffText.className = "b-text";
      buffName.className = "b-name";
      buffDesc.className = "b-desc";
      buffImg.src = `../../assets/hsr/buffs/${buff == 1 ? `conc` : `surg`}.webp`;
      buffName.innerHTML = buff == 1 ? `Concordant Truce` : `Surging Grit`;
      buffDesc.innerHTML = buffData[versionBuffIDs[2][buff - 1]];
      buffText.appendChild(buffName);
      buffText.appendChild(buffDesc);
      b.appendChild(buffImg);
      b.appendChild(buffText);
    }
  }

  // display node buffs
  let b2 = document.getElementById(`b2`);
  b2.innerHTML = ``;
  let buffTitle = document.createElement("div");
  buffTitle.className = "b-title";
  buffTitle.innerHTML = `Cacophony`;
  b2.appendChild(buffTitle);
  for (let buff = 1; buff <= versionBuffIDs[1].length; ++buff) {
    let buffOption = document.createElement("div");
    let buffImg = document.createElement("img");
    let buffText = document.createElement("div");
    let buffName = document.createElement("div");
    let buffDesc = document.createElement("div");
    buffOption.className = "b-option";
    buffImg.className = "b-img";
    buffText.className = "b-text";
    buffName.className = "b-name";
    buffDesc.className = "b-desc";
    buffOption.style.minHeight = (versionNum > v27) ? (window.innerWidth > 1080 ? "87.5px" : "0px") : (window.innerWidth > 1080 ? "65px" : "0px");
    buffImg.src = `../../assets/hsr/buffs/${buffData[versionBuffIDs[1][buff - 1]][1]}.webp`;
    buffName.innerHTML = buffData[versionBuffIDs[1][buff - 1]][0];
    buffDesc.innerHTML = buffData[versionBuffIDs[1][buff - 1]][2];
    buffText.appendChild(buffName);
    buffText.appendChild(buffDesc);
    buffOption.appendChild(buffImg);
    buffOption.appendChild(buffText);
    b2.appendChild(buffOption);
  }
}

// display enemies
function showEnemies() {
  let currNode = versionEnemies.nodes[nodeNum - 1];

  // display sides
  let side1 = document.getElementById("s1"), side2 = document.getElementById("s2"), side3 = document.getElementById("s3");
  side1.innerHTML = side2.innerHTML = side3.innerHTML = ``;
  document.getElementById("s3").style.display = !(versionNum >= v43 && nodeNum == 4) ? "none" : "flex";

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
    let sideHPMult = currSide.sideHPMult;
    hpMult.className = "s-hp-atk-mult";
    hpMult.innerHTML = `HP: <span style="color:#ff5555;">${sideHPMult[0]}%</span> - <span style="color:#ff5555;">${sideHPMult[1]}%</span> - <span style="color:#ff5555;">${sideHPMult[2]}%</span>`;
    sideHeader.appendChild(hpMult);

    // display side weaknesses/resistances
    let combW = document.createElement("div");
    combW.className = "wk";
    generateW(currSide != null ? currNode.sides[s - 1].sideElementMult : [1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2], combW);
    sideHeader.appendChild(combW);
    side.appendChild(sideHeader);

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
        let currEnemyCount = currEnemy.count;
        let currEnemyPhase = currEnemy.phase ? currEnemy.phase : 1;
        let currEnemyHPMult = sideHPMult[w - 1];
        let currEnemyData = enemyData[currEnemyID];

        // define enemy parameters
        let eTags = currEnemyData.tags;
        let eMods = currEnemyData.mods;
        let showEnemySpoilers = spoilersToggle.checked || !eTags.includes("spoiler");
        let eName = showEnemySpoilers ? currEnemyData.name : "SPOILER ENEMY";
        let eImg = showEnemySpoilers ? `../../assets/hsr/enemies/${currEnemyData.image}.webp` : `../../assets/hsr/enemies/spoiler.webp`;

        // define enemy stats
        let eHP = Math.round(currEnemyData.baseHP * nodeHPMult[nodeNum - 1] * currEnemyHPMult / 100);
        let eSPD = Math.round(currEnemyData.baseSPD * nodeSPDMult[nodeNum - 1]);
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

        // display enemy count (≥ 1)
        if (currEnemyCount > 1) {
          let enemyCount = document.createElement("div");
          enemyCount.className = "e-count";
          enemyCount.innerHTML = `x${currEnemyCount}`;
          enemyHover.appendChild(enemyCount);
        }

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
        if (sideHPMult[w - 1] != currEnemyHPMult) {
          let specificHPMult = document.createElement("div");
          specificHPMult.className = "e-hp-mult";
          specificHPMult.innerHTML = `[${currEnemyHPMult}%]`;
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
  document.getElementById("v-hp-raw").innerHTML = showNumberFormat(hpData[nodeNum - 1][0][versionNum - 1]) + (versionNum >= v43 && nodeNum == 4 ? ` + ${showNumberFormat(hpData[4][0][versionNum - 1])}` : ``);
  document.getElementById("v-hp-aoe").innerHTML = showNumberFormat(hpData[nodeNum - 1][1][versionNum - 1]) + (versionNum >= v43 && nodeNum == 4 ? ` + ${showNumberFormat(hpData[4][1][versionNum - 1])}` : ``);

  // save current page/settings
  saveProgress();
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
// !!!!!!!!!!!!!!!!!! DEFAULT TO LATEST PF 4 !!!!!!!!!!!!!!!!!!
function loadSavedState() {
  if (localStorage.getItem("leaksEnabled") == "true") leaksToggle.checked = true;
  if (localStorage.getItem("spoilersEnabled") == "true") spoilersToggle.checked = true;
  versionNum = parseInt(localStorage.getItem("lastPFVersion") || `${vLive}`);
  nodeNum = parseInt(localStorage.getItem("lastPFNode") || "4");
  chartNodeNum = parseInt(localStorage.getItem("lastPFChartNode") || "4");
  currNumberFormat = localStorage.getItem("numberFormat") || "period";
  if (!leaksToggle.checked) versionNum = Math.min(versionNum, vLive);
  saveProgress();
}

// save current page/settings
function saveProgress() {
  localStorage.setItem("lastPFVersion", versionNum);
  localStorage.setItem("lastPFNode", nodeNum);
  localStorage.setItem("lastPFChartNode", chartNodeNum);
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
    idDiv.innerHTML = `Version: ${versionIDs[v - 1].slice(0, 3)} Phase ${versionIDs[v - 1].slice(4)} - ID: 2${v.toString().padStart(3, `0`)}`;
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
  downloadButton.download = `Pure Fiction HP - Node ${chartNodeNum}`;
  downloadButton.click();
}

// build chart hp dataset
function generateHPDataset(label, data, color) {
  return { label, data, pointRadius: 2, borderWidth: 2, borderColor: color,
           segment: { borderColor: ctx => { return ctx.p0DataIndex >= 9 ? "#265af5" : color; } },
           pointHoverRadius: 4, pointHoverBorderWidth: 2, pointHoverBorderColor: color, backgroundColor: "#ffffff" };
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
  hpChart.data.labels = versionNames;
  hpChart.data.datasets = [ generateHPDataset("AOE HP", hpData[chartNodeNum - 1][1], "#6d9eeb") ];
  if (chartNodeNum == 4) hpChart.data.datasets.push(generateHPDataset("AOE 4-3 HP", hpData[4][1], "#6d9eeb"));
  hpChart.options.scales.y.min = 0;
  hpChart.options.scales.y.max = 140000000;
  hpChart.options.scales.y.ticks.stepSize = 10000000;
  hpChart.options.plugins.title.text = `Pure Fiction HP - Node ${chartNodeNum}`;
  hpChart.update();
  saveProgress();
}

/* ----------------------------------------------------------------------------- MAIN ----------------------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", async () => { await loadPage(); });