# scripthax
with two scripts and a json file, automatically create a new HAX site with populated page content


```bash
# this allows you to then use hax command
./newAISite.sh siteName
# then run in a separate (new) tab
./newSitePopulate.sh siteName
```

## Files assumed to be in the same directory of shell files
- `parsePages.js` - this is run using node within the script newSitePopulate.sh
- `newaicourse.json` - json file created from your favorite AI chat program; sample included here

## Associated file to be used for chat prompt
- `Chat Prompt.docx` - sample AI prompt to be used with sample JSON