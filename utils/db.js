import knexObj from "knex"

const db = knexObj({
    client: 'mysql2',
    connection:{
        host: 'r-ex6.h.filess.io',
        port: '3307',
        user: 'Quizz_distantmet',
        password: '9857d5b30e8e3a18d29b7fdd962fe7a41d14e51c',
        database: 'Quizz_distantmet'
    },
    pool : {min: 0, max: 7}
})

export default db;