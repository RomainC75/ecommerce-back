var sqlite3 = require('sqlite3').verbose();

module.exports=class SQLite{
    constructor(name){
        this.db=new sqlite3.Database(name);
    }
    all (query,variArray){
        return new Promise( (resolve, reject) =>{
            try {
                this.db.all(query,variArray,function(err,rows){
                     console.log(' RES ! :',rows.length)
                    
                    resolve(rows)
                })
            } catch (error) {
                reject(error)
            }
        })
    }
    runPromise (query){
        return new Promise((resolve,reject)=>{
            try {
                this.db.all(query,[],function(err,rows){
                    console.log('RUN : ',rows)
                    resolve(true)
                })

            } catch (error) {
                reject(error)
            }
        })
    }
}

// module.exports={SQLite}