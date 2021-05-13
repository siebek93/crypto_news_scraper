const dotenv = require('dotenv');
dotenv.config();
const ccxt = require('ccxt')
const axios = require('axios');
const cheerio = require('cheerio');
const { base } = require('../models/db');


const BinanceClient = 
        new ccxt.binance({
                apiKey:process.env.API_KEY,
                secret:process.env.API_SECRET
                

        });

const coin_price = async(ticker) => {
        const webs = await axios.get('https://www.coingecko.com/en');
        const $ = await cheerio.load(webs.data);
        let obj = {};
        
         $('.table').each((i, elem) => {
            let coin =  $(elem).find('div.center').children("a.d-lg-none").text().split('\n').filter(item => item);
            let price = $(elem).find('td.td-price').text().split('\n').filter(item => item);
            obj[coin] = price
            for(var i = 0; i < coin.length; i++)
            {
                obj[coin[i]] = parseFloat(price[i].replace(/[^0-9.-]+/g,"")).toFixed(2);
            }
        }); 
        return [obj[`${ticker}`],obj['USDT']]
}


const run = async(coin,Client,seconds) => {
    Client.set_sandbox_mode(true) // set sandbox mode = true to use testnet
    let asset_base  = await coin_price(coin);
    const config  = {
        asset: asset_base[0], // ANY COIN FRom top 200
        base: asset_base[1], // USDT // possibly euro
        allocation: '0.1',
        spread: '0.2',
        coinInterval: seconds * 1000 //every 20 seconds = 20 * 1000 (this is in ms)
    }
    const {asset,base,allocation,spread,coinInterval} = config
    const pair = `${asset/base}`;

    // check for open orders

 const GetOpenOrders = (async ()  => {
 const OpenOrders = await Client.fetchOpenOrders(coin+"/USDT", {'recvWindow': 10000000}).catch(e => { console.log(e) })
 if ( OpenOrders.length == 0){
       console.log("No orders found....going further");
    }
    
    else  {
        // close all orders
        OpenOrders.forEach( async order => {
            await Client.cancelOrder(order.id);
            console.log(`Canceled order ${order.id}`) 
        }) 
    }
})();




const GetPrices = (async () => {
    const prices = await BinanceClient.fetchOHLCV('BTC/USDT', timeframe='1m', since=undefined, limit=undefined, params=

    {});
})();


    //     // use ids here
    const market_price = asset / base;
    const sell_price = market_price * (1+spread);
    const buy_price = market_price * (1-spread);
    
    (async () => {
    await GetOpenOrders
    const balance  = await Client.fetchBalance()
    const asset_balance = balance.free[(coin)]
    const base_balance = balance.free[("USDT")]
    const sell_volume = asset_balance * allocation;
    const buy_volume =(base_balance* allocation) /market_price
    console.log(`Can buy ${buy_volume} ${coin}`)

})();
}
    //     // await Client.CreateLimitSellOrder(coin+"/USDT",sell_volume,sell_price)
    //     // await Client.CreateLimitBuyOrder(coin+"/USDT",buy_volume,buy_price)

    //     // console.log(`
    //     //     Created limit sell order for ${sell_volume}@${sell_price}
    //     //     Created limit buy order for ${buy_volume}@${buy_price}
    //     // `)


    //     setInterval(coin,coinInterval,config,BinanceClient)    

    //}
    

console.log(run("BTC", BinanceClient,20));



