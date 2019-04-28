const express = require('express')
const { createLightship } = require('lightship')
const redis = require('redis')

const configuration = {"detectKubernetes":false, "port":"9000"}

const lightship = createLightship(configuration)

const app = express()
const port = process.env.PORT || 8080

const client = redis.createClient(process.env.REDIS_URL)

client.on('error', function (err) {
  console.log(`Redis error ${err}`)
})

app.get('/', (req, res) => {
  res.send('Hello world!')
  console.log('GET on /')
})

app.get('/kv/:key', (req, res) => {
  console.log(`GET /kv/${req.params.key}`)
  client.get(req.params.key, function (err, reply) {
    console.log(`  Response: ${reply.toString()}`)
	res.send(reply.toString())
  })
})

app.post('/kv/:key/:value', (req, res) => {
  console.log(`POST /kv/${req.params.key}/${req.params.value}`)
  client.set(req.params.key, req.params.value, redis.print);
  res.send('success');
})

app.get('/kill', (req, res) => {
  lightship.shutdown()
})

const server = app.listen(port, () => {
  lightship.signalReady()
  console.log(`Server started. Listening on ${port}`)
})

lightship.registerShutdownHandler(async () => {
  console.log(`Received shutdown signal`)
  server.close()
  console.log(`HTTP server shutdown`)
  client.quit()
  console.log(`REDIS connection closed`)
})
