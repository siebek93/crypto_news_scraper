const twitBot = require("twit")
const dotenv = require('dotenv');
const {Compare, current_coin_prices} = require("./compare_prices")

dotenv.config();



const TB = new twitBot({
    consumer_key: process.env.API_KEY_TWIT,
    consumer_secret: process.env.API_SECRET_TWIT,
    access_token: process.env.ACCESS_TWIT,
    access_token_secret: process.env.ACCESS_TWIT_SECR

})

const GetTweets = (ticker,date) => {


    return new Promise((resolve, reject) => {
        let params = {
            q: `#${ticker} since:${date}`,
            count: 8

        };
        TB.get('search/tweets', params, (err, data) => {

            if (err) {
                return reject(err)
            }
            else {
                return resolve(data)
            }
        })
    }
    )
};



const main = async () => {
    let d = new Date();
    const coins  = await current_coin_prices(null, false)
    let tickers = Object.keys(coins)

    for (i = 0; i <= tickers.length; i++) {
        let date_get = d.setDate(d.getDate() - i);
        let get_date = String(new Date(date_get).toISOString().slice(0,10))
        
        console.log(` \x1b[31m Getting #${tickers[i]} for ${get_date} \x1b[0m`)
        
        const data = await GetTweets(tickers[i], get_date);
        const tweets = data.statuses
        
        try {
            for await (let tweet of tweets) {
                console.log(tweet.text)
            }
        } catch (error) {
            console.log(error)
        }
    }

}



main()