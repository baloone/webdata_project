// Copyright (C) 2022 Mohamed H
// 
// This file is part of Article Search Engine.
// 
// Article Search Engine is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// Article Search Engine is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Article Search Engine.  If not, see <http://www.gnu.org/licenses/>.

const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');
const alreadyReadArticles = () => fs.readdirSync("db/articles").map(e => "https://www.researchgate.net/publication/"+e.replace('.json', ''));
/*const articles = (
    fs.readFileSync("db/last_articles.txt").toString()+"\n"+
    fs.readFileSync("db/articles_left.txt").toString()
).split('\n').filter((v, i, arr) => arr.indexOf(v) === i && !alreadyReadArticles.includes(v) && v !== "");
*/
const url_to_id = url => url.split('/').slice(-1)[0]
const id_to_path = id => `db/articles/${id}.json`
const articles = (async function * () {
    const articles_left = fs.createReadStream("db/articles_left.txt");
    const rl = readline.createInterface({
        input: articles_left,
        crlfDelay: Infinity
    });
    let dirar = alreadyReadArticles();
    for await (const line of rl) {
        if (line.trim() === "" || dirar.includes(line)) continue;
        fs.writeFileSync(id_to_path(url_to_id(line)), "");
        //fs.writeFileSync("db/~cursor.txt", rl.getCursorPos().cursor+"");
        yield line;
        dirar = alreadyReadArticles();
    }
})();

const wait = function(t) {
    return new Promise((res) => setTimeout(res, t));
};

const main = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const step = async (actual) => {
    //const actual = await articles.__anext__();
    await page.goto(actual);
    await wait(2000);
    await page.evaluate(() => {
        const style = document.createElement('style');
        style.rel = "text/css";
        style.appendChild(document.createTextNode(`
            .qc-cmp-cleanslate {
                display: none !important;
            }
        `));
        document.head.appendChild(style);
    });
    await wait(1500);

    const referencesBtn = await page.$(".references");
    await referencesBtn.click();
    await wait (500);
    let loadmore;
    try {
    while (loadmore = await page.$('.publication-citations__load-more:not(.lite-page-hidden) button')) {
        await loadmore.click();
        await wait (1500);
    }
    } catch (e) {};

    const references = await page.evaluate(() => {
        return [...document.querySelectorAll('#references .nova-legacy-v-publication-item__title a')].map(e => e.href);
    });
    //articles.push(...references.filter(r => !articles.includes(r) && !alreadyReadArticles.includes(r)));
    const id = url_to_id(actual);
    const title = (await page.$(".research-detail-header-section__ie11 h1")).textContent;


    const abstract = await page.evaluate(() => (document.querySelector('.research-detail-middle-section__abstract')||{}).textContent);
    const meta = await page.evaluate(() => {
        return [...document.querySelectorAll('.research-detail-header-section__ie11 .research-detail-header-section__metadata div')].map(e=>e.textContent)
    });
    const authors = await page.evaluate (() => {
        return [...document.querySelectorAll('.js-authors-list .nova-legacy-v-person-list-item__title')].map(e=>e.textContent)
    });
    fs.writeFileSync(id_to_path(id), JSON.stringify({
        id, title, abstract, authors, meta, references: references.map(url_to_id)
    }));
    fs.appendFileSync(`db/articles_left.txt`, references.join('\n')+'\n');
    console.log ("articles read:", alreadyReadArticles().length, "| articles_left.txt:", fs.statSync("db/articles_left.txt").size, '|', new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));
    //if (articles.length) await loop ();
  }
  for await (var article of articles) {
      try {
        await step(article);
      } catch (e) {
        fs.unlinkSync(id_to_path(url_to_id(article)));
      }
  }
  await browser.close();

};

main ();
