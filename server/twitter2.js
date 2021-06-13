// Search for Tweets within the past seven days
// https://developer.twitter.com/en/docs/twitter-api/tweets/search/quick-start/recent-search

const needle = require('needle');
const dotenv = require('dotenv');
dotenv.config();

const cwd = process.env.CWD
const { Compare, current_coin_prices } = require(cwd + '\\compare_prices')
const dfd = require("danfojs-node");
const { data } = require('cheerio/lib/api/attributes');
const fs = require('fs');
const { ConsoleMessage } = require('puppeteer');



// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const token = process.env.TWIT_BEARER;

const userNamesEndPoint = `https://api.twitter.com/2/users/by?usernames=`;
let influencers = fs.readFileSync(cwd + '\\list_of_influencers.txt', 'utf8').toString();



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


Tweets = (async () => {

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


        let users = await getEndpoint(userNamesEndPoint, params_influencers);
        coins_mentioned_tot = []

        for (let user of users["data"]) {

            console.log(`Getting tweets for ${user['username']}`);


            let tweets = await getEndpoint(`https://api.twitter.com/2/users/${user['id']}/tweets`, params_tweets);
            try {

                tweets['data'].forEach(tweet => {

                    let coins_mentioned = tweet['text'].match(/\$[A-Za-z]{3,6}/g);
                    let date = tweet['created_at'].split("T")[0];
                    if (coins_mentioned !== null) {
                        dict = { date: date, coin: coins_mentioned.map(coins => coins.toLowerCase()) }

                        coins_mentioned_tot.push(dict)
                    }


                });


            } catch (error) {
                console.log(error)
                console.log(`No more tweets to get for ${user['username']} \n Waiting 20 seconds`)
            }

        }
        const result = {}
        for (const { date, coin } of coins_mentioned_tot) {

            if (!result[date]) result[date] = [];
            result[date].push(...coin);
        }

        console.log(result);



    } catch (e) {
        console.log(e, 'No more tweets to get');
    }
    process.exit();
})();



// module.exports = { Tweets };