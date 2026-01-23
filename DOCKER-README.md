# Docker Deployment Guide for MSG Viewer

This guide explains how to build and run the MSG Viewer application using Docker.

## Prerequisites

- Docker Desktop installed and running on your system
- For Windows: Docker Desktop for Windows
- For Mac: Docker Desktop for Mac
- For Linux: Docker Engine

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Start Docker Desktop** (if not already running)

2. **Build and run the container:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   Open your browser and navigate to: `http://localhost:8080`

4. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Option 2: Using Docker Commands

1. **Start Docker Desktop** (if not already running)

2. **Build the Docker image:**
   ```bash
   docker build -t msg-viewer:local .
   ```

3. **Run the container:**
   ```bash
   docker run --rm -p 8080:80 --name msg-viewer msg-viewer:local
   ```

4. **Access the application:**
   Open your browser and navigate to: `http://localhost:8080`

5. **Stop the container:**
   ```bash
   docker stop msg-viewer
   ```

## Docker Image Details

### Multi-Stage Build

The Dockerfile uses a multi-stage build process:

1. **Stage 1 (Builder):** Uses Bun to build the static site
   - Base image: `oven/bun:1`
   - Installs dependencies
   - Runs the build script to generate static HTML/CSS/JS

2. **Stage 2 (Runtime):** Uses Nginx to serve the static files
   - Base image: `nginx:alpine`
   - Copies built files from the builder stage
   - Serves the application on port 80

### Image Size

The final image is approximately 20-30 MB due to the use of Alpine Linux.

## Configuration

### Nginx Configuration

The `nginx.conf` file includes:
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Content Security Policy allowing Google Analytics
- Gzip compression for better performance
- Cache control (no-cache for index.html, 1-year cache for static assets)
- Health check endpoint

### Port Mapping

By default, the container exposes port 80 internally, which is mapped to port 8080 on your host machine. You can change this in `docker-compose.yml`:

```yaml
ports:
  - "YOUR_PORT:80"  # Change YOUR_PORT to your preferred port
```

## Validation

After starting the container, verify the following:

1. **Container is running:**
   ```bash
   docker ps
   ```

2. **Check container logs:**
   ```bash
   docker logs msg-viewer
   ```

3. **Health check:**
   ```bash
   docker inspect msg-viewer | grep -A 5 Health
   ```

4. **Test the application:**
   - Open `http://localhost:8080` in your browser
   - Select or drag-and-drop a `.msg` file
   - Verify the file content is displayed correctly
   - Check browser console for any errors (F12 -> Console)
   - Verify no 404 errors for favicon or other resources (F12 -> Network)

## Troubleshooting

### Docker Desktop Not Running

**Error:** `error during connect: ... dockerDesktopLinuxEngine: The system cannot find the file specified`

**Solution:** Start Docker Desktop and wait for it to fully initialize before running Docker commands.

### Port Already in Use

**Error:** `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution:** Either:
- Stop the service using port 8080
- Change the port mapping in `docker-compose.yml` or use a different port: `docker run -p 8081:80 ...`

### Build Fails

**Error:** Various build errors

**Solution:**
1. Ensure you have a stable internet connection (needed to pull base images and install dependencies)
2. Clear Docker build cache: `docker builder prune`
3. Try building again

## Production Deployment

For production deployment, consider:

1. **Use a specific tag instead of `latest`:**
   ```bash
   docker build -t msg-viewer:1.0.0 .
   ```

2. **Push to a container registry:**
   ```bash
   docker tag msg-viewer:1.0.0 your-registry/msg-viewer:1.0.0
   docker push your-registry/msg-viewer:1.0.0
   ```

3. **Enable HTTPS:** Use a reverse proxy like Traefik, Nginx Proxy Manager, or Caddy in front of the container

4. **Resource limits:** Add resource constraints in production:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

5. **Update Content Security Policy:** Review and tighten the CSP in `nginx.conf` based on your needs

## Files Created

- `Dockerfile` - Multi-stage build configuration
- `.dockerignore` - Files to exclude from Docker build context
- `nginx.conf` - Nginx web server configuration
- `docker-compose.yml` - Docker Compose orchestration file
- `DOCKER-README.md` - This file

## Original Build Script

The `build.ts` file has been updated to copy the favicon to the build output. This ensures all required static assets are included in the Docker image.

## Functionality

All functionality remains identical to the web-hosted version:
- Parsing happens entirely in the browser (client-side)
- No data is sent to external servers
- Privacy and security model unchanged
- Works offline after initial page load

## Support

For issues specific to the Docker setup, please check:
1. Docker Desktop is running
2. You have sufficient disk space
3. Your firewall allows Docker traffic
4. No port conflicts exist

For issues with the MSG Viewer application itself, refer to the main README.md.
