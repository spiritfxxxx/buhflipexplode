/* ------------------------------------------------------------------------ MAIN PAGE ----------------------------------------------------------------------- */

let vLive = 8, vBeta = 9;
let leaksToggle = document.getElementById("lks");
let spoilersToggle = document.getElementById("spl");
let chartDropdown = document.getElementById("c-dd");
let versionNum, chartDisplayType, currNumberFormat;
let menuIsOpen = versionSelectorIsOpen = chartIsOpen = false;

let versionData, enemyData, buffData, hpChart;
let versionBuffIDs, versionDebuffIDs, versionEnemies;
let versionIDs = [], versionNames = [], hpData = [];

// list of numbers thanks to HomDGCat's database
let nodeLvlData = [100, 120, 95, 95, 95];
let nodeHPMult = [45076.25016615051, 180305.000664104, 34915.78012807737, 34915.78012807737, 34915.78012807737];
let nodeSPDMult = [1.32, 1.5, 1.32, 1.32, 1.32];
let elementsData = ["physical", "fire", "ice", "lightning", "wind", "quantum", "imaginary"];

// build & display main page
async function loadPage() {
  versionData = await (await fetch("aa-versions.json")).json();
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
  hpData = Array.from({length: 3}, () => Array.from({length: versionIDs.length}).fill(null));
  for (let v = 1; v <= versionIDs.length; ++v) {
    let versionEnemies = versionData[versionIDs[v - 1]].versionEnemies;
    versionNames.push(`${versionData[versionIDs[v - 1]].versionName} (${versionIDs[v - 1]})`);

    // build enemy hp database
    for (let s = 1; s <= versionEnemies.sides.length; ++s) {
      let currSide = versionEnemies.sides[s - 1];
      let sideHPMult = currSide.sideHPMult;
      for (let w = 1; w <= currSide.waves.length; ++w) {
        let currWave = currSide.waves[w - 1];
        for (let e = 1; e <= currWave.enemies.length; ++e) {
          let currEnemy = currWave.enemies[e - 1];
          let currEnemyID = currEnemy.id;
          let currEnemyCount = currEnemy.count;
          let currEnemyPhase = currEnemy.phase ? currEnemy.phase : 1;
          let currEnemyHPMult = currEnemy.hpMult ? currEnemy.hpMult : sideHPMult;
          let currEnemyData = enemyData[currEnemyID];
          hpData[Math.min(s - 1, 2)][v - 1] += currEnemyData.baseHP * nodeHPMult[s - 1] * currEnemyPhase * currEnemyHPMult * currEnemyCount / 100;
        }
        hpData[Math.min(s - 1, 2)][v - 1] = Math.round(hpData[Math.min(s - 1, 2)][v - 1]);
      }
    }
  }
}

// display version/time/id
function showVersion() {
  let currVersion = versionData[versionIDs[versionNum - 1]];
  versionBuffIDs = currVersion.versionBuffIDs;
  versionDebuffIDs = currVersion.versionDebuffIDs;
  versionEnemies = currVersion.versionEnemies;
  document.getElementById("v-name").innerHTML = currVersion.versionName + (versionNum == vLive ? `<span style="color:#ff0000;font-weight:bold;"> (LIVE)</span>` : versionNum >= vBeta ? `<span style="color:#52a9f7;font-weight:bold;"> (BETA)</span>` : ``);
  document.getElementById("v-time").innerHTML = currVersion.versionTime;
  document.getElementById("v-id").innerHTML = `Version: ${versionIDs[versionNum - 1].slice(0, 3)} Phase ${versionIDs[versionNum - 1].slice(4)} - ID: ${versionNum}`;
  showBuffsDebuffs();
  showEnemies();
}
function changeVersion(n) {
  let maxVersion = leaksToggle.checked ? versionIDs.length : vLive;
  versionNum = (versionNum - 1 + n + maxVersion) % maxVersion + 1;
  showVersion();
}

