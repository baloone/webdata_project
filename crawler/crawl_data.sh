#!/bin/bash
crawl="node crawl_articles_data.js"
$crawl >> log.txt 2> /dev/null


while [ $? -ne 0 ]; do
	echo "error. last log:"
	tail -1 log.txt
	echo "sleep for 30 secondes..."
	sleep 30
	$crawl >> log.txt 2> /dev/null
done
