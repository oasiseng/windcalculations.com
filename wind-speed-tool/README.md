# WindCalculations Nationwide Wind Speed Tool

This package contains the production-ready nationwide ASCE 7-22 wind speed lookup tool built for WindCalculations.com. It delivers fast public wind speed screening with live ASCE GIS lookups, contour-based fallback logic, Special Wind Region detection, hurricane-prone region checks, Colorado Front Range overlay handling, and branded printable results.

The tool is already embedded on WindCalculations.com and live here:

[https://windcalculations.com/wind-speed-tool](https://windcalculations.com/wind-speed-tool)

If you want to see the finished experience before deploying or editing anything, start there.

## What’s in this package

- `public/nationwide-wind-tool.html`
  The final self-contained deployable file. This is the one to publish if you just want the working tool.

- `source/build_nationwide_assets.js`
  The build script that downloads public ASCE GIS data, processes it, and regenerates the nationwide tool.

- `source/nationwide_template.html`
  The source template for the generated HTML output.

## Why this tool matters

- Nationwide ASCE 7-22 mapped wind speed lookup in a single lightweight HTML file
- Live public ASCE GIS raster lookups with local contour fallback when the service is unavailable
- Special Wind Region, hurricane-prone region, and wind-borne debris checks
- Colorado Front Range overlay logic for locations where the local overlay governs
- Branded, mobile-friendly, client-facing presentation suitable for lead generation and preliminary screening
- Printable browser output for saving a branded PDF

## Recommended repo placement

- Put `public/nationwide-wind-tool.html` wherever your website serves static tool pages.
- Keep `source/` in the repo if you want the source template and build process versioned alongside the deployed file.

## Not included

- Raw downloaded GeoJSON files
- Processed JSON cache
- Colorado reference PDFs/KMZ
- Any live Google API key

## Google autocomplete

Optional Google autocomplete is already wired into the HTML. Use a browser key restricted to your domain and inject it at runtime like this:

```html
<script>
window.WIND_TOOL_CONFIG = {
  googleMapsApiKey: "YOUR_BROWSER_RESTRICTED_KEY"
};
</script>
```

Do not commit live API keys into git. Browser keys should be domain-restricted and API-restricted in Google Cloud.

## Deployment note

The generated HTML is fully self-contained and does not require external JSON files. In most cases, deployment is as simple as publishing `public/nationwide-wind-tool.html` to the desired site path.
