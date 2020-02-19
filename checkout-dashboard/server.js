const express = require('express')
const app = express()
const path = require('path');
const http = require('http').Server(app)
const io = require('socket.io')(http)

const statsHelper = require('./statsHelper');

const port = 3000

const Redis = require('ioredis')
let client = new Redis("6379", "localhost");
let subscriber = new Redis("6379", "localhost");

app.use('/', express.static(path.join(__dirname, 'dist')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.get('/stats', async (req, res, next) => {
    const stats = await statsHelper.fetchStats(client);
    res.json(stats);
});

const emitStats = async () => {
    try {
        let data = await statsHelper.fetchStats(client);
        io.emit('stats', data)
    } catch (e) {
        console.error(e)
    }
}

subscriber.on('message', async (channel, message) => {
    console.log(`message received for channel ${channel}`);
    emitStats();
})
subscriber.subscribe('checkout:')

io.on('connection', (socket) => {
    emitStats();
});

http.listen(port, "127.0.0.1")

//() => console.log(`app listening on port ${port}`)
