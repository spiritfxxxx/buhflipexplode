function scrapeEnemies() {
    // Select enemy elements for name and HP
    let enemies = document.querySelectorAll('a.relative.m-2');
    let data = [];

    enemies.forEach(enemy => {
        const nameEl = enemy.querySelector('div.p-2.text-center.text-white');
        const hpEl = enemy.querySelector('div.text-sm.text-center.text-white');
        const tooltip = enemy.querySelector('.group span div'); // tooltip div inside hover span

        if (nameEl && hpEl && tooltip) {
            let name = nameEl.textContent.trim().replace(" - ", ": ");
            let dazeMatch = tooltip.innerHTML.match(/Daze\s*<label[^>]*>([\d.]+)<\/label>/);
            let dazeValue = dazeMatch ? (Math.round(parseFloat(dazeMatch[1]) * 10000) / 10000) : null;

            data.push({ name: name, hp: hpEl.textContent.trim(), daze: dazeValue });
        }
    });

    // Filter out entries without daze values
    let completeData = data.filter(e => e.daze !== null);
    if (completeData.length < data.length) {
        console.warn(`Some enemies missing daze values: ${data.length - completeData.length} entries skipped`);
    }

    // Remove exact duplicates (same name, hp, daze)
    let seen = new Set();
    completeData = completeData.filter(e => {
        let key = `${e.name}|${e.hp}|${e.daze}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Sort alphabetically by name (optional)
    completeData.sort((a, b) => a.name.localeCompare(b.name));

    // CSV without header: enemy, hp, daze
    let csv = completeData.map(e => `"${e.name.replace(/"/g, '""')}","${e.hp}","${e.daze}"`).join('\n');

    // Get current ID from URL
    let pathParts = window.location.pathname.split('/');
    let currentID = pathParts[pathParts.length - 1];
    let versionNum = parseInt(currentID.replace(/^62/, ''));
    let formattedID = `62${String(versionNum).padStart(3, '0')}`;

    // Download CSV
    let blob = new Blob([csv], { type: 'text/csv' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = `${formattedID}-h.csv`;
    a.click();
    URL.revokeObjectURL(url);

    console.log(`CSV downloaded as ${formattedID}-h.csv`);
    console.log('Filtered Data:', completeData);
}

// Trigger with E key (only add listener once)
if (!window.scrapeEnemiesListenerAdded) {
    document.addEventListener("keydown", (e) => {
        if (e.key === "e" || e.key === "E") {
            e.preventDefault();
            scrapeEnemies();
        }
    });
    window.scrapeEnemiesListenerAdded = true;
}

// Initial call
scrapeEnemies();
