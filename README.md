# JSON Configuration Parser

*A standalone static site for parsing and analyzing JSON configuration data*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/devops-dynamos/json-parser)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

## Overview

A powerful JSON configuration parser that runs entirely in your browser. Parse, analyze, filter, and export JSON data with advanced table views and sorting capabilities.

## Features

- **Client-side Processing**: All data stays in your browser - no server storage
- **Advanced Table Views**: Sort, filter, and rearrange columns
- **Export Options**: Export filtered data with field exclusion
- **URL Detection**: Automatically converts URLs to clickable links
- **File Upload**: Support for JSON file uploads
- **Static Deployment**: Can be deployed as a standalone static site

## How It Works

### Data Input Methods

**Text Input:**
1. Paste JSON data directly into the text area
2. Real-time validation as you type
3. Automatic parsing and error detection
4. Format/minify options available

**File Upload:**
1. Drag and drop JSON or text files
2. Supports `.json` and `.txt` file formats
3. Uses browser's FileReader API to read file contents
4. Automatically processes file content upon upload

### Data Processing Workflow

1. **Input Processing**: Data is received via text input or file upload
2. **JSON Validation**: Real-time parsing using `JSON.parse()` with error handling
3. **Data Analysis**: Parsed JSON is analyzed to extract keys, values, and data types
4. **Table Generation**: Data is converted into a sortable, filterable table view
5. **Value Enhancement**: 
   - URLs are automatically detected and converted to clickable links
   - Different data types are color-coded (strings, numbers, booleans, objects, arrays)
6. **Export Processing**: Filtered data can be exported with field exclusion options

### Browser Storage

- **No Server Communication**: All processing happens in your browser's JavaScript engine
- **Temporary Memory**: Data exists only in browser memory during the session
- **No Persistence**: Data is cleared when you refresh or close the browser tab
- **No Cookies**: No tracking or persistent storage mechanisms used

This ensures complete privacy and security for sensitive configuration data.

## Deployment

This project can be deployed as a static site to any hosting platform:

- **Vercel**: Automatic static optimization
- **Netlify**: Static site hosting
- **GitHub Pages**: Static deployment
- **Any CDN**: Fully static build output

## Privacy

- No data is sent to external servers
- All processing happens locally in your browser
- No cookies or tracking
- No user data collection

## Build

\`\`\`bash
npm run build
\`\`\`

The build output is fully static and can be served from any web server or CDN.
