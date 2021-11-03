// Import Library Untuk Rollback
const { throws } = require('assert')
const util = require('util')

// Import Connection
const db = require('./../Connection/Connection')
const query = util.promisify(db.query).bind(db) // Untuk Melakukan Rollback

// Import Hashing Password
const hashPassword = require('./../Helpers/HashPassword')

// Import JWTSign
const jwtSign = require('./../Helpers/JWTSign')

const register = async(req, res) => {
    // Step0. Kita ambil semua datanya yang dikirim oleh client
    const data = req.body

    // Step1. Kita cek terlebih dahulu emailnya. Apakah sudah terdaftar atau belum. Kalau sudah, kita kirimkan pesan error ke user. Tapi kalau belum terdaftar, kita lanjut ke Step2.
    let query1 = 'SELECT * FROM users WHERE email = ?'
    // Step2. Kita insert data yang telah di submit oleh user
    let query2 = 'INSERT INTO users SET ?'
    // Step3. Kita select datanya, kita kirim ke user
    let query3 = 'SELECT * FROM users WHERE id = ?'

    try {
        // Step4. Validasi Data
        if(!data.username || !data.email || !data.password) throw { status: 406, message: 'Data Null', detail: 'Data Tidak Lengkap!' }
        if(data.username.length < 6) throw { status: 406, message: 'Data Invalid', detail: 'Username Minimal 6 Karakter!' }
        
        // Step5. Start Transaction Rollback
        await query('Start Transaction')

        const checkEmail = await query(query1, data.email)
        .catch((error) => {
            throw error
        })

        if(checkEmail.length > 0) throw { status: 406, message: 'Error Validation', detail: 'Email Sudah Terdaftar' } // Apabila data yang di dapat dari query1 lebih dari nol, maka kita anggap email sudah terdaftar

        // Step6. Hash Password nya
        let hashedPassword = hashPassword(data.password)

        let dataToSend = {
            uid: Date.now(),
            ...data,
        }

        const insertData = await query(query2, dataToSend)
        .catch((error) => {
            throw error
        })

        const getDataUser = await query(query3, insertData.insertId)
        .catch((error) => {
            throw error
        })

        let token = jwtSign({ uid: getDataUser[0].uid, role: getDataUser[0].role })
        
        // Step7. Commit Transaction
        await query('Commit')

        res.status(200).send({
            error: false, 
            message: 'Register Success',
            detail: 'Register Berhasil Dilakukan!',
            data: {
                id: getDataUser[0].id,
                uid: getDataUser[0].uid,
                username: getDataUser[0].username,
                email: getDataUser[0].email, 
                token: token
            }
        })

    } catch (error) {
        if(error.status){
            // Kalau error status nya ada, berarti ini error yang kita buat
            res.status(error.status).send({
                error: true,
                message: error.message,
                detail: error.detail
            })
        }else{
            // Kalau error yang disebabkan oleh sistem
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
    }
}

const deactiveAccount = (req, res) => {
    // Step0. Kita ambil data hasil decrypt dari si token
    const dataToken = req.dataToken

    // Step1. Kita cek, apakah status akunnya aktif atau deactive. Kalau deactive, kita kirim response error. Tapi kalau aktif, kita lanjut ke step berikutnya!
    db.query('SELECT * FROM users WHERE uid = ?', dataToken.uid, (err, result) => {
        try {
            if(err) throw err 

            if(result[0].status === 2){
                return res.status(406).send({
                    error: true, 
                    message: 'Error Validation',
                    detail: 'Akun Anda Sudah Tidak Aktif!'
                })
            }

            db.query('UPDATE users SET status = 2 WHERE uid = ?', dataToken.uid, (err, result) => {
                try {
                    if(err) throw err

                    db.query('SELECT u.uid, s.status FROM users u JOIN status s ON u.status = s.id WHERE uid = ?', dataToken.uid, (err, result) => {
                        try {
                            if(err) throw err
                            console.log(result)
                            res.status(200).send({
                                error: false, 
                                message: 'Deactive Account Success',
                                detail: 'Akun Anda Sudah Tidak Aktif!',
                                data: {
                                    uid: result[0].uid, 
                                    status: result[0].status
                                }
                            })
                        } catch (error) {
                            console.log(error)
                        }
                    })
                } catch (error) {
                    console.log(error)
                }
            })
        } catch (error) {
            console.log(error)
        }
    })
    
    // Step2. Kita update status akunnya di DB
    // Step3. Kita kirim response
}
 
module.exports = {
    register,
    deactiveAccount
}