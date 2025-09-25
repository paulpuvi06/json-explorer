# JSON Parser

A simple JSON parser and viewer built with Next.js. Parse, analyze, and export JSON data with table views.

## Features

- Parse JSON from text input or file upload
- Sortable table view with filtering and grouping
- Export data in JSON or CSV format
- Field exclusion options before exporting
- Client-side processing (no server storage)
- Docker deployment ready

## Quick Start

### Docker (Local Build)
\`\`\`bash
docker compose up json-parser
# Access at http://localhost:3000
\`\`\`

### Docker (From GHCR)
\`\`\`bash
# Pull and run latest image
docker run -p 3000:3000 ghcr.io/paulpuvi06/json-parser:latest


# Access at http://localhost:3000
\`\`\`

### Local Development
\`\`\`bash
pnpm install
pnpm run dev
# Access at http://localhost:3000
\`\`\`

## How It Works

### Data Flow
1. **Input** - Paste JSON text or upload file
2. **Parse** - Validates and converts to table format
3. **Display** - Shows data in sortable/filterable/groupable table
4. **Export** - Download results in JSON or CSV format

### Export Options
- **Format** - Choose JSON or CSV
- **Field Exclusion** - Hide specific columns before exporting
- **Filtered Data** - Export only visible/filtered rows
- **Custom Selection** - Select which fields to include

### Data Storage
- **No server storage** - Everything runs in your browser
- **Temporary only** - Data disappears when you refresh/close tab
- **No tracking** - No cookies or data collection
- **Privacy first** - Your data never leaves your device

## License

MIT License - This project leveraged AI assistance to bring the idea to life for real-world use. See [LICENSE](LICENSE) for details.
