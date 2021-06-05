// Search for Tweets within the past seven days
// https://developer.twitter.com/en/docs/twitter-api/tweets/search/quick-start/recent-search

const needle = require('needle');
const dotenv = require('dotenv');
const { Compare, current_coin_prices } = require("./compare_prices")


dotenv.config();

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const token = process.env.TWIT_BEARER;

const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";



async function getTweets(params) {

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

        const params = {
            'query': `#BTC`,
            'tweet.fields': 'text,created_at', // add date here
            'max_results': 10,
        }

                    
        const coins = await current_coin_prices(null, false)
        let tickers = Object.keys(coins)

        // Add list of coins and count of tweets per day, look for significant rises
        
        
        for (i = 0; i <= tickers.length; i++) {

            console.log(` \x1b[31m Getting #${tickers[i]} \x1b[0m`)
            while (true) {
                params['query'] = `#${tickers[i]}`;
                console.log(params['query'])
                
                let response = await getTweets(params);
                
                params['next_token'] = response["meta"]["next_token"]
                console.log(response['data'][1]['text']);
                
                if (!(params['next_token'])) {
                    console.log(`No more tweets to get for ${tickers[i]} \n Waiting 20 seconds`)
                    await new Promise(r => setTimeout(r, 20000));
                    //console.log(`Amount of tweets for #${tickers[i]}: ${response.length}`)

                }
            }
        }
    } catch (e) {
        console.log(e);
    }
    process.exit();
})();