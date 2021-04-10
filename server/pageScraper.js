const puppet = require("puppeteer");



const CoinPictures= {


  url : "https://cryptologos.cc/",


  

  async scrape(){
      let browser = await puppet.launch({headless:true})
      let page = await browser.newPage();
      console.log(`getting pictures`);
      await page.goto(this.url);
      

    let data = await page.evaluate(async () => {
    img = Array.from(document.querySelectorAll('img[class="div-middle-img"]'), e => e.src)
    coin_name = Array.from(document.querySelectorAll('div[class="div-middle-text"]'), e => e.innerText.match(/\(([^)]+)\)/)[1])
    var result = {};
    for (let i in coin_name){
      if (coin_name[i] != null)
        {
        result[coin_name[i]] = img[i];
        }
    };

    return result;

  })
  console.log(data)
  return data;
  },
};


const CoinTelegraph = {


  url : "https://cointelegraph.com/tags/cryptocurrencies",

  pictures: CoinPictures.scrape(),

  async scrape(){
    let browser = await puppet.launch({headless:true})
    let page = await browser.newPage();
    console.log(`getting ${this.url}`);
    await page.goto(this.url);
    
    

  let data = await page.evaluate(async () => {
    let re = /\([^)]*\)|\b[A-Z]{3,}\b/g

    coin_picture = this.pictures
    coin_tel = Array.from(document.querySelectorAll('span[class=post-card-inline__title]'),e=>e.innerText.match(re));
    coin_news = Array.from(document.querySelectorAll('p[class=post-card-inline__text]'),e=>e.innerText);
    coin_date = Array.from(document.querySelectorAll('time[class="post-card-inline__date"]'), e => e.innerText);
    coin_views = Array.from(document.querySelectorAll('span[class="post-card-inline__stats-item"]'), e => e.innerText);

    var result = {};
    for (let i in coin_tel ){
      if (coin_tel[i] != null)
        {
         result[coin_tel[i]] = [coin_news[i],coin_date[i],coin_views[i],coin_picture[coin_tel[i]]];
        }
    };

    return result;

})
//console.log(data)

return data;
},

};




const CoinMarketCal = {

    url : "https://coinmarketcal.com/en/highlights",
    
    //function

    
    async scrape(){
    let browser = await puppet.launch({headless:true})
    let page = await browser.newPage();
    console.log(`getting ${this.url}`);
    await page.goto(this.url);
    await page.waitForSelector('.card', {
        visible: true,});
    
    

    let data = await page.evaluate(async () => {



            
      let ScrollingFunc = async () => {
        await window.scrollBy({
          top: 1800,
          behavior: 'smooth'
        });

        await new Promise(resolve => setTimeout(resolve, 3000));
        window.scrollTo(0, document.body.scrollHeight/8) 
      }



      await ScrollingFunc();

      let coin_title = Array.from(document.querySelectorAll('a[class="link-detail ellipsis"]'), e => e.innerText);
      let event = Array.from(document.querySelectorAll('a[class="card__title"]'), e => e.innerText);
      let date =  Array.from(document.querySelectorAll('strong[class="mr-1"]'), e => e.innerText)

      let image_url = [];
      for (i in coin_title){
            image_url.push(document.querySelector(`img[alt="${coin_title[i].split(/[)]+/)[0]+')'}"]`).src);
        }

    var result = {};
    for (let i in coin_title ){
      if (coin_title[i] != null)
        {
         result[coin_title[i].split(/[()]+/)[1]] = [event[i],image_url[i],date[i],coin_title[i]];
        }
    };
    

    return result
  });
  //console.log(data)

    return data;
    },

    
    
};


console.log(CoinPictures.scrape())
module.exports = {CoinMarketCal,CoinTelegraph};

