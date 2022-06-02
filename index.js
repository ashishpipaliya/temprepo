const puppeteer = require('puppeteer-extra')
const { processLineByLine, returnNewPage } = require('./utils/utils');
var port = process.env.PORT || 8083;
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({blockTrackers: true}))
const cron = require("node-cron")
const express = require('express')

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const parallelTabs = 3;

const config = {
	launchOptions: {
		headless: false,
		args: ['--no-sandbox']
	},
	viewport: { width: 1920, height: 1080 }
}

runProcess = async () => {
	
	puppeteer.launch(config.launchOptions).then(async browser => {
		const sites = await processLineByLine('products.txt');
		console.log(sites);
		const promises = [], total = sites.length;
		var logs = [];
		let count = 0, dcount = 0;
		while (count < total) {
			let limit = (total - count < parallelTabs) ? (total - count) : parallelTabs;
			for (let i = 0; i < limit; i++) {
				console.log('Page ID Spawned', i);

				promises.push(returnNewPage({ browser, config }, count++)
					.then(async data => {
						const { page, tag: number } = data;
						const { url } = sites[number];

						await page.goto(url);
						console.log('Go to ' + url)
						await page.waitForSelector('video');
						try {
							const title = await page.title()
							const duration = await page.$eval('video', (el) => el.duration)
							const playButton = await page.$('.ytp-play-button')
							console.log(title)
							await playButton.click()
							console.log('Play the video...')
							await wait(duration * 1.5 * 1000)
							console.log('Done! ')
						} catch (e) {
							console.log(e);
						}
						await page.close();
					})
					.catch(err => console.log('Error 100', err)))
			}
			console.log('WAITING FOR', limit, 'PROCESSES TO END');
			await Promise.all(promises)
		}
		console.log('---Closing Browser---');
		await browser.close();

	});

}

const wait = (time) => new Promise((resolve) => {
	return setTimeout(resolve, time)
})

app.get('/', (req, res) => {
	res.send('Home')
})

app.get('/all', (req, res) => {
	res.send('Running');
	runProcess();
})

cron.schedule("0 2 * * * *", async() => {
	console.log(`Running Cron Job for runProcess`);
	await runProcess()
});

app.listen(port, () => console.log(`Server started at http://localhost:${port}`))



