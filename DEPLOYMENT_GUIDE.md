# Production Deployment Guide

This guide provides detailed instructions for deploying the Dubai Listings API to a production environment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Application Deployment](#application-deployment)
6. [SSL/TLS Configuration](#ssltls-configuration)
7. [Process Management](#process-management)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup Strategy](#backup-strategy)
10. [Scaling](#scaling)
11. [Maintenance](#maintenance)
12. [Troubleshooting](#troubleshooting)

## Prerequisites

- Linux server (Ubuntu 20.04/22.04 LTS recommended)
- Node.js 18.x or later
- MongoDB 6.0 or later (MongoDB Atlas recommended)
- Nginx (as reverse proxy)
- PM2 (for process management)
- Git
- Certbot (for SSL certificates)

## Server Setup

### 1. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Required Dependencies

```bash
sudo apt install -y \
  curl \
  wget \
  git \
  nginx \
  certbot \
  python3-certbot-nginx
```

### 3. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4. Install PM2 Globally

```bash
sudo npm install -g pm2
```

## Environment Configuration

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/dubai-listings-api.git
cd dubai-listings-api
```

### 2. Install Dependencies

```bash
npm ci --only=production
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
nano .env
```

Update the following variables:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email_username
EMAIL_PASSWORD=your_email_password
EMAIL_FROM="Dubai Listings <noreply@dubailistings.com>"
CLIENT_URL=https://yourdomain.com
UPLOAD_MAX_FILE_SIZE=5242880
UPLOAD_FILE_TYPES=image/jpg,image/png,image/jpeg
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
CORS_ORIGIN=https://yourdomain.com
```

## Database Setup

### 1. MongoDB Atlas (Recommended)

1. Create a new cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Set up a database user with appropriate permissions
3. Whitelist your server's IP address
4. Get the connection string and update `MONGODB_URI` in `.env`

### 2. Self-hosted MongoDB

```bash
# Install MongoDB
sudo apt install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## Application Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Start the Application with PM2

```bash
NODE_ENV=production pm2 start src/server.js --name "dubai-listings-api"
```

### 3. Configure PM2 to Start on Boot

```bash
pm2 startup
# Follow the instructions to enable PM2 on boot
pm2 save
```

## SSL/TLS Configuration

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Configure Nginx

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/dubai-listings
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}
```

Enable the site and test the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/dubai-listings /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 4. Set Up Automatic Certificate Renewal

```bash
sudo certbot renew --dry-run
sudo systemctl enable certbot.timer
```

## Process Management

### PM2 Commands

- Start application: `pm2 start src/server.js --name "dubai-listings-api"`
- Stop application: `pm2 stop dubai-listings-api`
- Restart application: `pm2 restart dubai-listings-api`
- View logs: `pm2 logs dubai-listings-api`
- Monitor: `pm2 monit`
- List processes: `pm2 list`

## Monitoring & Logging

### 1. Enable PM2 Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 2. Set Up Logrotate for Nginx

```bash
sudo nano /etc/logrotate.d/nginx
```

Add the following configuration:

```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

## Backup Strategy

### 1. MongoDB Backups

#### MongoDB Atlas

1. Enable automated backups in the Atlas dashboard
2. Set backup frequency and retention policy

#### Self-hosted MongoDB

Create a backup script:

```bash
#!/bin/bash

TIMESTAMP=$(date +%F_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"
MONGODB_URI="your_mongodb_uri"

mkdir -p $BACKUP_DIR
mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR/db-$TIMESTAMP

# Delete backups older than 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

Make it executable and add to cron:

```bash
chmod +x /path/to/backup-script.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup-script.sh") | crontab -
```

### 2. Application Data Backups

```bash
# Backup application code and configuration
rsync -avz /path/to/dubai-listings /backup/location/

# Backup environment variables
cp /path/to/dubai-listings/.env /backup/location/
```

## Scaling

### 1. Vertical Scaling

- Upgrade server resources (CPU, RAM, storage)
- Optimize MongoDB indexes
- Use a more powerful database plan (for MongoDB Atlas)

### 2. Horizontal Scaling

1. Set up a load balancer (e.g., Nginx, HAProxy)
2. Deploy multiple application instances
3. Configure session management (if using sessions)
4. Use a shared cache (Redis)

### 3. Database Scaling

- Enable sharding for large datasets
- Set up read replicas for read-heavy workloads
- Consider using MongoDB Atlas for managed scaling

## Maintenance

### 1. Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
cd /path/to/dubai-listings
git pull
npm ci --only=production
pm2 restart dubai-listings-api
```

### 2. Security Updates

- Regularly update dependencies: `npm audit fix`
- Monitor for security advisories
- Apply security patches promptly
- Regularly rotate credentials and API keys

## Troubleshooting

### Common Issues

1. **Application Not Starting**
   - Check logs: `pm2 logs dubai-listings-api`
   - Verify environment variables
   - Check database connection

2. **High Server Load**
   - Check running processes: `top` or `htop`
   - Analyze slow queries in MongoDB
   - Check application logs for errors

3. **SSL Certificate Issues**
   - Check certificate expiration: `sudo certbot certificates`
   - Renew certificates: `sudo certbot renew`
   - Verify Nginx configuration: `sudo nginx -t`

4. **Connection Refused**
   - Check if the application is running: `pm2 list`
   - Verify the port is open: `sudo netstat -tulpn | grep LISTEN`
   - Check firewall settings: `sudo ufw status`

### Getting Help

If you encounter issues not covered in this guide, please:

1. Check the application logs: `pm2 logs dubai-listings-api`
2. Review Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Check MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`
4. Open an issue on the GitHub repository

## Conclusion

This guide covers the essential steps to deploy the Dubai Listings API to a production environment. Regular maintenance and monitoring are crucial for ensuring the stability and security of your application.

For additional security and performance optimizations, consider:

- Implementing a Web Application Firewall (WAF)
- Setting up a CDN for static assets
- Configuring DDoS protection
- Implementing rate limiting at the application and infrastructure levels
- Setting up automated security scanning

Remember to keep your server and dependencies up to date with the latest security patches.
