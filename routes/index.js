var express = require('express');
var app = express.Router();
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const { options } = require('../../backend2/api/routes');
app.use(bodyParser.json());



let settings = { method: "Get" ,headers: {"user-key": "57f6af810a9c2dbdd3c739c629a33808"}};
let settings2 = { method: "Get",headers: {"Content-Type" : "application/json"}};

app.use(express.static('public'));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
  
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
  
    // Pass to next layer of middleware
    next();
});

/**
 * * MyAPI KEY:57f6af810a9c2dbdd3c739c629a33808
 * * Spencer API KEY: f4b69d2a39a518510a7e0b67603c6c32
 */


// * var name  = json.restaurants[i].restaurant.name;
// * var address  = json.restaurants[i].restaurant.location.address;
// * var locality  = json.restaurants[i].restaurant.location.locality;
// * var city_id  = json.restaurants[i].restaurant.location.city_id;
// * var zipcode  = json.restaurants[i].restaurant.location.zipcode;
// * var country_id  = json.restaurants[i].restaurant.location.country_id;
// * var cuisines  = json.restaurants[i].restaurant.cuisines;
// * var average_cost_for_two  = json.restaurants[i].restaurant.average_cost_for_two;
// * var price_range  = json.restaurants[i].restaurant.price_range;
// * var logo  = json.restaurants[i].restaurant.thumb;
// * var user_rating  = json.restaurants[i].restaurant.user_rating.aggregate_rating;
// * var phone_numbers  = json.restaurants[i].restaurant.phone_numbers;
// * var establishment  = json.restaurants[i].restaurant.establishment;


var cityID;
var query;
var budget;
var arr = [];
var count = 0
app.get('/', function(req, res, next) {
    // res.render('index', { title: 'Express' });
    res.send('Welcome to backend se');

    // fetch('http://localhost:3000/getDetails', settings2)
    // .then((resp) => resp.json())
    // .then(function(data){
    //     console.log(data.data[0].name);
    // })
    // .catch(function(error) {
    //     console.log(error);
    //   });
    
});


app.post("/getAddress", function(req, res){
    var address = req.body.address;
    var landmark = req.body.landmark;
    var zipcode = req.body.zipcode;
    var city = req.body.city;
    var state = req.body.state;
    //res.json({ "address": req.body.address, "landmark": req.body.landmark, "zipcode":req.body.zipcode, "city": req.body.city, "state": req.body.state});
    console.log("address: " + address, "landmark: " + landmark, "zipcode: " + zipcode, "city: "+ city, "state: "+ state);
    cityDetail(city, state);
    res.json({
        status: 'SUCCESS, api got the address'
    })
    //res.end();
    // return res.render("success");
    
  });

app.post("/getQuery", function(req, res){
    query = req.body.queries;
    budget = req.body.budget;

    console.log("query: "+ query);
    console.log("budget: "+ budget);
    arr =[]
    search(cityID,query,budget)
    // console.log(query[0])
})


app.post("/getRestaurants", function(req, res){
    var response = req.body.status;
    console.log("response: "+response);
    res.json({
        status: 'SUCCESS, api got the address'
    })
})


//https://developers.zomato.com/api/v2.1/cities\?q\=melbourne
async function cityDetail(city, state){
    let url2 = "https://developers.zomato.com/api/v2.1/cities?q=" + city;
    // console.log(url2);
    // console.log("in city details");
    
    await fetch(url2, settings)
    .then(res => res.json())
    .then((json) => {
        var options = json.location_suggestions.length; //cities with the same name
        console.log("options: "+ json.location_suggestions.length);
        for(var i=0; i<options; i++){
            if(json.location_suggestions[i].state_name == state ){
                cityID = json.location_suggestions[i].id;
            }
        }
    });
    console.log("city id: "+ cityID);

}





app.post('/post', function(req, res) {
    let request = 
    {
        "data": arr,
        "count": count
    }
    res.send(request);
  }); 
    

