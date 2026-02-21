# Docker Guide for Mega Project

## Prerequisites

1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Make sure Docker is running (check system tray icon)

2. **Environment Variables**
   - Create a `.env` file in the project root with all required variables
   - Required variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, etc.

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Option 2: Using Docker Commands

```bash
# Build the image
docker build -t mega-app .

# Run the container
docker run -p 3000:3000 --env-file .env mega-app

# Run in detached mode (background)
docker run -d -p 3000:3000 --env-file .env --name mega-app mega-app

# View logs
docker logs -f mega-app

# Stop the container
docker stop mega-app

# Remove the container
docker rm mega-app
```

## Important Commands

### Managing Containers

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a container
docker stop <container-name>

# Start a stopped container
docker start <container-name>

# Restart a container
docker restart <container-name>

# Remove a container
docker rm <container-name>

# Remove all stopped containers
docker container prune
```

### Managing Images

```bash
# List images
docker images

# Remove an image
docker rmi mega-app

# Remove unused images
docker image prune
```

### Debugging

```bash
# Execute commands inside running container
docker exec -it mega-app sh

# View container logs
docker logs mega-app

# Follow logs in real-time
docker logs -f mega-app

# Inspect container
docker inspect mega-app
```

## Database Migrations with Prisma

If you need to run Prisma migrations:

```bash
# Run migrations in the container
docker exec mega-app npx prisma migrate deploy

# Generate Prisma client (usually not needed as it's done during build)
docker exec mega-app npx prisma generate
```

## Rebuilding After Changes

```bash
# Rebuild the image (with Docker Compose)
docker-compose build --no-cache

# Or with Docker
docker build --no-cache -t mega-app .

# Then restart
docker-compose up -d
# or
docker run -d -p 3000:3000 --env-file .env --name mega-app mega-app
```

## Port Mappings

- **Host Port 3000** → **Container Port 3000**
- Access your app at: http://localhost:3000

To change the host port, modify the `-p` flag:
```bash
docker run -p 8080:3000 ...  # Access via http://localhost:8080
```

## Environment Variables

Pass environment variables in multiple ways:

1. **Using .env file:**
   ```bash
   docker run --env-file .env ...
   ```

2. **Individual variables:**
   ```bash
   docker run -e DATABASE_URL="..." -e NEXTAUTH_SECRET="..." ...
   ```

3. **Using docker-compose.yml** (already configured)

## Production Deployment

For production deployments:

1. **Build optimized image:**
   ```bash
   docker build -t mega-app:production .
   ```

2. **Push to registry (e.g., Docker Hub):**
   ```bash
   docker tag mega-app:production username/mega-app:latest
   docker push username/mega-app:latest
   ```

3. **Deploy to cloud platforms:**
   - AWS ECS/Fargate
   - Google Cloud Run
   - Azure Container Instances
   - DigitalOcean App Platform

## Troubleshooting

### Build Fails
- Ensure `package.json` and `package-lock.json` exist
- Check that `next.config.mjs` has `output: 'standalone'`
- Verify Prisma schema is valid

### Container Won't Start
- Check logs: `docker logs mega-app`
- Verify environment variables are set
- Ensure database is accessible from container

### Port Already in Use
- Stop other services on port 3000
- Or use different port: `-p 8080:3000`

### Performance Issues
- Increase Docker Desktop memory allocation (Settings → Resources)
- Use `.dockerignore` to exclude unnecessary files

## Clean Up Everything

```bash
# Stop and remove all containers
docker-compose down

# Remove all stopped containers, unused networks, and dangling images
docker system prune

# Remove everything including volumes
docker system prune -a --volumes
```
