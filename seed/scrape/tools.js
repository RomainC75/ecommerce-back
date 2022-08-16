const clickCookiesButton = async (page) =>{
    console.log('click cookies button')
    await page.waitForSelector('#onetrust-accept-btn-handler')
    // const buttons = await page.$x("//button[contains(., 'Tout accepter')]");
    const buttons = await page.$("#onetrust-accept-btn-handler");
    //   console.log(buttons)
    if (buttons[1]) {
        await buttons[1].click();
        }
}

const scrollSection =  (page,sectionSelector) => {
    return new Promise (async (resolve, reject)=>{
        console.log('INSIDE');
        page.on('console', msg => console.log(msg.text()));
        await page.waitForSelector(sectionSelector);

        /*
        await page.evaluate( async selector => {
            const scrollableSection = document.querySelector(selector).childNodes[0].childNodes[1];
            console.log(scrollableSection);
            scrollableSection.scrollTop = scrollableSection.offsetHeight;
            
            // await scrollableSection.waitForNetworkIdle();
            // console.log('->li : ',scrollableSection.querySelectorAll('li'));
        },sectionSelector);
        */

        const sectionToScroll = await page.$(sectionSelector);
        console.log('section to scroll',sectionToScroll);
        
        let arrayToSaveRef = [];
        let arrayToSaveNew = this.serializedObjectToArray(await sectionToScroll.$$eval('li',lis=>lis.map(li=>li.querySelector('a').getAttribute('href'))));
        const listOfFriends = [];
        console.log('arrayToSaveNew', arrayToSaveNew,typeof arrayToSaveNew, arrayToSaveNew.length);
        let multiple=0;
        do{
            arrayToSaveRef=[...arrayToSaveNew];
            await Promise.all([
                await page.evaluate( selector => {
                    const scrollableSection = document.querySelector(selector).childNodes[0].childNodes[1];
                    //console.log(scrollableSection);
                    //scrollableSection.scrollTop = scrollableSection.offsetHeight+(600*multiple);
                    setTimeout(scrollableSection.scrollBy(0,800),2000);

                },sectionSelector),
                await page.waitForNetworkIdle(),

            ]);
            arrayToSaveNew = this.serializedObjectToArray(await sectionToScroll.$$eval('li',lis=>lis.map(li=>li.querySelector('a').getAttribute('href'))));
            console.log('--> temps : ',arrayToSaveNew.length,'--> list of friends :',listOfFriends.length);
            arrayToSaveNew.forEach(friend=>{
                if(listOfFriends.includes(friend)){
                    listOfFriends.push(friend);
                }
            });

        }while(arrayToSaveRef[arrayToSaveRef.length-1] != arrayToSaveNew[arrayToSaveNew.length-1]);

    })
}

module.exports={clickCookiesButton}