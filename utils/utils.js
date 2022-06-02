const fs = require('fs');
const readline = require('readline');

const processLineByLine = async (filee) => {
    const fileStream = fs.createReadStream(filee);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let sites = [];

    for await (const line of rl) {
        const prod = line.split(" ");
        sites.push({
            url: prod[0],
            targetPrice: Number(prod[1])
        });
    }
    return sites;
}

const returnNewPage = async ({ browser, config }, tag) => {
    return new Promise(async (resolve, reject) => {
        const page = await browser.newPage();
        await page.setRequestInterception(true);

        const rejectRequestPattern = [
            "googlesyndication.com",
            "/*.doubleclick.net",
            "/*.amazon-adsystem.com",
            "/*.adnxs.com",
            "r2---sn-5hne6n7z.googlevideo.com",
            "r2---sn-25ge7nsd.googlevideo.com",
            "r4---sn-25ge7nsk.googlevideo.com",
            "r6---sn-25ge7nsl.googlevideo.com",
            "r1---sn-25glen7y.googlevideo.com",
            "r1---sn-25glenez.googlevideo.com",
            "r10---sn-4gxx-25gel.googlevideo.com",
            "r11---sn-4gxx-25ge7.googlevideo.com",
            "r4---sn-4gxx-25gee.googlevideo.com",
            "r16---sn-4gxx-25ge7.googlevideo.com",
            "r3---sn-4gxx-25gel.googlevideo.com",
            "r1---sn-4gxx-25gel.googlevideo.com",
            "r9---sn-4gxx-25gel.googlevideo.com",
            "r9---sn-4gxx-25gy.googlevideo.com",
            "r6---sn-4g5e6nes.googlevideo.com"
        ];
        const blockList = [];

        page.on("request", (request) => {
            if (rejectRequestPattern.find((pattern) => request.url().match(pattern))) {
              blockList.push(request.url());
              request.abort();
            } else request.continue();
          });
          
        await page.setDefaultNavigationTimeout(0);
        await page.setViewport(config.viewport);
        await page.setUserAgent("notifyme-myntra");
        return resolve({ page, tag });
    })
}

module.exports = {
    processLineByLine,
    returnNewPage
}