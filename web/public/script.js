const hash = (() => {
    const o = window.location.hash.slice(1).split("&").map(e => e.split('='))
        .reduce((acc, [a,b]) => {acc[decodeURIComponent(a)]=decodeURIComponent(b); return acc}, {});
    return {
        get: (prop) => o[prop],
        set: (prop, value) => {
            o[prop] = value;
            window.location.hash = '#'+Object.keys(o).filter(k => o[k]).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(o[k])}`).join('&');
        }
    };
})();

const debounce = (f, t) => {
    var id = null;
    return function () {
        if (id) clearTimeout(id);
        id = setTimeout(()=>f(...arguments), t);
    }
};
const throttle = (f, t) => {
    var id = null;
    var time = Date.now();
    return function () {
        const nt = Date.now();
        if (nt - time >= t) {
            time = nt;
            f(...arguments);
        } else {
            if (id) clearTimeout(id);
            id = setTimeout(() => {
                time = Date.now();
                id = null;
                f(...arguments)
            }, t-(nt-time));
        }
    }
};

const parse = (query, dol_authorized=false) => {
    const q = query.split(/\r|\n/).join(' ');
    const reg = /^\s*(?:(\$)|(\w+)|(?:(|\w+)\s*\((.*)\)))\s*$/;
    const match = q.match(reg);
    const known_func = ["ROR", "OR", "AND", "CITED_BY", "CITING", "WRITTEN_BY_SAME_AUTHORS", "WRITTEN_BY_ONE_SAME_AUTHOR", "BY_IDS"];
    if (match) {
        const [q, dol, key, fun, args] = match;
        if (dol && dol_authorized) {
            return {type: "dol"}
        }
        if (key) {
            return {type: "keyword", value:key}
        }
        if (fun && known_func.includes(fun.toUpperCase())) {
            var args_list = [];
            var lv = 0;
            var p = 0;
            var i = 0;
            for(var c of args) {
                if (c === "(") p++;
                if (c === ")") p--;
                if (p === 0 && c === ",") {
                    args_list.push(args.slice(lv, i));
                    lv = i+1;
                };
                i++;
            }
            args_list.push(args.slice(lv, i));
            if (fun.toUpperCase() == "ROR") {
                if (!dol_authorized) {
                    return {type: "fun", name:"ROR", args:args_list.map((t, i) => parse(t, i>0))}
                }
            } else return {type: "fun", name:fun.toUpperCase(), args:args_list.map(t => parse(t, dol_authorized))}
        }
    }
    throw new Error("Could not parse query!");
}
const add_article = art => {
    const date = art.meta.filter(meta => meta.match(/(?:20|19)[0-9][0-9]/))[0];
    const html =
    `<details>
        <summary>
            <h3>${art.id.split('_').slice(1).join(' ')}</h3>
            <div style="display: flex; flex-direction: row; gap: 1em">
                ${date?`<div class="date">${date}</div>`:""}
                <div class="authors">${art.authors.join(', ')}</div>
            </div>
        </summary>
        <p>${art.abstract}</p> <br>
        <span>article id: ${art.new_id}</span> <br>
        <a href="https://www.researchgate.net/publication/${art.id}">read more...</a>
    </details>`;
    const div = document.createElement('div');
    div.classList.add('article');
    section.appendChild(div);
    div.innerHTML = html;

};

const [load_articles, load_response] = (function(){
    var response = [];
    var loaded_res = 0;
    return [
        () => {
            const slice = response.slice(loaded_res, loaded_res+50);
            slice.forEach(add_article);
            loaded_res += slice.length;
            if (loaded_res < response.length) {
                const div = document.createElement('div');
                div.classList.add('load-more', 'article');
                div.innerText = "v";
                div.addEventListener('click', () => {
                    div.outerHTML = '';
                    load_articles ();
                })
                section.appendChild(div);
            }
        },
        res => {
            response = res;
            loaded_res = 0;
        }
    ]
})();

const sendRequest = async () => {
    try {
        const query = parse(searchbox.innerText);
        hash.set('q', searchbox.innerText);
        searchbox.classList.remove('error');
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        const response = await (await fetch('/', {method:'POST', body:JSON.stringify({query}), headers})).json();
        load_response(response);
        section.innerHTML = `
        <div class="article">Number of articles found: ${response.length}</div>
        `;
        load_articles();
    } catch (e) {
        searchbox.classList.toggle('error', searchbox.innerText.split(/[\s\n\r]/).join('') !== "");
    }

};
const debSendRequest = debounce(sendRequest, 500);
const throtSendRequest = throttle(sendRequest, 500);
const update_state = () => {
    const empty = searchbox.innerText === '' || searchbox.innerHTML === '<br>';
    searchbox.classList.toggle('empty', empty);
    headerDiv.classList.toggle('searching', !empty);
    section.classList.toggle('hidden', empty);
};
searchbox.addEventListener('input', () => {
    update_state ();
    debSendRequest();
});

searchBtn.addEventListener('click', () => throtSendRequest())

if (hash.get('q')) {
    searchbox.innerText = hash.get('q');
    update_state ();
    throtSendRequest();
}
