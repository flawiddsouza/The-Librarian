exports.up = knex => {
    return knex.schema
        .createTable('series', table => {
            table.increments('id').primary()
            table.string('name')
            table
                .integer('user_id')
                .unsigned()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')
            table.timestamps(true, true)
        })
        .createTable('books', table => {
            table.increments('id').primary()
            table.string('name')
            table.string('author')
            table.string('cover_image')
            table.string('type')
            table.string('version')
            table.boolean('is_series')
            table
                .integer('series_id')
                .unsigned()
                .references('id')
                .inTable('series')
                .onDelete('CASCADE')
            table.integer('series_index')
            table.string('status')
            table.date('started_reading')
            table.date('completed_reading')
            table.string('rating')
            table.text('extra_metadata')
            table
                .integer('user_id')
                .unsigned()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')
            table.timestamps(true, true)
        })
}

exports.down = knex => {
    return knex.schema
        .dropTableIfExists('books')
        .dropTableIfExists('series')
}
