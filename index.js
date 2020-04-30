
// Maaf saya jadiin satu mas, gak tau kenapa error kalo di refactoring


const express=require('express')
const bodyparser=require('body-parser')
const cors=require('cors')
const { uploader } = require('./helpers/uploader')
const fs = require('fs')

const mysql=require('mysql')

const db=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'AnggaCoolZs90',
    database:'dbujianbackend',
    port:'3306'    
})

db.connect((err)=>{
    if(err){
        console.log(err)
    }
    console.log('sudah konek')
})

module.export=db


const app=express()

const PORT=5000

app.use(cors())//izin ke frontend apapun buat akses backend
app.use(bodyparser.json())//buat user kirim data ke server
app.use(bodyparser.urlencoded({ extended: false }));//buat user kirim data ke server
app.use(express.static('public'))

app.get('/',(req,res)=>{
    res.send('<h1>HALAMAN HOME</h1>')
})

// ================== PRODUCT ======================

//GET PRODUCT
app.get('/getprod',(req,res)=>{
    db.query('SELECT * FROM product',(err,result)=>{
        if(err) return res.status(500).send(err)
        return res.status(200).send(result)
    })
})

//ADD PRODUCT
app.post('/addprod', (req, res) => {
    const path = '/images'
    const upload = uploader(path, 'TEST').fields([{ name : 'image' }]);
    upload(req, res, (err) => {
        const { image } = req.files;
        const { nama, harga } = JSON.parse(req.body.data)
        const imagePath = image ? `${path}/${image[0].filename}` : null

        var sql = `INSERT product (nama, harga, imagePath) VALUES ('${nama}', ${harga}, '${imagePath}')`
        db.query(sql, req.body, (err, result) => {
            if(err){
                fs.unlinkSync(`./public${imagePath}`)
                res.status(500).send(err.message)
            }
            db.query(`SELECT * FROM product`,(err,result1)=>{
                if(err) return res.status(500).send(err)
                return res.status(200).send(result1)
            })
        })
    })
})

//EDIT PRODUCT
app.put('/editprod/:id', (req, res) => {
    var { id } = req.params
    var sql = `SELECT * FROM product WHERE product_id = ${id}`;
    db.query(sql, (err, result) => {
        if(err)res.status(500).send(err.message)

        const oldImagePath = result[0].imagePath
        const path = '/images'
        const upload = uploader(path, 'TEST').fields([{ name : 'image' }])
        upload(req, res, (err) => {
            const { image } = req.files;
            const { nama, harga } = JSON.parse(req.body.data)
            const imagePath = image ? `${path}/${image[0].filename}` : null

            var sql = `UPDATE product SET nama = '${nama}', harga = ${harga}, imagePath = '${imagePath}' WHERE product_id = ${id}`;
            db.query(sql, req.body, (err, result) => {
                if(err){
                    fs.unlinkSync(`./public${imagePath}`)
                    res.status(500).send(err.message)
                }
                if(image){
                    fs.unlinkSync(`./public${oldImagePath}`)
                }
                db.query(`SELECT * FROM product`,(err,result1)=>{
                    if(err) return res.status(500).send(err)
                    return res.status(200).send(result1)
                })
            })
        })
    })
})

//DELETE PRODUCT
app.delete(`/delprod/:id`,(req, res) => {
    var sql = `DELETE FROM product WHERE product_id=${req.params.id}`
    db.query(sql,req.body,(err,result)=>{
        if (err) res.status(500).send(err)
        db.query(`SELECT * FROM product`,(err,result1)=>{
            if(err) res.status(500).send(err)
            res.status(200).send(result1)
        })
    })
})



// ================== STORE ======================

//GET STORE
app.get('/getstore',(req,res)=>{
    db.query('SELECT * FROM store',(err,result)=>{
        if(err) return res.status(500).send(err)
        return res.status(200).send(result)
    })
})

//ADD STORE
app.post('/addstore',(req,res)=>{
    var sql=`INSERT INTO store SET ?` 
        db.query(sql,req.body,(err,result)=>{
            if (err) return res.status(500).send(err)
            db.query('SELECT * FROM store',(err,result1)=>{
                if (err) return res.status(500).send (err)
                return res.status(200).send(result1)
            })
        })
})

//EDIT STORE
app.put('/editstore/:id',(req,res)=>{
    var sql = `UPDATE store SET ? WHERE store_id=${req.params.id}`
    db.query(sql,req.body,(err,result)=>{
        if(err) res.status(500).send(err)
        db.query(`SELECT * FROM store`,(err,result1)=>{
            res.status(200).send(result1)
        })
    })
})

//DELETE STORE
app.delete(`/delstore/:id`,(req, res) => {
    var sql = `DELETE FROM store WHERE store_id=${req.params.id}`
    db.query(sql,req.body,(err,result)=>{
        if (err) res.status(500).send(err)
        db.query(`SELECT * FROM store`,(err,result1)=>{
            if(err) res.status(500).send(err)
            res.status(200).send(result1)
        })
    })
})



// ================== INVENTORY ======================

//GET INVENTORY
app.get('/getinv',(req,res)=>{
    db.query('SELECT * FROM inventory',(err,result)=>{
        if(err) return res.status(500).send(err)
        return res.status(200).send(result)
    })
})

//ADD INVENTORY
app.post('/addinv', (req, res) => {
    let sql = `INSERT INTO inventory SET ?`;
    db.query(sql, req.body, (err, result) => {
        if(err)res.status(500).send(err)
        db.query('SELECT * FROM inventory',(err,result)=>{
            if(err) return res.status(500).send(err)
            return res.status(200).send(result)
        })
    })
})

// ================== STOCK ======================

//GET STOCK
app.get('/getstock', (req, res) => {
    let sql = `SELECT i.inventory_id AS "No",p.nama AS "Product", s.branch_name AS "Branch Name",i.inventory AS Stock 
    FROM inventory i
    JOIN store s ON i.store_id = s.store_id
    JOIN product p ON i.product_id=p.product_id`
    db.query(sql, (err, result) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send(result)
    })
})

//EDIT STOCK
app.put('/editstock/:id',(req,res)=>{
    var sql = `UPDATE inventory SET ? WHERE inventory_id=${req.params.id}`
    db.query(sql,req.body,(err,result)=>{
        if(err) res.status(500).send(err)
        db.query(`SELECT * FROM inventory`,(err,result1)=>{
            res.status(200).send(result1)
        })
    })
})

//DELETE STOCK
app.delete(`/delstock/:id`,(req, res) => {
    var sql = `DELETE FROM inventory WHERE inventory_id=${req.params.id}`
    db.query(sql,(err,result)=>{
        if (err) res.status(500).send(err)
        db.query(`SELECT * FROM inventory`,(err,result1)=>{
            if(err) res.status(500).send(err)
            res.status(200).send(result1)
        })
    })
})


app.listen(PORT,()=>console.log(`Jalan di PORT ${PORT}`))
