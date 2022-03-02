<!--
 Copyright (C) 2022 Mohamed H
 
 This file is part of Article Search Engine.
 
 Article Search Engine is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 Article Search Engine is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Article Search Engine.  If not, see <http://www.gnu.org/licenses/>.
-->

# The Webserver
## How to run the serve
To run the server you need to have `npm` and `node` installed.
Run `npm i` to install dependencies then `npm run serve` to launch the server.

## How to use the website

The website will be available on http://localhost:8080/
The grammar for the requests is as follows:
```ocaml
keyword = \w+
request =
    | keyword    (*which returns all the articles containing this keyword in abstact *)
    | ROR (request, request* ..., request* ) (* Recursive or: the first request is the base case. "request*" represents the requests that does not contain a call to ROR and that may contain a "$" as keyword. That dollar symbol references at the result of this function *)
    | OR (request, ..., request) (* Classical or: it give the union of the requests *)
    | AND (request, ..., request) (* and: it give the intersection of the requests *)
    | CITED_BY (request, ..., request) (* give the papers that cites one of the papers *)
    | CITING (request, ..., request) (* give the papers cited *)
    | WRITTEN_BY_SAME_AUTHORS (request, ..., request) (* gives the papers written by at least all the authors of one paper *)
    | WRITTEN_BY_ONE_SAME_AUTHOR (request, ..., request) (* gives the papers written by one of the authors of one paper *)
    | BY_IDS (keyword, ..., keyword) (* returns the selected papers *)
```
where request* are requests without "ROR" but allowing "$"

## Example

try to search `ror(by_ids(1060), cited_by($), citing($))`

## Additionnal explanation

The script "build_db" build the files db.json and db.yml. Those two files represents the same data: the data in the directory `../crawler/1st_crawl`.
"db.yml" is not necessary but it allows us, humans, to read the database more comfortably.

