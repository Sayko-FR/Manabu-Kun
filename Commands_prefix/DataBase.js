const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function getServerDB(serverID) {
    const dbFolder = path.join(__dirname, 'DataBase');

    if(!fs.existsSync(dbFolder)) {fs.mkdirSync(dbFolder)};

    const dbPath = path.join(dbFolder, `${serverID}.sqlite`);
    const db = new Database(dbPath);

    db.prepare(`
        CREATE TABLE IF NOT EXISTS banques (
            user_id TEXT PRIMARY KEY,
            banque INTEGER DEFAULT 0
        ) 
    `).run();

    return db;
};

module.exports = {getServerDB};