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

const fs = require('fs');
const YAML = require('yaml')
const papers = fs.readdirSync('../crawler/1st_crawl/articles').map(f => fs.readFileSync(`../crawler/1st_crawl/articles/${f}`, {encoding:'utf-8'})).map(JSON.parse);
const new_ids = {};
const fresh_id = (()=>{
    var i = 0;
    return () => i++
})();
const db = {
    papers: [],
    keywords: {},
    authors: {},
};
papers.forEach(article => {
    const id = fresh_id();
    new_ids[article.id] = id
});
papers.forEach(async art => {
    const id = new_ids[art.id];

    const article = {...art,
        new_id:id,
        references:art.references.map(r => new_ids[r]).filter(r => r!==undefined),
        meta: art.meta.join('\n').replace(/((?:20|19)[0-9][0-9])(\w)/, "$1\n$2").split('\n')
    };
    db.papers[id] = article;
    if (article.abstract)
        [...article.abstract.matchAll(/\w+/g)].map(e=>e[0])
        .forEach(k => {
            k = "#"+k.toLowerCase();
            if (db.keywords[k]) {
                if (!db.keywords[k].includes(id))
                    db.keywords[k].push(id);
            } else db.keywords[k]  = [id];
        });
    article.authors.forEach(author => {
        author = "#"+author.toLowerCase();
        if (db.authors[author]) {
            if (!db.authors[author].includes(id))
                db.authors[author].push(id);
        } else db.authors[author] = [id];
    })
})
Object.keys(db.keywords).forEach(k => {
    if (db.keywords[k].length > 5000) delete db.keywords[k];
});

fs.writeFileSync('db.yml', YAML.stringify(db));

fs.writeFileSync('db.json', JSON.stringify(db));

