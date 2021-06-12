// Search for Tweets within the past seven days
// https://developer.twitter.com/en/docs/twitter-api/tweets/search/quick-start/recent-search

const needle = require('needle');
const dotenv = require('dotenv');
const { Compare, current_coin_prices } = require(process.cwd()+'\\compare_prices')
const dfd = require("danfojs-node");
const { data } = require('cheerio/lib/api/attributes');
const fs = require('fs');


dotenv.config();

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const token = process.env.TWIT_BEARER;

const userNamesEndPoint = `https://api.twitter.com/2/users/by?usernames=`;
let influencers = fs.readFileSync('list_of_influencers.txt', 'utf8').toString();



async function getEndpoint(url, params) {

    const res = await needle('get', url, params, {
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

        const params_influencers = {
            usernames: influencers, // Edit usernames to look up
            "user.fields": "created_at,description", // Edit optional query parameters here
            "expansions": "pinned_tweet_id"
        }

        const params_tweets = {
            "max_results": 100,
            "tweet.fields": "created_at",
            "expansions": "author_id"
        }


        //const coins = await current_coin_prices(null, false)
        //const tickers = Object.keys(coins)
        const df = new dfd.DataFrame({ columns: ["Day", "Coin", "Count", "Retweets(SUM)", "Username"] });

        let users = await getEndpoint(userNamesEndPoint, params_influencers);
        coins_mentioned_tot = []
        for (let user of users["data"]) {

            console.log(`Getting tweets for ${user['username']}`);

            let tweets = await getEndpoint(`https://api.twitter.com/2/users/${user['id']}/tweets`, params_tweets);
            dict = {}
            try {
                tweets['data'].forEach(tweet => {
                    
                    let coins_mentioned = tweet['text'].match(/\$[A-Za-z]{3,6}/g);
                    let date = tweet['created_at'].split("T")[0];
                    if (coins_mentioned !== null) {
                        dict[date] = coins_mentioned.map(coins => coins.toLowerCase())
                        coins_mentioned_tot.push(dict) 
                    }

                });

            } catch (error) {
                console.log(error)
                console.log(`No more tweets to get for ${user['username']} \n Waiting 20 seconds`)
            }

        }


        const result = {}
        for (let i = 0; i < coins_mentioned_tot.length; i++) {
            console.log(Object.keys(coins_mentioned_tot[i]));}
        // for(const {datum, coins} of coins_mentioned_tot.flat(3)) {
        //     // if(!result[datum]) result[datum] = [];
        //     // result[datum].push({coins });
        //   }

        // let coins_m = {};
        // flat_coins_array = coins_mentioned_tot.flat()
        // for (let i = 0; i < flat_coins_array.length; i++) {
        //     coins_m[flat_coins_array[i]] = (coins_m[flat_coins_array[i]] || 0) + 1;
        // }
        // console.log(coins_m);

    } catch (e) {
        console.log(e, 'No more tweets to get');
    }
    process.exit();
})();