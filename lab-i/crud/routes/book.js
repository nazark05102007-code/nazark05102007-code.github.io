var express = require('express')
var router = express.Router()
const db = require('../db')

router.get('/', function (req, res) {
    const books = db.prepare('SELECT * FROM book').all()

    res.render('book/index', { books })
})

router.get('/create', function (req, res) {
    res.render('book/create')
})

router.post('/create', function (req, res) {
    db.prepare(
        'INSERT INTO book (title, author, description) VALUES (?, ?, ?)'
    ).run(req.body.title, req.body.author, req.body.description)

    res.redirect('/book')
})

router.get('/:id/edit', function (req, res) {
    const book = db
        .prepare('SELECT * FROM book WHERE id = ?')
        .get(req.params.id)

    res.render('book/edit', { book })
})

router.post('/:id/edit', function (req, res) {
    db.prepare(
        'UPDATE book SET title = ?, author = ?, description = ? WHERE id = ?'
    ).run(
        req.body.title,
        req.body.author,
        req.body.description,
        req.params.id
    )

    res.redirect('/book')
})

router.get('/:id/delete', function (req, res) {
    db.prepare('DELETE FROM book WHERE id = ?')
        .run(req.params.id)

    res.redirect('/book')
})

router.get('/:id', function (req, res) {
    const book = db
        .prepare('SELECT * FROM book WHERE id = ?')
        .get(req.params.id)

    res.render('book/show', { book })
})

module.exports = router