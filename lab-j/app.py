import sqlite3
from flask import Flask, render_template, request, redirect

app = Flask(__name__)

DATABASE = 'database.sqlite'


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


@app.route('/book')
def book_list():
    conn = get_db()
    books = conn.execute(
        'SELECT * FROM book'
    ).fetchall()
    conn.close()

    return render_template(
        'list.html',
        books=books
    )


@app.route('/book/create', methods=['GET', 'POST'])
def create_book():

    if request.method == 'POST':
        title = request.form['title']
        author = request.form['author']
        description = request.form['description']

        conn = get_db()
        conn.execute(
            '''
            INSERT INTO book
            (title, author, description)
            VALUES (?, ?, ?)
            ''',
            (title, author, description)
        )

        conn.commit()
        conn.close()

        return redirect('/book')

    return render_template('create.html')


@app.route('/book/<int:id>')
def show_book(id):
    conn = get_db()

    book = conn.execute(
        'SELECT * FROM book WHERE id = ?',
        (id,)
    ).fetchone()

    conn.close()

    return render_template(
        'show.html',
        book=book
    )


@app.route('/book/<int:id>/edit', methods=['GET', 'POST'])
def edit_book(id):
    conn = get_db()

    book = conn.execute(
        'SELECT * FROM book WHERE id = ?',
        (id,)
    ).fetchone()

    if request.method == 'POST':
        title = request.form['title']
        author = request.form['author']
        description = request.form['description']

        conn.execute(
            '''
            UPDATE book
            SET title = ?,
                author = ?,
                description = ?
            WHERE id = ?
            ''',
            (title, author, description, id)
        )

        conn.commit()
        conn.close()

        return redirect('/book')

    conn.close()

    return render_template(
        'edit.html',
        book=book
    )


@app.route('/book/<int:id>/delete')
def delete_book(id):
    conn = get_db()

    conn.execute(
        'DELETE FROM book WHERE id = ?',
        (id,)
    )

    conn.commit()
    conn.close()

    return redirect('/book')


if __name__ == '__main__':
    app.run(debug=True, port=5000)