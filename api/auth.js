const router = require('express').Router()

const bcrypt = require('bcrypt')
const saltRounds = 10

const jwt = require('jsonwebtoken')

const Knex = require('knex')
const knexConfig = require('./knexfile')
const knex = Knex(knexConfig)

require('dotenv').config()

router.post('/auth/register', validateUsernameAndPassword, (req, res) => {
    knex('users').where('username', req.body.username).then(rows => {
        if(rows.length === 1) {
            res.json({
                success: false,
                message: 'Registration failed. User already exists.'
            })
        } else {
            bcrypt.hash(req.body.password, saltRounds).then(passwordHash => {
                knex('users').insert({ username: req.body.username, password: passwordHash }).then(() => {
                    res.json({
                        success: true,
                        message: 'Registration complete.'
                    })
                })
            })
        }
    })
})

router.post('/auth/token', validateUsernameAndPassword, (req, res) => {
    knex.table('users').where('username', req.body.username).then(users => {
        if(users.length === 0) {
            res.json({
                success: false,
                message: 'Authentication failed. No such user found.'
            })
        } else {
            var user = users[0]
            bcrypt.compare(req.body.password, user.password).then(passed => {
                if(!passed) {
                    res.json({
                        success: false,
                        message: 'Authentication failed. Invalid password.'
                    })
                }
                const payload = {
                    id: user.id
                }

                var token = jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: '1 hour'
                })

                res.json({
                    success: true,
                    token: token
                })
            })
        }
    })
})

router.get('/auth/test', authCheck, (req, res) => {
    res.json({
        success: true,
        message: "You're Authenticated"
    })
})

function validateUsernameAndPassword(req, res, next) {
    if(!req.body.username && !req.body.password) {
        return res.json({
            success: false,
            message: 'Authentication failed. No username & password provided.'
        })
    }
    if(!req.body.username) {
        return res.json({
            success: false,
            message: 'Authentication failed. No username provided.'
        })
    }
    if(!req.body.password) {
        return res.json({
            success: false,
            message: 'Authentication failed. No password provided.'
        })
    }
    next()
}

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

module.exports = router
