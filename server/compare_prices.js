const dotenv = require('dotenv');
dotenv.config();
const ccxt = require('ccxt')
const axios = require('axios');
const cheerio = require('cheerio');
const { base } = require('../models/db');
const dfd = require("danfojs-node")
const SMA = require('technicalindicators').SMA;


const BinanceClient =
    new ccxt.binance({
        apiKey: process.env.API_KEY,
        secret: process.env.API_SECRET


    });

const current_coin_prices = async (ticker = null, print_single = false) => {
    const webs = await axios.get('https://www.coingecko.com/en');
    const $ = await cheerio.load(webs.data);
    let obj = {};

    $('.table').each((i, elem) => {
        let coins = $(elem).find('div.center').children("a.d-lg-none").text().split('\n').filter(item => item);
        let names = $(elem).find('div.center').children("a.tw-hidden").text().split('\n').filter(item => item)
        let price = $(elem).find('td.td-price').text().split('\n').filter(item => item);
        // obj[coins] = price
        for (let i = 0; i < coins.length; i++) {
            obj[coins[i]] = [parseFloat(price[i].replace(/[^0-9.-]+/g, "")).toFixed(2), names[i]];
        }

        if (!(ticker)) { ticker = 'BTC' }// standard ticker}


    });
    if (print_single) {
        return [obj[`${ticker}`], obj['USDT']]
    }
    else {
        return obj
    }
}

const mockrun = async (coin, Client, seconds) => {
    Client.set_sandbox_mode(true) // set sandbox mode = true to use testnet
    let asset_base = await current_coin_price(coin);
    const config = {
        asset: asset_base[0], // ANY COIN FRom top 200
        base: asset_base[1], // USDT // possibly euro
        allocation: '0.1',
        spread: '0.2',
        coinInterval: seconds * 1000 //every 20 seconds = 20 * 1000 (this is in ms)
    }
    const { asset, base, allocation, spread, coinInterval } = config


    //     // use ids here
    const market_price = asset / base;
    const sell_price = market_price * (1 + spread);
    const buy_price = market_price * (1 - spread);

    (async () => {
        // await GetOpenOrders;
        const base_balance = 10000 * asset_base[1];
        const asset_balance = 0.002 * asset_base[0];
        const sell_volume = asset_balance * allocation;
        const buy_volume = (base_balance * allocation) / market_price
        console.log(`Can buy ${buy_volume} ${coin}`)


        console.log(`
    Created limit sell order for ${sell_volume}@${sell_price}
    Created limit buy order for ${buy_volume}@${buy_price}
            `)
        // setInterval(coin,coinInterval,config,BinanceClient)    

    })();

}


const GetPrices = async (coin) => {
    const prices = await BinanceClient.fetchOHLCV(`${coin}/USDT`
        , timeframe = '1d'
        , since = undefined
        , limit = 400
        , params = {}
    );
    const todatetime = (x) => {
        x[0] = new Date(x[0]).toISOString().split("Z")[0]
        return x
    }
    let prices_time_stamped = prices.map(todatetime)

    const df = new dfd.DataFrame(prices_time_stamped, { columns: ["time", "Open", "High", "Low", "Close", "Volume"] });
    let sub_df = df.loc({ columns: ["time", "Close", 'Volume'] })
    let sma_value = SMA.calculate({ period: 20, values: sub_df["Close"].tail(20).values })

    return Math.round(sma_value.slice(-1)[0] * 100) / 100;

};



const Compare = (async (coin, print = false,fullna=true) => {
    const tickersAndCurrent_price = await current_coin_prices(coin, false)
    const ind = GetPrices;
    tickers_to_buy = {}
    tickers_to_sell = {}

    for (let tick of Object.keys(tickersAndCurrent_price)) {
        let sma_20 = await ind(tick).catch(e => { `binance does not have market symbol ${tick}/USDT` })
        current_price = Number(tickersAndCurrent_price[tick][0])
        full_name = String(tickersAndCurrent_price[tick][1])
        if (print) {
            //sell here
            if (sma_20 < current_price) {

                console.log(`\x1b[31mSMA: ${String(sma_20)} <\t Current ${current_price}`);
                console.log(`SMA LOWER then current price for ${tick}, (overbought) do not buy..... \x1b[0m`)
            }
           

            //buy here
            else if (sma_20 > current_price) {
                console.log(`\x1b[32mSMA: ${String(sma_20)} <\t Current ${current_price}`);
                console.log(`SMA HIGHER then current price for ${tick}, (oversold) BUYBUYBUY \x1b[0m`)

            }
        }
        else {
            //sell here
            if (fullna) {
                if (sma_20 < current_price) {
                    tickers_to_sell[tick] = [full_name];

                }

                //buy here
                else if (sma_20 > current_price) {
                    tickers_to_buy[tick] = [full_name];

                }
            }
            else {
                if (sma_20 < current_price) {
                    tickers_to_sell[tick] = [current_price, sma_20];

                }

                //buy here
                else if (sma_20 > current_price) {
                    tickers_to_buy[tick] = [current_price, sma_20];

                }


            }
        }



    }
    return [tickers_to_buy, tickers_to_sell]

})();



module.exports = { Compare, current_coin_prices }



