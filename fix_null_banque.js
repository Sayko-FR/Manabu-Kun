// Script de correction des valeurs nulles dans toutes les bases de données serveurs
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbFolder = path.join(__dirname, './Commands_prefix/DataBase');

if (!fs.existsSync(dbFolder)) {
    console.error('Le dossier DataBase n\'existe pas.');
    process.exit(1);
}

const files = fs.readdirSync(dbFolder).filter(f => f.endsWith('.sqlite'));

files.forEach(file => {
    const dbPath = path.join(dbFolder, file);
    const db = new Database(dbPath);
    const res = db.prepare('UPDATE banques SET banque = 0 WHERE banque IS NULL').run();
    console.log(`[${file}] Corrections appliquées : ${res.changes}`);
    db.close();
});

console.log('Correction terminée.');
