# Vibed to Cracked - Docker Deployment Guide

This guide deploys Vibed to Cracked to a VPS using Docker Compose, PostgreSQL, and Caddy for automatic HTTPS.

## Prerequisites

- A VPS with Ubuntu 20.04+ (2GB RAM minimum, 4GB recommended)
- A domain name pointing to your VPS IP
- SSH access to your VPS

## Quick Start

### 1. Prepare Your VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose plugin is bundled with recent Docker installs
docker compose version

# Log out and back in to apply Docker group changes
```

### 2. Deploy Your Application

```bash
# Clone your repository
git clone https://github.com/atef1995/vibed-to-cracked.git
cd vibed-to-cracked/app

# Make deployment script executable
chmod +x scripts/deploy.sh

# Run the deployment script
./scripts/deploy.sh
```

The deployment script will:
- Guide you through configuration
- Set up environment variables
- Start all services
- Run migrations and seeding
- Let Caddy manage HTTPS certificates automatically

### 3. Configure OAuth Applications

During deployment, you'll need to set up OAuth applications:

#### GitHub OAuth App
1. Go to https://github.com/settings/applications/new
2. Set Authorization callback URL to: `https://yourdomain.com/api/auth/callback/github`

#### Google OAuth App
1. Go to https://console.developers.google.com/
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set Authorized redirect URIs to: `https://yourdomain.com/api/auth/callback/google`

## Manual Configuration

If you prefer manual setup:

### 1. Environment Variables

Copy and configure the environment file:
```bash
cp .env.production.example .env.production
nano .env.production
```

### 2. Set Domain and ACME Email in .env.production

These variables are required for Caddy TLS automation:

```env
DOMAIN=yourdomain.com
ACME_EMAIL=you@yourdomain.com
```

### 3. Start Services

```bash
# Build and start all services
docker compose --env-file .env.production up -d --build

# Run database migrations
docker compose --env-file .env.production exec -T app npx prisma migrate deploy
docker compose --env-file .env.production exec -T app npx prisma db seed
```

## Service Architecture

- **app**: Next.js application (port 3000 internal)
- **db**: PostgreSQL database (internal network by default)
- **caddy**: Reverse proxy with automatic TLS (ports 80, 443)

## Useful Commands

### Application Management
```bash
# View all logs
docker compose --env-file .env.production logs -f

# View specific service logs
docker compose --env-file .env.production logs -f app
docker compose --env-file .env.production logs -f caddy
docker compose --env-file .env.production logs -f db

# Restart services
docker compose --env-file .env.production restart
docker compose --env-file .env.production restart app

# Update application
git pull
docker compose --env-file .env.production up --build -d app

# Stop all services
docker compose --env-file .env.production down
```

### Database Management
```bash
# Access database
docker compose --env-file .env.production exec db psql -U postgres -d vibed_to_cracked

# Create backup
docker compose --env-file .env.production exec -T db pg_dump -U postgres vibed_to_cracked > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker compose --env-file .env.production exec -T db psql -U postgres -d vibed_to_cracked < backup.sql

# Run migrations
docker compose --env-file .env.production exec -T app npx prisma migrate deploy
```

### Caddy TLS Management
```bash
# Tail Caddy logs for certificate issuance details
docker compose --env-file .env.production logs -f caddy

# View persisted certificate storage
docker volume inspect app_caddy_data
```

### Monitoring
```bash
# System resource usage
docker stats

# Disk usage
docker system df
docker system prune -a  # Clean up unused containers/images

# Check running containers
docker ps
```

## Security Considerations

### Firewall Setup
```bash
# Install UFW
sudo apt install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Regular Maintenance
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker compose --env-file .env.production pull
docker compose --env-file .env.production up -d

# Clean up Docker
docker system prune -a
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Your domain URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Yes |
| `GITHUB_ID` | GitHub OAuth client ID | Yes |
| `GITHUB_SECRET` | GitHub OAuth client secret | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | No |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | No |

## Troubleshooting

### Common Issues

1. **HTTPS certificates not working**
   ```bash
   # Check Caddy logs for ACME errors
   docker compose --env-file .env.production logs caddy

   # Ensure DNS points to VPS and ports 80/443 are open
   nslookup yourdomain.com
   ```

2. **Database connection errors**
   ```bash
   # Check database status
   docker compose --env-file .env.production exec db pg_isready -U postgres
   
   # Check database logs
   docker compose --env-file .env.production logs db
   ```

3. **Application not starting**
   ```bash
   # Check application logs
   docker compose --env-file .env.production logs app
   
   # Rebuild application
   docker compose --env-file .env.production up --build -d app
   ```

4. **Domain not resolving**
   - Verify DNS settings point to your VPS IP
   - Check domain propagation: `nslookup yourdomain.com`

### Performance Optimization

1. **Enable compression** (already configured in Caddy)
2. **Set up CDN** for static assets
3. **Database optimization**:
   ```bash
   # Analyze database performance
   docker compose --env-file .env.production exec db psql -U postgres -d vibed_to_cracked -c "ANALYZE;"
   ```

## Backup Strategy

### Automated Backups
Create a backup script:
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker compose --env-file .env.production exec -T db pg_dump -U postgres vibed_to_cracked > "backups/db_backup_$DATE.sql"
tar -czf "backups/app_backup_$DATE.tar.gz" .env.production prisma/
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/your/app && ./backup.sh
```

## Scaling Considerations

For high traffic, consider:
- Load balancer (Caddy or managed LB upstream)
- Database replica for read queries
- Redis for session storage
- CDN for static assets
- Horizontal scaling with Kubernetes

## Support

If you encounter issues:
1. Check the logs: `docker compose --env-file .env.production logs -f`
2. Verify environment variables
3. Check firewall settings
4. Ensure domain DNS is properly configured

For more help, refer to the application documentation or create an issue in the repository.