app.get('/getDetails', function(req, res, next){
    let request = 
    {
        "data": arr,
        "count": count
    }
    res.send(request);
    
    console.log(request.count);
})


//* https://developers.zomato.com/api/v2.1/search?entity_id=89&entity_type=city&q=sushi&count=20&sort=rating&order=desc
// * $= under $10
// * $$=11–30
// * $$$=31–60
// * $$$$=$60-100
// * $$$$$ = over 100

function search(id, q, budg){
    var range;
    if(budg <= 10 ){
        range = 1
    }else if(10<budg <=30){
        range = 2
    }else if(30<budg <=60){
        range = 3
    }else if(60 < budg <= 100){
        range = 4
    }else{
        range=5
    }
    let url = "https://developers.zomato.com/api/v2.1/search?entity_id="+ id +"&entity_type=city&q="+q+"&count=20&sort=rating&order=desc";
    fetch(url, settings)
    .then(res => res.json())
    .then((json) => {
        console.log(json);
        var options = json.results_shown;
        console.log(json.results_found);
        console.log("length: "+ arr.length)
        for(var i = 0; i< options; i++){
            var price_range = json.restaurants[i].restaurant.price_range
            if(price_range <= range){
                console.log("image: "+json.restaurants[i].restaurant.thumb+ " name: "+  json.restaurants[i].restaurant.name + " rating: "+ json.restaurants[i].restaurant.user_rating.aggregate_rating)
                arr.push({
                    image : json.restaurants[i].restaurant.thumb, 
                    name : json.restaurants[i].restaurant.name,
                    rating : json.restaurants[i].restaurant.user_rating.aggregate_rating
                });
                count++;
            }
        }

    });


}

module.exports = app;



// * Latitude: 21.549666929051295
// * Longitude: 39.22890247210602
// sendGetRestaurant = async () => {
//     try {
//         const resp = await axios.get('https://developers.zomato.com/api/v2.1/search?lat='+this.state.Latitude+'&lon='+this.state.Longitude,{
//             headers: {"user-key": "Access Key"}
//         });
//         console.log(resp.data);
//     } catch (err) {
//         console.error(err);
//     }
// }







//* paths for getting the values from jsom for search

// var address = req.body.address;
    // var landmark = req.body.landmark;
    // var zipcode = req.body.zipcode;
    // var city = req.body.city;
    // var state = req.body.state
    
    // console.log("address: " + address, "landmark: " + landmark, "zipcode: " + zipcode, "city: "+ city, "state: "+ state);
    // fetch(url, settings)
    // .then(res => res.json())
    // .then((json) => {
    //     console.log(json);
    //     var options = json.results_shown;
    //     console.log(json.results_found);

    //     for(var i=0; i<options; i++){
    //         console.log("res_id "+json.restaurants[i].restaurant.R.res_id,
    //         " name "+json.restaurants[i].restaurant.name,
    //         " address " + json.restaurants[i].restaurant.location.address,
    //         " locality " + json.restaurants[i].restaurant.location.locality,
    //         " city_id " + json.restaurants[i].restaurant.location.city_id,
    //         " zipcode " + json.restaurants[i].restaurant.location.zipcode,
    //         " country_id " + json.restaurants[i].restaurant.location.country_id,
    //         " cuisines " + json.restaurants[i].restaurant.cuisines,
    //         " average_cost_for_two " + json.restaurants[i].restaurant.average_cost_for_two,
    //         " price_range " + json.restaurants[i].restaurant.price_range,
    //         " logo " + json.restaurants[i].restaurant.thumb,
    //         " user_rating " + json.restaurants[i].restaurant.user_rating.aggregate_rating,
    //         " phone_numbers " + json.restaurants[i].restaurant.phone_numbers,
    //         " establishment " + json.restaurants[i].restaurant.establishment,
    //         );

    //         console.log("");
    //         console.log("");
    //     }
    // });