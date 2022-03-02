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

