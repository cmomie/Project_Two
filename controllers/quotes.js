const express = require('express');
const router = express.Router();
const passport = require('../config/ppConfig');
const db = require('../models');
const axios = require("axios");
const isLoggedIn = require('../middleware/isLoggedIn')
const apiKey = process.env.APIKEY

router.get('/',isLoggedIn, (req, res)=>{
    db.quotes.findAll({
        where: {userId: req.user.id},
        include: [db.user]
    })
    .then(quotes =>{
        res.render('quote', {quotes})
    })
    .catch(function (error) {
        console.error(error);
        res.redirect('/')
    });
    })

    router.post('/',isLoggedIn, (req, res)=>{
    const options = {
        method: 'GET',
        url: 'https://quotes15.p.rapidapi.com/quotes/random/',
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'quotes15.p.rapidapi.com'
        }
      };
      
      axios.request(options).then(function (response) {
          console.log(response.data);
   
        if(response.status !== 200) throw new Error();
        const date = new Date().toISOString()
        db.quotes.create({
            userId: req.user.id,
            quote: response.data.content,
            name: response.data.originator.name,
            createdAt: date,
            updatedAt: date
        })
        .then(quote =>{
            res.redirect('/quotes')
        })
        .catch(function (error) {
            console.error(error);
        });
      }).catch(function (error) {
          console.error(error);
      });
})
module.exports = router;


