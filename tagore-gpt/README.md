# TagoreGPT

TagoreGPT is a source-linked Rabindra Sangeet catalogue assistant. Ask about a song's taal, parjaay, raag, ritu, composition year, collection, and notation credit. Answers link back to Geetabitan.

## Public app

The app is published at <https://malhar02.github.io/tagore-gpt/> as an isolated path on the existing GitHub Pages site. It uses in-browser lookup over the generated song catalogue and does not send questions to an AI API.

## Catalogue pipeline

`scripts/build_catalogue.py` reads Geetabitan's robots.txt and sitemap, fetches song pages with a delay, and writes `songs.json` plus `tagore_songs.sqlite`. The repository workflow runs the first catalogue build when added, then refreshes monthly. Only titles, structured metadata, and source URLs are retained; lyric images, transliterations, translations, notation, and background prose are not copied into the web catalogue. Missing fields remain blank.

The app answers from metadata listed on each page. It does not claim to be Tagore or guess missing facts. The visitor's browser loads the JSON catalogue directly from this folder.

## Training notebook

`notebooks/tagore_gpt_colab.ipynb` adapts the supplied character-level GPT tutorial to a small text-continuation experiment. Use the structured catalogue for factual answers; a small character model cannot reliably recall exact taal, parjaay, raag, or ritu values.

## Sources

- <https://www.geetabitan.com/>
- <https://www.geetabitan.com/search/rabindra-sangeet-datatable.html>
- <https://www.geetabitan.com/robots.txt>
- <https://geetabitan.com/sitemap.xml>

