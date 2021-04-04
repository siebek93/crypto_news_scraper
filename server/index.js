//npm = node package manager

const express = require('express')
const app = express()
const port = 2800
const {CoinMarketCal,CoinTelegraph }= require('./pageScraper')
const CoinModel = require('../models/db')
const mongoose = require("mongoose");


mongoose.connect(process.env.MONG,{useUnifiedTopology: true,useNewUrlParser: true})
    .then((succes) => {
        console.log("succes")})
    .catch((err) => {
        console.log("error",err)
    });

const news_entry = (news) => { //possibly turn into array
        let today = new Date();
        Object.entries(news).forEach(entry => {
            const [coin_nam, coin_news] = entry;
          
                        CoinModel.insertMany([
                            {coin_name:coin_nam, coin_array:coin_news}
                        ]).then(function(){
                            console.log(`Data inserted for ${coin_nam}, ${today.toUTCString()}`)
                        }).catch(function(error){
                            console.log(error)      
                        });
                 });
        return
    }



    app.use((req,res,next) =>{
        res.append('Access-Control-Allow-Origin', ['*']);
        res.append('Access-Control-Allow-Methods', 'GET,POST');
        res.append('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });



    app.get('/coin_news', async (req,res) => {

        const CalNews = await CoinMarketCal.scraper()
        const TelNews = await CoinTelegraph.scraping();
        res.send([CalNews,TelNews]);

    })




    app.get("/upload_coins", async(req,res) => {

        const CoinMarket_newspage= await CoinMarketCal.scraper();
        const TelNews_newspage= await CoinTelegraph.scraping();


        // let today = new Date();
        // let endOfToday = new Date();
        // today.setHours(0,0,0,0)
        // endOfToday.setHours(23,59,59,999)

        // CoinModel.find({createdAt: {$gt: today.toISOString(), $lt: endOfToday.toISOString()}}, (err, docs) => {
            
        //         //looking for data in between end and beginning of today
        //     if (docs.length > 1){
        //         res.send(`data for ${today.toUTCString()} has already been written`)}
           

        //         // if no data found then insert in database
        //    else {
               
             

            news_entry(TelNews_newspage);
            news_entry(CoinMarket_newspage);

            // }
            
            
        });


        // });

    app.get("/saved_coins",(req,res) => {

            CoinModel.find()
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                res.send(err);
            })
        });


    app.get("/delete_coins",(req,res) => {

        CoinModel.deleteMany()
        .then((result) => {
            res.send(`Deleted model ${CoinModel}`);
        })
        .catch((err) => {
            res.send("Error encounted");
        })
    });



    app.listen(port, () => {
        console.log(`Listening at http://localhost:${port}`)
    })