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