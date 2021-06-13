const needle = require('needle');
const dotenv = require('dotenv');
dotenv.config();
const cwd = process.env.CWD
const dfd = require("danfojs-node");
const { data } = require('cheerio/lib/api/attributes');
const fs = require('fs');
const { ConsoleMessage } = require('puppeteer');
const { Tweets } = require(cwd + '\\twitter2.js')
dotenv.config();



const Get_data =
    (async () => {
        const t = await Tweets;
        df = new dfd.DataFrame(t)
        // df.print()
        // df.ctypes.print()
    })()

Get_data;
