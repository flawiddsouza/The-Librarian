const express = require('express')
const app = express()

const Knex = require('knex')
const knexConfig = require('./knexfile')
var knex = Knex(knexConfig)

const path = require('path')

const bodyParser = require('body-parser')
app.use(bodyParser.json())

require('dotenv').config()
if(process.env.BASIC_AUTH_USERNAME && process.env.BASIC_AUTH_PASSWORD) {
    app.use((req, res, next) => {
        const auth = { login: process.env.BASIC_AUTH_USERNAME, password: process.env.BASIC_AUTH_PASSWORD }

        // parse login and password from headers
        const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
        const [login, password] = new Buffer(b64auth, 'base64').toString().split(':')

        // Verify login and password are set and correct
        if (!login || !password || login !== auth.login || password !== auth.password) {
            res.set('WWW-Authenticate', 'Basic realm="401"') // change this
            res.status(401).send('Authentication required.') // custom message
            return
        }

        // -----------------------------------------------------------------------
        // Access granted...
        next()

    })
}

app.use(express.static(path.join(__dirname, '../web-ui-dist')))

const booksTableColumns = ['name', 'author', 'cover_image', 'type', 'version', 'is_series', 'series_id', 'series_index', 'status', 'started_reading', 'completed_reading', 'rating', 'extra_metadata']
const notesTableColumns = ['book_id', 'marker', 'note']

app.get('/books/all', (req, res) => {
    if((req.query.type !== 'All' && req.query.status === 'All') || (req.query.type !== 'All' && !req.query.status)) {
        getRecords('books', res, ['type', req.query.type])
        return
    }
    if((req.query.type === 'All' && req.query.status !== 'All') || (!req.query.type && req.query.status !== 'All')) {
        getRecords('books', res, ['status', req.query.status])
        return
    }
    if(req.query.type !== 'All' && req.query.status !== 'All') {
        getRecords('books', res, ['type', req.query.type], ['status', req.query.status])
        return
    }
    getRecords('books', res)
})

app.post('/books/add', (req, res) => {
    addRecord('books', booksTableColumns, req, res)
})

app.get('/books/:id', (req, res) => {
    getRecord('books', req.params.id, res, ['series', 'books.series_id', 'series.id'], 'series.name as series_name')
})

app.patch('/books/:id', (req, res) => {
    updateRecord('books', booksTableColumns, req, res)
})

app.delete('/books/:id', (req, res) => {
    deleteRecord('books', req.params.id, res)
})

app.get('/series/all', (req, res) => {
    getRecords('series', res)
})

app.post('/series/add', (req, res) => {
    addRecord('series', ['name'], req, res)
})

app.patch('/series/:id', (req, res) => {
    updateRecord('series', ['name'], req, res)
})

app.delete('/series/:id', (req, res) => {
    deleteRecord('series', req.params.id, res)
})

app.get('/notes/all', (req, res) => {
    getRecords('notes', res)
})

app.post('/notes/add', (req, res) => {
    addRecord('notes', notesTableColumns, req, res)
})

app.get('/notes/:book_id', (req, res) => {
    getRecords('notes', res, ['book_id', req.params.book_id])
})

app.patch('/notes/:id', (req, res) => {
    updateRecord('notes', notesTableColumns, req, res)
})

app.delete('/notes/:id', (req, res) => {
    deleteRecord('notes', req.params.id, res)
})

function getRecords(table, res, where=null, secondWhere=null) {
    if(where) {
        if(secondWhere) {
            knex(table).where(...where).where(...secondWhere).select().orderBy('updated_at', 'desc').then(rows => {
                res.json(rows)
            })
            return
        }
        knex(table).where(...where).select().orderBy('updated_at', 'desc').then(rows => {
            res.json(rows)
        })
        return
    }
    knex(table).select().orderBy('updated_at', 'desc').then(rows => {
        res.json(rows)
    })
}

function getRecord(table, id, res, leftJoinParams=null, selectLeftJoin=null) {
    if(leftJoinParams) {
        if(selectLeftJoin) {
            knex(table).where(table + '.id', id).select(table + '.*', selectLeftJoin).leftJoin(...leftJoinParams).then(rows => {
                res.json(rows[0])
            })
        } else {
            knex(table).where(table + '.id', id).select().leftJoin(...leftJoinParams).then(rows => {
                res.json(rows[0])
            })
        }
    } else {
        knex(table).where('id', id).select().then(rows => {
            res.json(rows[0])
        })
    }
}

function addRecord(table, columns, req, res) {
    try {
        var insertObj = {}

        columns.forEach(column => {
            insertObj[column] = req.body[column]
        })

        knex(table).insert(insertObj, 'id').then(insertedIds => {
            knex(table).where('id', insertedIds[0]).select('created_at').then(rows => {
                var row = rows[0]
                res.json({
                    success: true,
                    [table]: Object.assign(insertObj,{
                        id: insertedIds[0],
                        created_at: row.created_at,
                        updated_at: row.created_at // it's the same when an entry is created
                    })
                })
            })
        })
    } catch(error) {
        res.json({
            success: false,
            error: error.message
        })
    }
}

function updateRecord(table, columns, req, res) {
    try {
        var insertObj = {}

        columns.forEach(column => {
            insertObj[column] = req.body[column]
        })

        knex(table).where('id', req.params.id).update(insertObj).update('updated_at', knex.fn.now()).then(updatedRowsCount => {
            knex(table).where('id', req.params.id).select('updated_at').then(rows => {
                var row = rows[0]
                res.json({
                    success: true,
                    updatedAt: row.updated_at
                })
            })
        })
    } catch(error) {
        res.json({
            success: false,
            error: error.message
        })
    }
}

function deleteRecord(table, id, res) {
    try {
        knex(table).where('id', id).delete().then(deleteCount => {
            res.json({ success: true })
        })
    } catch(error) {
        res.json({
            success: false,
            error: error.message
        })
    }
}

app.listen(9888)
