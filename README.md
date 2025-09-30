# JSON Parser

A JSON data analyzer and viewer. Parse, filter, and analyze JSON data in your browser. No server storage, no tracking.

## Quick Start

### Try Online
**Live Demo**: [https://json-parser.vercel.app/](https://json-parser.vercel.app/) - Try it now without installation!

### Run with Docker

```bash
docker run -p 8080:8080 paulpuvi/json-parser:latest
```

### Docker Compose

```yaml
services:
  json-parser:
    image: paulpuvi/json-parser:latest
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

## More Info

- **Source Code**: [GitHub Repository](https://github.com/paulpuvi06/json-parser)
- **Issues**: [Report bugs or request features](https://github.com/paulpuvi06/json-parser/issues)
- **Documentation**: [Full documentation](https://github.com/paulpuvi06/json-parser#readme)

## License

MIT License - see [LICENSE](https://github.com/paulpuvi06/json-parser/blob/main/LICENSE) for details
