# JSON Parser

A powerful JSON data analyzer and viewer built with Next.js. Parse, filter, group, and export JSON data with advanced table and tree views.

## Features

- **Multiple Input Methods**: Parse JSON from text input or file upload (.json files)
- **Smart Data Views**: Automatic switching between table view (for flat data) and tree view (for complex nested structures)
- **Advanced Filtering**: Multiple filters with AND/OR logic, search and dropdown options
- **Data Grouping**: Group data by any field with expandable/collapsible sections
- **Column Management**: Drag-and-drop column reordering, expandable columns for better visibility
- **Export Options**: Download data in JSON, CSV, or TSV format with field exclusion
- **Data Analysis**: Built-in statistics, sorting, and data type visualization
- **Privacy Focus**: 100% client-side processing (no server storage, no tracking)
- **Docker Ready**: Production-ready container deployment
- **Keyboard Shortcuts**: Ctrl+Enter to parse, Ctrl+Z/Y for undo/redo
- **Sample Data**: Built-in sample dataset to get started quickly

## Project Version

**v0.1.0** – Initial release with full JSON parsing and analysis capabilities

## Quick Start

### Docker (Local Build)

```bash
docker compose up json-parser
# Access at http://localhost:3000
```

### Docker (From GHCR)

```bash
# Pull and run latest image
docker run -p 3000:3000 ghcr.io/paulpuvi06/json-parser:latest
# Access at http://localhost:3000
```

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
# Access at http://localhost:3000

# Build for production
pnpm run build
pnpm run start
```

## How It Works

1. **Input** – Paste JSON text, upload .json file, or try sample data
2. **Parse & Validate** – Real-time JSON validation with error highlighting
3. **Smart View Selection** – Automatically chooses table view for flat data or tree view for nested structures
4. **Analyze** – Apply filters, group by fields, sort columns, and customize the view
5. **Export** – Download results in your preferred format (JSON/CSV/TSV) with optional field exclusion

**Privacy First:** Everything runs in your browser – no server storage, no tracking, data disappears when you close the tab.

## View Modes

- **Table View:** Optimized for flat JSON arrays and objects. Features advanced filtering, grouping, sorting, and column management.
- **Tree View:** Perfect for complex nested JSON structures with expandable nodes and visual hierarchy.

## Keyboard Shortcuts

- `Ctrl+Enter`: Parse JSON data
- `Ctrl+Z`: Undo last action
- `Ctrl+Y`: Redo last action

## Docker Deployment

The application includes optimized Docker configuration with:

- Multi-stage build for reduced image size
- Production-ready Next.js configuration
- Environment variable support
- Automatic health checks

## License

MIT License – This project leveraged AI assistance to bring the idea to life for real-world use. See [LICENSE](LICENSE) for details.
