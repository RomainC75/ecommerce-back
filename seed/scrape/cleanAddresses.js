const fs = require('fs')
const data = require('./data.json')

const recFile = (newData,fileName) =>{
    fs.writeFile(
      fileName,
      JSON.stringify(newData),
      "utf8",
      function (err) {
            if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
        }
        console.log("JSON file has been saved.");
      }
    );
}



// console.log(data.flat())

const bigData = data.flat().reduce((accu,current)=>{
    return current.status==="fulfilled" ? accu.concat(current.value) : accu
},[])

recFile(Array.from(new Set(bigData)),'productAddresses.json')