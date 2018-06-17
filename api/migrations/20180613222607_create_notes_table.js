exports.up = knex => {
    return knex.schema
        .createTable('notes', table => {
            table.increments('id').primary()
            table
                .integer('book_id')
                .unsigned()
                .references('id')
                .inTable('books')
            table.string('marker')
            table.text('note')
            table.timestamps(true, true)
        })
}

exports.down = knex => {
    return knex.schema
        .dropTableIfExists('notes')
}
