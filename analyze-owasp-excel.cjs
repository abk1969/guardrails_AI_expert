const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.join(__dirname, 'data_ai_risk', 'Copy of ⭕ OWASP GenAI  COMPASS v. 1.xlsx');

console.log('📊 Analyse du fichier OWASP GenAI COMPASS...\n');

// Lire le fichier Excel
const workbook = XLSX.readFile(excelPath);

console.log('📋 Feuilles du classeur:');
console.log('========================\n');

workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`${index + 1}. "${sheetName}"`);
});

console.log('\n\n📄 ANALYSE DÉTAILLÉE DE CHAQUE FEUILLE:');
console.log('=========================================\n');

// Analyser chaque feuille
const sheetsData = {};

workbook.SheetNames.forEach((sheetName) => {
    console.log(`\n🔍 Feuille: "${sheetName}"`);
    console.log('─'.repeat(60));

    const worksheet = workbook.Sheets[sheetName];

    // Convertir en JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false
    });

    // Statistiques
    console.log(`   • Nombre de lignes: ${jsonData.length}`);

    if (jsonData.length > 0) {
        const headers = jsonData[0];
        console.log(`   • Nombre de colonnes: ${headers.length}`);
        console.log(`   • En-têtes de colonnes:`);
        headers.forEach((header, idx) => {
            if (header) {
                console.log(`     ${idx + 1}. ${header}`);
            }
        });

        // Sauvegarder les données
        sheetsData[sheetName] = {
            headers: headers,
            data: jsonData.slice(1) // Sans les en-têtes
        };

        // Afficher quelques lignes d'exemple
        if (jsonData.length > 1) {
            console.log(`\n   📝 Aperçu des données (3 premières lignes):`);
            jsonData.slice(1, 4).forEach((row, idx) => {
                console.log(`\n      Ligne ${idx + 1}:`);
                row.forEach((cell, cellIdx) => {
                    if (cell && headers[cellIdx]) {
                        const cellValue = String(cell).substring(0, 100);
                        console.log(`         ${headers[cellIdx]}: ${cellValue}${cell.length > 100 ? '...' : ''}`);
                    }
                });
            });
        }
    }
});

// Sauvegarder toutes les données dans un fichier JSON
const outputPath = path.join(__dirname, 'data_ai_risk', 'owasp-compass-analysis.json');
fs.writeFileSync(outputPath, JSON.stringify(sheetsData, null, 2), 'utf-8');

console.log('\n\n✅ ANALYSE TERMINÉE');
console.log('===================\n');
console.log(`📁 Données sauvegardées dans: ${outputPath}`);
console.log(`📊 Nombre total de feuilles analysées: ${workbook.SheetNames.length}`);

// Focus sur la feuille "Notes Uses Cases"
console.log('\n\n🎯 FOCUS: Feuille "Notes Uses Cases"');
console.log('=====================================\n');

const useCasesSheet = workbook.SheetNames.find(name =>
    name.toLowerCase().includes('use') && name.toLowerCase().includes('case')
);

if (useCasesSheet) {
    const useCasesData = sheetsData[useCasesSheet];
    console.log(`✅ Feuille trouvée: "${useCasesSheet}"`);
    console.log(`   • ${useCasesData.data.length} cas d'usage`);
    console.log(`   • Colonnes: ${useCasesData.headers.join(', ')}`);
} else {
    console.log('⚠️  Aucune feuille "Notes Uses Cases" trouvée');
    console.log('   Feuilles disponibles:', workbook.SheetNames.join(', '));
}

console.log('\n');
