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
  return data;
  },
};




const CoinTelegraph = {


  url : "https://cointelegraph.com/tags/cryptocurrencies",
  



  async scrape(){
    let browser = await puppet.launch({headless:true})
    let page = await browser.newPage();
    let pictures = await CoinPictures.scrape()
    console.log(`getting ${this.url}`);
    await page.goto(this.url);

    let data = await page.evaluate(async () => {
    

      let re = /\([^)]*\)|\b[A-Z]{3,}\b/g
      coin_tel = coin_tel = Array.from(document.querySelectorAll('span[class=post-card-inline__title]'),e=>e.innerText.replace(/[^a-zA-Z0-9 ]/g, "").match(re));
      coin_news = Array.from(document.querySelectorAll('p[class=post-card-inline__text]'),e=>e.innerText);
      coin_date = Array.from(document.querySelectorAll('time[class="post-card-inline__date"]'), e => e.innerText);
      coin_views = Array.from(document.querySelectorAll('span[class="post-card-inline__stats-item"]'), e => e.innerText);
      
    return [coin_tel,coin_news,coin_date,coin_views];
    
})

const [coin_t, coin_n,coin_d,coin_v] = data;
let result_with_pict = {};
for (let i in coin_t ){
  if (coin_t[i] != null)
    {
      result_with_pict[coin_t[i][0]] = [coin_n[i],pictures[coin_t[i][0]],coin_d[i],coin_v[i]];
    }
  };
  return result_with_pict;

  },
}




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

    return data;
    },

    
    
};

module.exports = {CoinMarketCal,CoinTelegraph};

