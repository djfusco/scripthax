# scripthax
with two scripts and a json file, automatically create a new HAX site with populated page content


```bash
# this allows you to then use hax command
./newAISite.sh siteName
# then run in a separate (new) tab
./newSitePopulate.sh siteNAme
```

## files assumed to be in the same directory of shell files
- `parsePages.js` - to be run using node within the script
- `newaicourse.json` - json file created from your favorite AI chat program