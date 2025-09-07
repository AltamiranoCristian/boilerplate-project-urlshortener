require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });//conexion con mongoDB

//creacion del schema
const URLSchema = mongoose.Schema({
  original: { type: String, required: true},
  short: Number
});

//asignacion del schema al modelo
let Url = mongoose.model('url', URLSchema)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

function isValidUrl(str) {
  const pattern = new RegExp(
    '^([a-zA-Z]+:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i'
  );
  return pattern.test(str);
}

app.post('/api/shorturl', function(req, res) {
  let url2Cut = req.body.url;
  if (isValidUrl(url2Cut)) {
    let url2Save = new Url({
      original: url2Cut,
      short: Math.floor(Math.random() * 10000)
    })
    url2Save.save()
    res.json({"original url": url2Cut, "short url": url2Save.short})
  }
  else
  res.json({"error":  "Invalid url"})
});

app.get('/api/shorturl/:shorturl', async function(req, res) {
  let { shorturl } = req.params;
  try {
    const result = await Url.findOne({'short': shorturl})
    if (!result)
      res.json({"error":  "not found"})
    res.redirect(result.original)
  } catch (error) {
    console.error(error)
    res.json({"error":  "not found"})
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
