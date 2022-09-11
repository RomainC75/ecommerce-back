const generator = (commandId,addressObj,orderedProducts, total) =>{
    return `
        <h1>Command n°${commandId}</h1>
        <h2>This Part will be updated soon. Please wait ! </h2>
        <h2>Address :</h2>
        <p>${JSON.stringify(addressObj)}</p>
        <h2>Products :</h2>
        <p>${JSON.stringify(orderedProducts)}</p>
        <h2>Total : </h2>
        <p>${total}</p>
    `
}

module.exports={generator}
