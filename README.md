# JSON Explorer

A JSON data analyzer and viewer. Parse, explore, filter, and analyze JSON data in your browser. No server storage, no tracking.

## Quick Start

### Try Online
[![Live](https://img.shields.io/badge/Live-Vercel-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](https://json-expo.vercel.app/)


### Run with Docker


```bash
docker run -d -p 8080:8080 paulpuvi/json-explorer:latest
```

[![Docker Pulls](https://img.shields.io/docker/pulls/paulpuvi/json-explorer?style=for-the-badge)](https://hub.docker.com/r/paulpuvi/json-explorer)

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

## ⭐ Support

If you find JSON Explorer useful, please consider:

- ⭐ **Starring** the repository
- 🐳 **Using** the Docker image

---


## License

MIT License - see [LICENSE](https://github.com/paulpuvi06/json-explorer/blob/main/LICENSE) for details