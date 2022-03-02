const puppeteer = require('puppeteer');
const fs = require('fs');
const articles = [];

const wait = function(t) {
    return new Promise((res) => setTimeout(res, t));
}

const main = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let i = 0;
  await page.goto('https://www.researchgate.net/topic/Computer-Science/publications/1?ft=all&rt[0]=ta');

  const loop = async () => {
    await wait (20000);
    articles.push(...await page.evaluate(() => {
        return [...document.querySelectorAll(".nova-legacy-v-publication-item__title a")].map(e=>e.href);
    }));
    console.log ("page:", ++i, "| number of articles:", articles.length, new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));
    const next = await page.$("[rel=next]");
    if (next) {
        next.click();
        return await loop ()
    } else return;
  }
  await loop ();
  await browser.close();
  fs.writeFile("db/last_articles.txt", articles.join('\n'), "utf8", function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
  });
};

main ();
