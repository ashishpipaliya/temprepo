const express = require('express')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin())

const app = express()

const URL = 'https://www.youtube.com/channel/UCE1EHUps_Nzmpufq3ryEszA/videos'
const LIMIT_VIDEO_TO_WATCH = 15

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello W')
})

app.get('/all', (req, res) => {
  res.send('Hello W');
  runProcess();
})

app.get('/video/:url', (req, res) => {
  res.send(req.params.url)
  videoByUrl(req.params.url);
})

const runProcess = async () => {

  const browser = await puppeteer.launch({
    headless: true,executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox']
  })
  const page = await browser.newPage()
  await page.setRequestInterception(true);

  await page.goto(URL, { waitUntil: 'load', timeout: 0 })
  let links = await getAllUrl(page, '#video-title')
  links = links.slice(0, LIMIT_VIDEO_TO_WATCH)

  for (let link of links) {
    await page.goto(link, { waitUntil: 'load', timeout: 0 })
    console.log('Go to ' + link)
    await page.waitForSelector('video');
    await watchTheVideo(page)
  }
  await browser.close()
}


const videoByUrl = async (link) => {

  const browser = await puppeteer.launch({
    headless: true,executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox']
  })
  const page = await browser.newPage()
  await page.setRequestInterception(true);
  await page.goto(link, { waitUntil: 'load', timeout: 0 })
  console.log('Go to ' + link)
  await page.waitForSelector('video');
  await watchTheVideo(page)
  await browser.close()
}

const getAllUrl = async (page, selector) => {
  return page.$$eval(selector, anchors => [].map.call(anchors, a => a.href))
}

const watchTheVideo = async (page) => {
  try {
    const title = await page.title()
    const duration = await page.$eval('video', (el) => el.duration)
    const playButton = await page.$('.ytp-play-button')

    console.log(title)

    await playButton.click()
    console.log('Play the video...')
    await wait(duration * 2 * 1000)
    console.log('Done! ')
  } catch (e) {
    console.log(e);
  }
}

const wait = (time) => new Promise((resolve) => {
  return setTimeout(resolve, time)
})


var port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server started at http://localhost:${port}`))

module.exports = app
