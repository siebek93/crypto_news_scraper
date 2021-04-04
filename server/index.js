//npm = node package manager

const express = require('express')
const app = express()
const port = 2800
//const scraperController = require('./pageController');
const {CoinMarketCal,CoinTelegraph }= require('./pageScraper')
const CoinModel = require('../models/db')
const mongoose = require("mongoose");

const URlMon = process.env.Mongo;

mongoose.connect(URlMon,{useUnifiedTopology: true,useNewUrlParser: true})
    .then((succes) => {
        console.log("succes")})
    .catch((err) => {
        console.log("error",err)
    });


    



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

        const newspage_for= await CoinMarketCal.scraper();

        let today = new Date();
        let endOfTOday = new Date();
        today.setHours(0,0,0,0)
        endOfToday.setHours(23,59,59,999)

        CoinModel.find({createdAt: {$gt: today.toISOString(), $lt: endOfToday.toISOString()}}, (err, docs) => {
            
                //looking for data in between end and beginning of today
            if (docs.length > 1){
                res.send(`data for ${today.toUTCString()} has already been written`)}
           

                // if no data found then insert in database
           else {
               
                
                Object.entries(newspage_for).forEach(entry => {
                    const [_, value] = entry;
                    Object.entries(value).forEach(coin_entry => {
                                const [coin, coin_value] = coin_entry;
        
                                CoinModel.insertMany([
                                    {coin_name:coin, data_array:coin_value}
                                ]).then(function(){
                                    console.log(`Data inserted for ${today.toUTCString()}`)
                                }).catch(function(error){
                                    console.log(error)      
                                });
        
                    });
                });

            }
            
            
        });


        });

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