const graphql = require('graphql-request');
const express = require('express');
const cors = require('cors');
const app = express();

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
    swaggerDefinition: {
      info: {
        version: "1.0.0",
        title: "Swagger API ncov",
        description: "Swagger API ncov",
        contact: {
          name: "Tất Trung"
        },
        servers: ["http://localhost:5000"]
      }
    },
    // ['.routes/*.js']
    apis: ["server.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

/**
 * @swagger
 * /:
 *  get:
 *    summary: "Get info for vietnam and global"
 *    description: Get info for vietnam and global
 *    responses:
 *      '200':
 *        description: A successful response
 */
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
        res.status(400).json({ err: err.message });
    })
})

/**
 * @swagger 
 * /search:
 *  get:
 *    summary: "Search by country region"
 *    description: Search by country region
 *    parameters:
 *      - name: "country"
 *        in: "query"
 *        description: "Country region name"
 *        required: true
 *        type: "string"
 *    responses:
 *      '200':
 *        description: A successful response
 *      '400':
 *        description: Requires country param
 */
app.get('/search', (req, res) => {
    const { country } = req.query;
    graphqlClient.request(query).then(data => {
        let dataJson = [];

        data.countries.forEach(item => {
            let data = {};
            
            data.Country_Region = (item.Country_Region) ? item.Country_Region : 0;
            data.Confirmed = (item.Confirmed) ? item.Confirmed : 0;
            data.Deaths = (item.Deaths) ? item.Deaths : 0;
            data.Recovered = (item.Recovered) ? item.Recovered : 0;

            dataJson.push(data);
        });
        res.status(200).json(dataJson.find(item => item.Country_Region.toLowerCase().includes(country.toLowerCase())));
    }).catch(err => {
        res.status(400).json({
            err: 1,
            message: "Requires country param",
            path: "/api-docs"
        });
    })
})

/**
 * @swagger
 * /countries:
 *  get:
 *    summary: "Get info for each countries"
 *    description: Get info for each countries
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.get('/countries', (req, res) => {
    graphqlClient.request(query).then(data => {
        let dataJson = [];

        data.countries.forEach(item => {
            let data = {};
            
            data.Country_Region = (item.Country_Region) ? item.Country_Region : 0;
            data.Confirmed = (item.Confirmed) ? item.Confirmed : 0;
            data.Deaths = (item.Deaths) ? item.Deaths : 0;
            data.Recovered = (item.Recovered) ? item.Recovered : 0;

            dataJson.push(data);
        });
        
        res.status(200).json(dataJson);
    }).catch(err => {
        res.status(400).json({ err: err.message });
    })
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running");
})