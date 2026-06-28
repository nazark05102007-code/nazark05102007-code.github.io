const { DatabaseSync } = require('node:sqlite')
const path = require('path')

const dbPath = path.join(__dirname, 'database.sqlite')
const db = new DatabaseSync(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT NOT NULL
  )
`)

db.exec(`
  INSERT INTO book (title, author, description)
  SELECT 'Test book', 'Nazar Kopachynskyi', 'Example book for LAB I'
  WHERE NOT EXISTS (SELECT 1 FROM book)
`)

module.exports = db