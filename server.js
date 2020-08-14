const graphql = require('graphql-request');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const corona_url = "https://corona-api.kompa.ai/graphql";

const query = `query countries {
    countries {
        Country_Region
        Confirmed
        Deaths
        Recovered
    }
}`

const graphqlClient = new graphql.GraphQLClient(corona_url, {
    headers: {
        Authority: "corona-api.kompa.ai",
        Scheme: "https",
        Path: "/graphql",
        Accept: "*/*",
        UserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36",
        Origin: "https://corona.kompa.ai",
        secfetchsize: "same-site",
        secfetchmode: "cors",
        Referer: "https://corona.kompa.ai",
        AcceptEncoding: "gzip, deflate, br",
        AcceptLanguage: "vn-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5"
    }
})

app.get('/', (req, res) => {
    graphqlClient.request(query).then(data => {
        let dataJson = {};
        dataJson.vietnam = {};
        dataJson.global = {};

        let confirmedGlobal = 0, confirmedVietnam = 0;
        let dieGlobal = 0, dieVietnam = 0;
        let recoveredGlobal = 0, recoveredVietnam = 0;

        data.countries.forEach(item => {
            confirmedGlobal += (item.Confirmed) ? parseInt(item.Confirmed) : 0;
            dieGlobal += (item.Deaths) ? parseInt(item.Deaths) : 0;
            recoveredGlobal += (item.Recovered) ? parseInt(item.Recovered) : 0;
            
            if(item.Country_Region == 'Vietnam'){
                confirmedVietnam = (item.Confirmed) ? parseInt(item.Confirmed) : 0;
                dieVietnam = (item.Deaths) ? parseInt(item.Deaths) : 0;
                recoveredVietnam = (item.Recovered) ? parseInt(item.Recovered) : 0;
            }
        });

        dataJson.global.cases = confirmedGlobal;
        dataJson.global.deaths = dieGlobal;
        dataJson.global.recovered = recoveredGlobal;
        dataJson.vietnam.cases = confirmedVietnam;
        dataJson.vietnam.deaths = dieVietnam;
        dataJson.vietnam.recovered = recoveredVietnam;
        
        res.status(200).json(dataJson);
    }).catch(err => {
        res.send(err);
        console.log(err);
    })
})

app.get('/api', (req, res) => {
    graphqlClient.request(query).then(data => {
        let dataJson = {};
        dataJson.vietnam = {};
        dataJson.global = {};

        let confirmedGlobal = 0, confirmedVietnam = 0;
        let dieGlobal = 0, dieVietnam = 0;
        let recoveredGlobal = 0, recoveredVietnam = 0;

        data.countries.forEach(item => {
            confirmedGlobal = confirmedGlobal + parseInt(item.Confirmed);
            dieGlobal = dieGlobal + parseInt(item.Deaths);
            recoveredGlobal = recoveredGlobal + parseInt(item.Recovered);
            if(item.Country_Region == 'Vietnam'){
                confirmedVietnam = parseInt(item.Confirmed);
                dieVietnam = parseInt(item.Deaths);
                recoveredVietnam = parseInt(item.Recovered);
            }
        });

        dataJson.global.cases = confirmedGlobal;
        dataJson.global.deaths = dieGlobal;
        dataJson.global.recovered = recoveredGlobal;
        dataJson.vietnam.cases = confirmedVietnam;
        dataJson.vietnam.deaths = dieVietnam;
        dataJson.vietnam.recovered = recoveredVietnam;

        res.status(200).json(dataJson[req.query.q]);
    }).catch(err => {
        res.send(err);
        console.log(err);
    })
})

app.get('/countries', (req, res) => {
    graphqlClient.request(query).then(data => {
        let dataJson = [];

        data.countries.forEach(item => {
            let data = {};
            
            data.Country_Region = item.Country_Region;
            data.Confirmed = item.Confirmed;
            data.Deaths = item.Deaths;
            data.Recovered = item.Recovered;

            dataJson.push(data);

        });
        
        res.status(200).json(dataJson);
    }).catch(err => {
        res.send(err);
        console.log(err);
    })
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running");
})