const express = require('express')
const app = express()

const Knex = require('knex')
const knexConfig = require('./knexfile')
const knex = Knex(knexConfig)

const path = require('path')

const bodyParser = require('body-parser')
app.use(bodyParser.json())

require('dotenv').config({ path: path.join(__dirname, '.env') })

app.use(express.static(path.join(__dirname, '../web-ui-dist')))

const booksTableColumns = ['name', 'author', 'cover_image', 'type', 'version', 'is_series', 'series_id', 'series_index', 'status', 'started_reading', 'completed_reading', 'rating', 'extra_metadata']
const notesTableColumns = ['book_id', 'marker', 'note']
const notesTableColumnsUpdate = ['marker', 'note']

const auth = require('./auth')
app.use(auth) // attach auth routes

const jwt = require('jsonwebtoken')
function authCheck(req, res, next) {
    if(req.header('token')) {
        try {
            var decoded = jwt.verify(req.header('token'), process.env.JWT_SECRET)
            req.authUserId = decoded.id // decoded has the object structure { id: id }
        } catch(err) {
            if(err.name == 'JsonWebTokenError') {
                return res.json({
                    success: false,
                    message: 'Authentication failed. Invalid token provided.'
                })
            } else if(err.name == 'TokenExpiredError') {
                return res.json({
                    success: false,
                    message: 'Authentication failed. Token provided has expired.'
                })
            } else {
                console.log(err)
            }
        }
    } else {
        return res.json({
            success: false,
            message: 'Authentication failed. No token provided.'
        })
    }
    next()
}

app.use(authCheck) // make auth compulsory on all routes below

app.get('/books/all', (req, res) => {
    var whereArray = null
    if(req.query.type && req.query.type !== 'All') {
        whereArray = [{ columnName: 'type', columnValue: req.query.type }]
    }
    if(req.query.status && req.query.status !== 'All') {
        whereArray = [{ columnName: 'status', columnValue: req.query.status }]
    }
    if(req.query.type && req.query.status) {
        if(req.query.type !== 'All' && req.query.status !== 'All') {
            whereArray = [{ columnName: 'type', columnValue: req.query.type }, { columnName: 'status', columnValue: req.query.status }]
        }
    }
    getRecords('books', req, res, whereArray)
})

app.post('/books/add', (req, res) => {
    addRecord('books', booksTableColumns, req, res)
})

app.get('/books/:id', (req, res) => {
    getRecord('books', req.params.id, req, res, ['series', 'books.series_id', 'series.id'], 'series.name as series_name')
})

app.patch('/books/:id', (req, res) => {
    updateRecord('books', booksTableColumns, req, res)
})

app.delete('/books/:id', (req, res) => {
    deleteRecord('books', req.params.id, req, res)
})

app.get('/series/all', (req, res) => {
    getRecords('series', req, res)
})

app.post('/series/add', (req, res) => {
    addRecord('series', ['name'], req, res)
})

app.patch('/series/:id', (req, res) => {
    updateRecord('series', ['name'], req, res)
})

app.delete('/series/:id', (req, res) => {
    deleteRecord('series', req.params.id, req, res)
})

app.get('/notes/all', (req, res) => {
    var limit = null
    if(req.query.count) {
        limit = req.query.count
    }
    getRecords('notes', req, res, null, { columnName: 'created_at', order: 'desc' }, limit, ['books', 'books.id', 'notes.book_id'], 'books.name as book_name')
})

app.post('/notes/add', (req, res) => {
    addRecord('notes', notesTableColumns, req, res)
})

app.get('/notes/:book_id', (req, res) => {
    getRecords('notes', req, res, [{ columnName: 'book_id', columnValue: req.params.book_id }], { columnName: 'created_at', order: 'asc' })
})

app.patch('/notes/:id', (req, res) => {
    updateRecord('notes', notesTableColumnsUpdate, req, res)
})

app.delete('/notes/:id', (req, res) => {
    deleteRecord('notes', req.params.id, req, res)
})

function getRecords(table, req, res, whereArray=null, orderBy=null, limit=null, leftJoinParams=null, selectLeftJoin=null) {
    var knexObj = knex(table).where(table + '.user_id', req.authUserId)
    if(whereArray) {
        whereArray.forEach(whereArgs => {
            knexObj = knexObj.where(whereArgs.columnName, whereArgs.columnValue)
        })
    }
    if(leftJoinParams) {
        knexObj = knexObj.leftJoin(...leftJoinParams).select(table + '.*', selectLeftJoin)
    }
    if(orderBy) {
        knexObj = knexObj.orderBy(orderBy.columnName, orderBy.order)
    } else {
        knexObj = knexObj.orderBy('updated_at', 'desc')
    }
    if(limit) {
        knexObj = knexObj.limit(limit)
    }
    knexObj.then(rows => {
        res.json(rows)
    })
}

function getRecord(table, id, req, res, leftJoinParams=null, selectLeftJoin=null) {
    if(leftJoinParams) {
        if(selectLeftJoin) {
            knex(table).where(table +'.user_id', req.authUserId).where(table + '.id', id).select(table + '.*', selectLeftJoin).leftJoin(...leftJoinParams).then(rows => {
                res.json(rows[0])
            })
        } else {
            knex(table).where(table +'.user_id', req.authUserId).where(table + '.id', id).leftJoin(...leftJoinParams).then(rows => {
                res.json(rows[0])
            })
        }
    } else {
        knex(table).where('user_id', req.authUserId).where('id', id).then(rows => {
            res.json(rows[0])
        })
    }
}

function addRecord(table, columns, req, res) {
    try {
        var insertObj = {}

        columns.forEach(column => {
            if(req.body[column] !== '') {
                insertObj[column] = req.body[column]
            } else {
                insertObj[column] = null
            }
        })

        insertObj['user_id'] = req.authUserId

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
            if(req.body[column] !== '') {
                insertObj[column] = req.body[column]
            } else {
                insertObj[column] = null
            }
        })

        knex(table).where('user_id', req.authUserId).where('id', req.params.id).update(insertObj).update('updated_at', knex.fn.now()).then(updatedRowsCount => {
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

function deleteRecord(table, id, req, res) {
    try {
        knex(table).where('user_id', req.authUserId).where('id', id).delete().then(deleteCount => {
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
