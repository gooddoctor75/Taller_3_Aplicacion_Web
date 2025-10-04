// backend/database/database.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const DBSOURCE = "database.db";
const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    }
});

db.serialize(() => {
    console.log('✅ Conectado a la base de datos SQLite.');

    db.run('PRAGMA foreign_keys = ON;');

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'admin')) DEFAULT 'user'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        owner_id INTEGER NOT NULL,
        FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    const saltRounds = 10;
    const adminPassword = 'admin_password_123';
    const userPassword = 'user_password_123';

    bcrypt.hash(adminPassword, saltRounds, (err, adminHash) => {
        if (!err) {
            const insertAdmin = 'INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?,?,?)';
            db.run(insertAdmin, ['admin', adminHash, 'admin']);
        }
    });

    bcrypt.hash(userPassword, saltRounds, (err, userHash) => {
        if (!err) {
            const insertUser = 'INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?,?,?)';
            db.run(insertUser, ['user', userHash, 'user'], function () {
                const productInsert = 'INSERT OR IGNORE INTO products (name, description, owner_id) VALUES (?,?,?)';
                db.run(productInsert, ['Producto ejemplo 1', 'Descripción 1', this.lastID]);
                db.run(productInsert, ['Producto ejemplo 2', 'Descripción 2', this.lastID]);
            });
        }
    });
});

module.exports = db;
