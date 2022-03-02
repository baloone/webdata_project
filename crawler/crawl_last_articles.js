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
