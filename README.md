# JSON Explorer

A JSON data analyzer and viewer. Parse, explore, filter, and analyze JSON data in your browser. No server storage, no tracking.

## Quick Start

### Try Online
**Live Demo**: [https://json-expo.vercel.app/](https://json-expo.vercel.app/) - Try it now without installation!

### Run with Docker

```bash
docker run -p 8080:8080 paulpuvi/json-explorer:latest
```

### Docker Compose

```yaml
services:
  json-explorer:
    image: paulpuvi/json-explorer:latest
    ports:
      - "8080:8080"
```

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
# Access at http://localhost:3000

# Build static files
pnpm run build
# Outputs to ./out/ directory

# Serve static files locally
npx serve out
# Access at http://localhost:3000
```


## License

MIT License - see [LICENSE](https://github.com/paulpuvi06/json-explorer/blob/main/LICENSE) for details