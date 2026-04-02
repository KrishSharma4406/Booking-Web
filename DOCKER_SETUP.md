# Docker Setup Guide

This guide explains how to run the Booking Web application using Docker and Docker Compose.

## Prerequisites

- Docker installed (https://docs.docker.com/get-docker/)
- Docker Compose installed (included with Docker Desktop)

## Quick Start with Docker Compose

### 1. Setup Environment Variables

Create a `.env.local` file in the project root with your configuration:

```env
# MongoDB
MONGO_USER=root
MONGO_PASSWORD=password
MONGO_DB=booking_web
MONGODB_URI=mongodb://root:password@localhost:27017/booking_web?authSource=admin

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=

# Services (optional)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

### 2. Start MongoDB and App

```bash
# Start the application (builds if needed)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop the application
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

The application will be available at `http://localhost:3001`

### 3. Connect to MongoDB

```bash
# Access MongoDB shell
docker-compose exec db mongosh -u root -p password --authenticationDatabase admin

# Or with MongoDB Compass (GUI)
# Connection string: mongodb://root:password@localhost:27017
```

## Docker Compose Services

### MongoDB Database
- **Container**: booking-db
- **Port**: 27017 (internal) / 27017 (host)
- **Default Credentials**:
  - Username: root
  - Password: password
  - Database: booking_web
- **Volume**: mongo_data (persists between restarts)

### Next.js Application
- **Container**: booking-app
- **Port**: 3001
- **User**: nextjs (non-root)
- **Depends on**: MongoDB (waits for health check)

## Building Docker Image Manually

If you prefer to build the image separately:

```bash
# Build the image
docker build -t booking-web:latest .

# Run the container
docker run -d \
  -p 3001:3001 \
  --name booking-app \
  -e MONGODB_URI=mongodb://root:password@db:27017/booking_web?authSource=admin \
  -e NEXTAUTH_SECRET=your-secret-key \
  booking-web:latest
```

## Useful Docker Commands

```bash
# View all containers
docker-compose ps

# View application logs
docker-compose logs app

# View database logs
docker-compose logs db

# View all logs
docker-compose logs

# Rebuild images
docker-compose up --build -d

# Remove old images/containers
docker-compose down
docker system prune

# Access MongoDB shell
docker-compose exec db mongosh -u root -p password --authenticationDatabase admin

# Execute command in running container
docker-compose exec app npm run build

# Restart a service
docker-compose restart app
```

## Troubleshooting

### "Port 3001 is already in use"
```bash
# Find and kill the process
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or use a different port in docker-compose.yml
# Change ports: - "3002:3001"
```

### "MongoDB connection failed"
```bash
# Check if MongoDB is healthy
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db

# Check MongoDB connectivity
docker-compose exec db mongosh -u root -p password --authenticationDatabase admin
```

### Build errors
```bash
# Clean rebuild
docker-compose down -v
docker system prune
docker-compose up --build -d
```

### Connection string issues
Check that MONGODB_URI includes:
- Username: root
- Password: password (from .env.local)
- Host: db (MongoDB container hostname)
- Port: 27017
- AuthSource: admin
- Database: booking_web

Example: `mongodb://root:password@db:27017/booking_web?authSource=admin`

## Production Deployment

For production, consider:

1. **Use strong credentials** (update MONGO_USER, MONGO_PASSWORD)
2. **Generate secure NEXTAUTH_SECRET**: `openssl rand -base64 32`
3. **Configure proper MongoDB backups**
4. **Use a reverse proxy** (nginx) in front of the app
5. **Enable Docker restart policy**: `restart: unless-stopped`
6. **Set resource limits** in docker-compose
7. **Use secrets management** (Docker secrets or external services)
8. **Enable MongoDB authentication** with proper user roles

Example production docker-compose setup:

```yaml
version: '3.8'
services:
  app:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
    environment:
      NODE_ENV: production
      # ... other environment variables
```

## Volume Persistence

MongoDB data is stored in the `mongo_data` volume. To back it up:

```bash
# Backup database
docker-compose exec db mongodump --uri="mongodb://root:password@localhost:27017/booking_web?authSource=admin" --out=/backup

# Restore database
docker-compose exec db mongorestore --uri="mongodb://root:password@localhost:27017" /backup
```

## Network

Both services communicate via the `booking-network` bridge network. App connects to database using `db` hostname defined in docker-compose.

## Documentation

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment/docker)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
- [MongoDB Connection String](https://docs.mongodb.com/manual/reference/connection-string/)
