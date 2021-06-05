// Search for Tweets within the past seven days
// https://developer.twitter.com/en/docs/twitter-api/tweets/search/quick-start/recent-search

const needle = require('needle');
const dotenv = require('dotenv');
const { Compare, current_coin_prices } = require("./compare_prices")
const dfd = require("danfojs-node")


dotenv.config();

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const token = process.env.TWIT_BEARER;

const endpoints = ['users', 'tweets']

const endpointUrl = `https://api.twitter.com/2/${endpoints[1]}/search/recent`;


async function getEndpoint(params) {

    const res = await needle('get', endpointUrl, params, {
        headers: {
            "User-Agent": "v2RecentSearchJS",
            "authorization": `Bearer ${token}`
        }
    })

    if (res.body) {
        return res.body;
    } else {
        throw new Error('Unsuccessful request');
    }
}



(async () => {

    try {

        const params_tweet = {
            'query': `#BTC`,
            'expansions': 'author_id',
            'tweet.fields': 'text,created_at',
            'user.fields': 'name',
            'max_results': 10,
        }



        const coins = await current_coin_prices(null, false)
        let tickers = Object.keys(coins)

        // Add list of coins and count of tweets per day, look for significant rises


            
        const df = new dfd.DataFrame({ columns: ["day", "Coin", "Count", "Retweets(SUM)", "Close", "Volume"] });
        let sma_value = SMA.calculate({ period: 20, values: sub_df["Close"].tail(20).values })

        for (i = 0; i <= tickers.length; i++) {
            counted = 0
            console.log(` \x1b[31m Getting #${tickers[i]} \x1b[0m`)
            while (true) {
                
                params_tweet['query'] = `#${tickers[i]}`;

                let response = await getEndpoint(params_tweet);
                params_tweet['next_token'] = response["meta"]["next_token"]
                
                let coins_mentioned = response['data'][1]['text'].match(/#[A-Z]{3,10}/g);
                let date = response['data'][1]['created_at'].split("T")[0];
                let user = response['includes']['users'][1]['username'];
                
                if (coins_mentioned != null && coins_mentioned.includes(`#${tickers[i]}`) == true ){
                    counted+=1;
                    console.log(`Counted ${tickers[i]} ${counted} times`)
                }


                if (!(params_tweet['next_token'])) {
                    console.log(`No more tweets to get for ${tickers[i]} \n Waiting 20 seconds`)
                    console.log(`Total count of ${tickers[i]}: ${counted}`)
                    
                    await new Promise(r => setTimeout(r, 20000));
                    continue
                    //console.log(`Amount of tweets for #${tickers[i]}: ${response.length}`)

                }
            }
        }
    } catch (e) {
        console.log(e);
    }
    process.exit();
})();