const express = require('express')

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello W')
})

var port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server started at http://localhost:${port}`))

module.exports = app
