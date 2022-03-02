#!/bin/bash
# Copyright (C) 2022 Mohamed H
# 
# This file is part of Article Search Engine.
# 
# Article Search Engine is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# Article Search Engine is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with Article Search Engine.  If not, see <http://www.gnu.org/licenses/>.

crawl="node crawl_articles_data.js"
$crawl >> log.txt 2> /dev/null


while [ $? -ne 0 ]; do
	echo "error. last log:"
	tail -1 log.txt
	echo "sleep for 30 secondes..."
	sleep 30
	$crawl >> log.txt 2> /dev/null
done
