WindCalculations Nationwide Wind Speed Tool

Package contents

- `public/nationwide-wind-tool.html`
  Final self-contained file for deployment.

- `source/build_nationwide_assets.js`
  Build script that downloads ASCE public GIS data and regenerates the tool.

- `source/nationwide_template.html`
  Source template for the generated HTML.

Recommended repo placement

- Put `public/nationwide-wind-tool.html` wherever your site serves static tools/pages.
- Keep `source/` in the repo if you want the build source versioned with the deployed output.

Not included in this package

- Raw downloaded GeoJSON files
- Processed JSON cache
- Colorado reference PDFs/KMZ
- Any Google API key

Notes

- The generated HTML is self-contained and does not need external JSON files.
- Optional Google autocomplete is already wired via runtime config in the HTML:

```html
<script>
window.WIND_TOOL_CONFIG = {
  googleMapsApiKey: "YOUR_BROWSER_RESTRICTED_KEY"
};
</script>
```

- Do not commit live API keys into git.
