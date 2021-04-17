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

const news_entry = (news,obj,today) => {
        console.log(`Inserting data for ${obj.url}`)
        Object.entries(news).forEach(entry => {
            const [coin_nam, coin_news] = entry;
                        CoinModel.insertMany([
                            {coin_name:coin_nam, coin_data:coin_news}
                        ]).then(function(){
                            //console.log(`Data inserted for ${obj.url}, ${today.toUTCString()}`)
                        }).catch(function(error){
                            console.log(error)      
                        });
                 });
        console.log(`Data inserted for ${obj.url}, ${today.toUTCString()}`)
        return
    }



    app.use((req,res,next) =>{
        res.append('Access-Control-Allow-Origin', ['*']);
        res.append('Access-Control-Allow-Methods', 'GET,POST');
        res.append('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });



    app.get('/coin_news', async (req,res) => {

        const CalNews = await CoinMarketCal.scrape()
        const TelNews = await CoinTelegraph.scrape();
        res.send([CalNews,TelNews]);

    })

   



    app.get("/upload_coins", async(req,res) => {

        const CoinMarket_newspage= await CoinMarketCal.scrape();
        const TelNews_newspage= await CoinTelegraph.scrape();


        let today = new Date();
        let endOfToday = new Date();
        today.setHours(8,59) // conventional hours
        endOfToday.setHours(22,59) // closing before eleven o clock
        CoinModel.find({createdAt: {$gt: today.toISOString(), $lt: endOfToday.toISOString()}}, (err, docs) => {
            
            //looking for data in between end and beginning of today
            if (docs.length > 1)
            {
                res.send(`data for ${today.toLocaleDateString()} has already been written`)
            }
           

           // if no data found then insert in database
           else 
            {
                news_entry(TelNews_newspage,CoinTelegraph,today);
                news_entry(CoinMarket_newspage,CoinMarketCal,today);
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
        console.log(`Deleting data for ${CoinModel.collection.collectionName}`)
        CoinModel.deleteMany()
        .then((result) => {
            res.send(`Deleted data for ${CoinModel.collection.collectionName}`);
        })
        .catch((err) => {
            res.send("Error encounted");
        })
    });



    app.listen(port, () => {
        console.log(`Listening at http://localhost:${port}`)
    })