# Review-video recorder

`record.mjs` drives a clean n8n instance through the Creator Portal's review script in one
continuous Playwright take and records the browser: sign-in, install `n8n-nodes-dns-doctor`
from npm, a manual-trigger workflow running Domain · Scan, the credential created in the node
(n8n tests it on save), Monitoring · Get Readiness and Tool · Check Propagation, then a second
workflow where an AI Agent uses the node as a tool from chat. About two minutes, no cuts.

Run against a throwaway n8n (Docker on a lab box, port-forwarded to `localhost:5678`).
`setup.mjs` creates the owner account and dismisses the first-run modals off camera; add the
OpenAI credential through the REST API before the take. Then:

```bash
npm i playwright && npx playwright install chromium
N8N_PW=… DNSD_TOKEN=… node record.mjs            # writes videos/*.webm
DRY=1 N8N_PW=… node record.mjs                   # screenshots only, into shots/
DRY=1 SKIP_TO_AGENT=1 N8N_PW=… node record.mjs   # iterate on the agent step alone
# trim only the blank lead-in before Chromium's first paint (measure it: frames whose luma
# spread is ~0), never anything inside the flow
ffmpeg -ss <lead-in> -i videos/<take>.webm -c:v libx264 -crf 22 -pix_fmt yuv420p -movflags +faststart demo.mp4
```

Keep every domain on screen to one you are happy to publish: the monitoring step uses
Get Readiness for a single domain on purpose, because the alert log is account-wide.
The token goes into a masked field; delete the instance afterwards, it holds both credentials.

Two things learned on 2026-09-09: every `page.goto` reloads the whole app and paints white for a
second or two (reads as a cut), so the script navigates in-app after sign-in; and n8n's Table
view clips wide results, so the propagation and readiness outputs are switched to the Schema view.