// display buffs/debuffs
function showBuffsDebuffs() {
  // display buffs
  let b = document.getElementById(`b-c`);
  b.innerHTML = ``;
  let buffTitle = document.createElement("div");
  buffTitle.className = "bdb-title";
  buffTitle.innerHTML = `Checkmate's Arbital Quadrant`;
  b.appendChild(buffTitle);
  for (let buff = 1; buff <= versionBuffIDs.length; ++buff) {
    let buffOption = document.createElement("div");
    let buffImg = document.createElement("img");
    let buffText = document.createElement("div");
    let buffName = document.createElement("div");
    let buffDesc = document.createElement("div");
    buffOption.className = "b-option";
    buffImg.className = "b-img";
    buffText.className = "bdb-text";
    buffName.className = "bdb-name";
    buffDesc.className = "bdb-desc";
    buffImg.src = `../../assets/hsr/buffs/${buffData[versionBuffIDs[buff - 1]][1]}.webp`;
    buffName.innerHTML = buffData[versionBuffIDs[buff - 1]][0];
    buffDesc.innerHTML = buffData[versionBuffIDs[buff - 1]][2];
    buffText.appendChild(buffName);
    buffText.appendChild(buffDesc);
    buffOption.appendChild(buffImg);
    buffOption.appendChild(buffText);
    b.appendChild(buffOption);
  }

  // display debuffs
  for (let s = 1; s <= 5; ++s) {
    let db = document.getElementById(`db-${s <= 2 ? `c` : `k`}${s == 1 ? `-e` : s == 2 ? `-h` : s - 2}`);
    let debuffTitle = document.createElement("div");
    debuffTitle.className = "bdb-title";
    db.innerHTML = ``;
    debuffTitle.innerHTML = `${s <= 2 ? `Checkmate${s == 2 ? `: Zugzwang` : ``}` : `Knight ${`I`.repeat(s - 2)}`} Debuffs`;
    db.appendChild(debuffTitle);
    for (let debuff = 1; debuff <= versionDebuffIDs[s - 1].length; ++debuff) {
      let debuffText = document.createElement("div");
      let debuffName = document.createElement("div");
      let debuffDesc = document.createElement("div");
      debuffText.className = "bdb-text";
      debuffName.className = "bdb-name";
      debuffDesc.className = "bdb-desc";
      debuffName.innerHTML = buffData[versionDebuffIDs[s - 1][debuff - 1]][0];
      debuffDesc.innerHTML = buffData[versionDebuffIDs[s - 1][debuff - 1]][1];
      debuffText.appendChild(debuffName);
      debuffText.appendChild(debuffDesc);
      db.appendChild(debuffText);
    }
  }
}

