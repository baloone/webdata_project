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

- The "1st_crawl" directory contains the results of the crawler's first attempt which lasted 3 days before I stopped it.
- The script "crawl_last_articles" browses the last uploaded articles on rƏsearchgate and stores their links.
- The script "crawl_articles_data" gets the informations of thoses articles and adds the cited articles to the previous list.

You should install `node` and `npm` then install the dependencies with `npm i` before being able to run the crawlers.
