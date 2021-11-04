// Import Library
const util = require('util')

// Import Connection
const db = require('./../Connection/Connection')
const query = util.promisify(db.query).bind(db)

// Import Function HashPassword
const hashPassword = require('./../Helpers/Hash')

// Import JWT Sign / Men-generate Sebuah JWT Token
const jwtSign = require('./../Helpers/JWTSign')

const register = async(req, res) => {
    // Step0. Kita ambil data yang dikirim oleh user
    let data = req.body

    // Step1. Kita cek, apakah email yang didaftarkan user itu sudah terdaftar atau belum?
    let query1 = 'SELECT * FROM users WHERE email = ?'
    // Step2. Jika sudah terdaftar, maka kita kirim respon error. Tapi kalau belum, kita input datanya ke DB
    let query2 = 'INSERT INTO users SET ?'
    // Step3. Kita select lagi datanya, untuk kemudian data tersebut kita gunakan untuk men-generate sebuah JWT Token
    let query3 = 'SELECT * FROM users WHERE id = ?'

    try {
        
        // Validasi
        if(!data.username || !data.email || !data.password) throw { status: 500, message: 'Error Validation', detail: 'Data Tidak Boleh Kosong!' }
        // ...
        // ...
        // ...

        await query('Start Transaction')

        // Step1.
        const checkEmail = await query(query1, data.email)
        .catch((error) => {
            throw error
        })

        // if(checkEmail.length > 0) throw { status: 500, message: 'Error Validation', detail: 'Email Sudah Terdaftar' }

        // Step2.
        let passwordHashed = hashPassword(data.password)
        
        let dataToSend ={
            uid: Date.now(),
            username: data.username,
            email: data.email,
            password: passwordHashed
        }

        const insertDataRegister = await query(query2, dataToSend)
        .catch((error) => {
            throw error
        })

        console.log(insertDataRegister) // Untuk Mengecek Insert Id User

        // Step3. 
        const getDataUser = await query(query3, insertDataRegister.insertId)
        .catch((error) => {
            throw error
        })

        let token = jwtSign(getDataUser[0])
        console.log(token)

        await query('Commit')
        res.status(200).send({
            error: false,
            message: 'Register Success',
            detail: 'Akun Anda Berhasil Terdaftar!',
            data: {
                id: getDataUser[0].id,
                uid: getDataUser[0].uid,
                username: getDataUser[0].username,
                email: getDataUser[0].email,
                token: token
            }
        })

    } catch (error) {
        await query('Rollback')
        if(error.status){
            // Error yang dikirim oleh kita
            res.status(error.status).send({
                error: true, 
                message: error.message,
                detail: error.detail
            })
        }else{
            // Error yang dikirim oleh server
            res.status(500).send({
                error: true, 
                message: error.message
            })
        }
    }
}

const deactiveAccount = (req, res) => {
    const dataToken = req.dataToken

    db.query('SELECT * FROM users WHERE uid = ? AND role = ?', [dataToken.uid, dataToken.role], (err, result) => {
        try {
            if(err) throw err 

            if(result[0].status === 2){
                return res.status(500).send({
                    error: true,
                    message: 'Error When Deactive Account',
                    detail: 'Your Account Already Deactive!'
                })
            }else if(result[0].status === 1){
                
                db.query('UPDATE users Set status = 2 WHERE uid = ?', dataToken.uid, (err, result) => {
                    try {
                        if(err) throw err 

                        db.query('SELECT u.uid, s.status FROM users u JOIN status s ON u.status = s.id WHERE u.uid = ?', dataToken.uid, (err, result) => {
                            try {
                                if(err) throw err 

                                res.status(200).send({
                                    error: false, 
                                    message: 'Deactive Account Success!',
                                    detail: 'Akun Kamu Berhasil Dinonaktifkan!',
                                    data: { ...result[0] }
                                })
                            } catch (error) {
                                console.log(error)
                            }
                        })
                    } catch (error) {
                        console.log(error)
                    }
                })

            }
            
        } catch (error) {
            console.log(error)
        }
    })
}

const searchAllMovies = (req, res) => {
    let query = `
        SELECT * FROM movies m 
        JOIN movie_status ms ON m.status = ms.id
        JOIN schedules s ON s.movie_id = m.id
        JOIN locations l ON l.id = s.location_id
        JOIN show_times st ON st.id = s.time_id
    `

    db.query(query, (err, result) => {
        try {
            if(err) throw err 

            res.status(200).send({
                error: false, 
                message: 'Get Movies Success',
                detail: 'Pencarian Semua Film Berhasil!',
                data: result
            })
        } catch (error) {
            res.status(500).send({
                error: true, 
                message: 'Error Server',
                detail: error.message
            })
        }
    })
}

const searchMoviesBy = (req, res) => {
   let data = req.query 

    // Step1. Validasi datanya. Yang tadinya ada %, kita hilangkan!    
   if(data.status){
       data.status = data.status.replace('%', ' ')
   }

   if(data.time){
       data.time = data.time.replace('%', ' ')
   }

   let query = `
        SELECT * FROM movies m 
        JOIN movie_status ms ON m.status = ms.id
        JOIN schedules s ON s.movie_id = m.id
        JOIN locations l ON l.id = s.location_id
        JOIN show_times st ON st.id = s.time_id
        WHERE
    `

    let arr = []

    // Step2. Kita buat query berdasarkan pencarian user
    if(data.status){
        if(query[query.length - 1] === '?'){
            query += ' AND ms.status = ?'
        }else{
            query += ' ms.status = ?'
        }

        arr.push(data.status)
    }

    if(data.location){
        if(query[query.length - 1] === '?'){
            query += ' AND l.location = ?'
        }else{
            query += ' l.location = ?'
        }

        arr.push(data.location)
    }

    if(data.time){
        if(query[query.length - 1] === '?'){
            query += ' AND st.time = ?'
        }else{
            query += ' st.time = ?'
        }

        arr.push(data.time)
    }

    db.query(query, [...arr], (err, result) => {
        try {
            if(err) throw err 

            if(result.length > 0){
                res.status(200).send({
                    error: false,
                    message: 'Search Movies Success',
                    detail: 'Pencarian Data Film Berhasil!',
                    data: result
                })
            }else{
                res.status(200).send({
                    error: false, 
                    message: 'Search Movies Failed',
                    detail: 'Film yang Anda Cari Tidak Ditemukan! '
                })
            }
        } catch (error) {
            console.log(error)
        }
    })
}

module.exports = {
    register,
    deactiveAccount, 
    searchAllMovies,
    searchMoviesBy
}