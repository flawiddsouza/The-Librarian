const path = require('path')

module.exports = {
    client: 'sqlite3',
    connection: {
        filename: path.join(__dirname, 'store.db')
    },
    useNullAsDefault: true,
    pool: {
        afterCreate: (conn, cb) => conn.run('PRAGMA foreign_keys = ON', cb)
    }
}
