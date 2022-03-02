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

const express = require('express');
const app = express();
const db = JSON.parse(require('fs').readFileSync('db.json', {encoding:'utf-8'}));
const set_leq = (a, b) => a.filter(i=>!b.includes(i)).length === 0;
const set_eq = (a, b) => set_leq(a,b) && set_leq(b,a);
const union = (a, b) => [...a, ...b].filter((v,i,arr) => arr.indexOf(v) === i);
const inter = (a, b) => a.filter(x => b.includes(x));
const get_papers = (query, dol_val=[]) => {
    const rec_call = q => get_papers(q, dol_val);
    if (query.type === "keyword")
        return db.keywords[`#${query.value.toLowerCase()}`]||[];
    if (query.type === "dol")
        return dol_val;
    if (query.type === "fun") {
        if (query.name === "ROR") {
            var pres = [];
            var res = get_papers(query.args[0]);
            while (!set_eq(res, pres) && res.length < 1000) {
                pres = res;
                res  = union(pres, query.args.map(q => get_papers(q, pres)).reduce(union, []));
            }
            return res;

        }
        if (query.name === "OR") {
            return query.args.map(rec_call).reduce(union, []);
        }
        if (query.name === "AND") {
            return query.args.map(rec_call).reduce(inter);
        }
        if (query.name === "CITED_BY") {
            return query.args.map(rec_call).reduce(union, [])
                .map(i => db.papers.filter(p => p.references.includes(i)).map(e=>e.new_id)).reduce(union, [])
        }
        if (query.name === "CITING") {
            return query.args.map(rec_call).reduce(union, [])
                .map(i => db.papers[i].references).reduce(union, [])
        }
        if (query.name === "WRITTEN_BY_SAME_AUTHORS") {
            return query.args.map(rec_call).reduce(union, [])
                .map(i => db.papers[i].authors.map(a => db.authors[`#${a.toLowerCase()}`]).reduce(inter)).reduce(union, []);
        }
        if (query.name === "WRITTEN_BY_ONE_SAME_AUTHOR") {
            return query.args.map(rec_call).reduce(union, [])
                .map(i => db.papers[i].authors.map(a => db.authors[`#${a.toLowerCase()}`]).reduce(union, [])).reduce(union, []);
        }
        if (query.name === "BY_IDS") {
            return query.args.map(a => a.value-0).filter(k => db.papers[k]).filter((v, i, arr) => arr.indexOf(v) === i);
        }
    }
    return [];
};

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

app.get('/', function(req, res) {
    res.render('search');
});

app.post('/', function(req, res) {
    res.json(get_papers(req.body.query).map(k => db.papers[k]));
});


app.listen(8080, () => {
    console.log(`Listening on port 8080`)
})