// display enemies
function showEnemies() {
  // display sides
  let checkmateEasy = document.getElementById("s-c-e"), checkmateHard = document.getElementById("s-c-h");
  let knightSide1 = document.getElementById("s-k1"), knightSide2 = document.getElementById("s-k2"), knightSide3 = document.getElementById("s-k3");
  checkmateEasy.innerHTML = ``; checkmateHard.innerHTML = ``;
  knightSide1.innerHTML = ``; knightSide2.innerHTML = ``; knightSide3.innerHTML = ``;

  // loop sides
  for (let s = 1; s <= versionEnemies.sides.length; ++s) {
    let side = s == 1 ? checkmateEasy : s == 2 ? checkmateHard : s == 3 ? knightSide1 : s == 4 ? knightSide2 : knightSide3;
    let currSide = versionEnemies.sides[s - 1];

    // display side title
    let sideHeader = document.createElement("div");
    sideHeader.className = "s-header";
    sideHeader.innerHTML = (s == 1 ? `Checkmate` : s == 2 ? `Checkmate: Zugzwang` : `Knight ${"I".repeat(s - 2)}`) + ` Lv${nodeLvlData[s - 1]}`;

    // display side HP multiplier
    let hpMult = document.createElement("div");
    let sideHPMult = currSide.sideHPMult;
    hpMult.className = "s-hp-atk-mult";
    hpMult.innerHTML = `HP: <span style="color:#ff5555;">${sideHPMult}%</span>`;
    sideHeader.appendChild(hpMult);

    // display side weaknesses/resistances
    let combW = document.createElement("div");
    combW.className = "wk";
    generateW(currSide != null ? versionEnemies.sides[s - 1].sideElementMult : [1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2], combW);
    sideHeader.appendChild(combW);
    side.appendChild(sideHeader);

    // change long checkmate height
    if (currSide.waves.length >= 3) checkmateEasy.style.marginBottom = checkmateHard.style.marginBottom = "30px";

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
        let currEnemyHPMult = currEnemy.hpMult ? currEnemy.hpMult : sideHPMult;
        let currEnemyData = enemyData[currEnemyID];

        // define enemy parameters
        let eTags = currEnemyData.tags;
        let eMods = currEnemyData.mods;
        let showEnemySpoilers = spoilersToggle.checked || !eTags.includes("spoiler");
        let eName = showEnemySpoilers ? currEnemyData.name : "SPOILER ENEMY";
        let eImg = showEnemySpoilers ? `../../assets/hsr/enemies/${currEnemyData.image}.webp` : `../../assets/hsr/enemies/spoiler.webp`;

        // define enemy stats
        let eHP = Math.round(currEnemyData.baseHP * nodeHPMult[s - 1] * currEnemyHPMult / 100);
        let eSPD = Math.round(currEnemyData.baseSPD * nodeSPDMult[s - 1]);
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
  document.getElementById("k-hp-raw").innerHTML = showNumberFormat(hpData[2][versionNum - 1]);
  document.getElementById("c-hp-raw-e").innerHTML = showNumberFormat(hpData[0][versionNum - 1]);
  document.getElementById("c-hp-raw-h").innerHTML = showNumberFormat(hpData[1][versionNum - 1]);

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
// !!!!!!!!!!!!!!!!!! DEFAULT TO LATEST AA !!!!!!!!!!!!!!!!!!
function loadSavedState() {
  if (localStorage.getItem("leaksEnabled") == "true") leaksToggle.checked = true;
  if (localStorage.getItem("spoilersEnabled") == "true") spoilersToggle.checked = true;
  versionNum = parseInt(localStorage.getItem("lastAAVersion") || `${vLive}`);
  chartDisplayType = localStorage.getItem("lastAAChartType") || "Knight + Checkmate";
  chartDropdown.value = chartDisplayType;
  currNumberFormat = localStorage.getItem("numberFormat") || "period";
  if (!leaksToggle.checked) versionNum = Math.min(versionNum, vLive);
  saveProgress();
}

// save current page/settings
function saveProgress() {
  localStorage.setItem("lastAAVersion", versionNum);
  localStorage.setItem("lastAAChartType", chartDisplayType);
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
    idDiv.innerHTML = `Version: ${versionIDs[v - 1].slice(0, 3)} Phase ${versionIDs[v - 1].slice(4)} - ID: ${v}`;
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
  downloadButton.download = `Anomaly Arbitration HP - ${chartDisplayType}`;
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
  hpChart.data.datasets = chartDisplayType == "Knight + Checkmate" ?
  [ generateHPDataset(`Raw Knight HP`, hpData[2], "#ff5555"), generateHPDataset(`Raw Checkmate HP`, hpData[0], "#6d9eeb") ] :
  [ generateHPDataset(`Raw Checkmate: ZZ HP`, hpData[1], "#f6b26b") ];
  hpChart.options.scales.y.min = 0;
  hpChart.options.scales.y.max = chartDisplayType == "Knight + Checkmate" ? 120000000 : 360000000;
  hpChart.options.scales.y.ticks.stepSize = chartDisplayType == "Knight + Checkmate" ? 10000000 : 30000000;
  hpChart.options.plugins.title.text = `Anomaly Arbitration HP - ${chartDisplayType}`;
  hpChart.update();
  saveProgress();
}

/* ----------------------------------------------------------------------------- MAIN ----------------------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", async () => { await loadPage(); });