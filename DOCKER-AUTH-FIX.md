# Docker Authentication Fix

## Problem
Authentication doesn't work in Docker because:
1. `localhost` in Docker container refers to the container itself, not your Windows host
2. Missing required environment variables (NEXTAUTH_SECRET, EMAIL configuration)

## Solution

### Quick Fix (Recommended)

**1. Use the Docker-specific environment file:**
```bash
# Stop and remove old containers
docker rm -f mega-app

# Run with .env.docker file
docker run -d -p 8080:3000 --env-file .env.docker --name mega-app mega-app

# Access at http://localhost:8080
```

**2. Or use Docker Compose:**
```bash
docker-compose down
docker-compose up -d
```

### Key Changes Made

#### 1. Database URL
- **Local development:** `localhost:5432`
- **Docker:** `host.docker.internal:5432`

The `.env.docker` file uses `host.docker.internal` which is Docker's special DNS name to access the host machine.

#### 2. Required Environment Variables
Added these to `.env.docker`:
- `NEXTAUTH_URL` - Set to http://localhost:8080
- `NEXTAUTH_SECRET` - Required for NextAuth session encryption
- `EMAIL_USER` and `EMAIL_PASSWORD` - For password reset emails
- Other optional configurations

### Manual Configuration

If you want to update your main `.env` file for Docker:

```env
# Use this for Docker
DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/bookingweb"

# Add these required variables
NEXTAUTH_URL="http://localhost:8080"
NEXTAUTH_SECRET="your-secret-min-32-chars"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

Then run:
```bash
docker run -d -p 8080:3000 --env-file .env --name mega-app mega-app
```

### Verify It's Working

**Check container logs:**
```bash
docker logs -f mega-app
```

**Test authentication:**
1. Open http://localhost:8080
2. Try to sign up or log in
3. Check logs for any database connection errors

**Test database connection from container:**
```bash
docker exec mega-app npx prisma db push
```

### Troubleshooting

**Database connection fails:**
- Ensure PostgreSQL is running on Windows
- Check firewall allows connections on port 5432
- Verify `host.docker.internal` is working:
  ```bash
  docker exec mega-app ping host.docker.internal
  ```

**Authentication still fails:**
- Check NEXTAUTH_SECRET is set
- Verify EMAIL credentials are correct
- Check container logs: `docker logs mega-app`

**Port already in use:**
- Stop your local dev server (port 3000)
- Or use different port: `-p 8080:3000`

### Using Docker Compose (Easier)

The `docker-compose.yml` is now configured correctly. Just run:

```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access your app at: **http://localhost:8080**

## Summary

✅ **Container running** with `.env.docker`
✅ **Database accessible** via `host.docker.internal`
✅ **Authentication configured** with NEXTAUTH_SECRET
✅ **Available at** http://localhost:8080

Your Docker container should now have working authentication! 🎉
