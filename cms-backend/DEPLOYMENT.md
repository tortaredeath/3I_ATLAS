# CMS Backend Deployment Guide

## Prerequisites

- Node.js 16+ 
- MongoDB 4.4+
- npm or yarn

## Environment Setup

1. **Clone and install dependencies:**
   ```bash
   cd cms-backend
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables:**
   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/homepage-cms
   JWT_SECRET=your-super-secure-jwt-secret
   ```

## Database Setup

1. **Start MongoDB:**
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Linux with systemctl
   sudo systemctl start mongod
   
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Create initial admin user:**
   ```bash
   npm run seed:admin
   ```

## Production Deployment

### Using PM2 (Recommended)

1. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

2. **Start application:**
   ```bash
   pm2 start src/app.js --name homepage-cms
   pm2 save
   pm2 startup
   ```

### Using Docker

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   USER node
   CMD ["npm", "start"]
   ```

2. **Build and run:**
   ```bash
   docker build -t homepage-cms .
   docker run -d -p 3000:3000 --env-file .env homepage-cms
   ```

### Using Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/homepage-cms
      - JWT_SECRET=your-super-secure-jwt-secret
    depends_on:
      - mongodb
    volumes:
      - ./uploads:/app/uploads

  mongodb:
    image: mongo:5.0
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

volumes:
  mongodb_data:
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /path/to/your/app/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Security Checklist

- [ ] Change default JWT secret
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Use HTTPS in production
- [ ] Set up database authentication
- [ ] Configure file upload restrictions
- [ ] Set up monitoring and logging
- [ ] Regular security updates

## Monitoring

### Health Check Endpoint
```bash
curl http://localhost:3000/health
```

### PM2 Monitoring
```bash
pm2 monitor
pm2 logs homepage-cms
pm2 restart homepage-cms
```

## Backup Strategy

1. **Database backup:**
   ```bash
   mongodump --host localhost --port 27017 --db homepage-cms --out ./backups/
   ```

2. **File backup:**
   ```bash
   rsync -av uploads/ ./backups/uploads/
   ```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

2. **MongoDB connection failed:**
   - Check MongoDB service status
   - Verify connection string
   - Check firewall settings

3. **File upload issues:**
   - Check uploads directory permissions
   - Verify disk space
   - Check file size limits

### Logs Location

- Application logs: `pm2 logs homepage-cms`
- MongoDB logs: `/var/log/mongodb/mongod.log`
- Nginx logs: `/var/log/nginx/`

## Performance Optimization

1. **Enable gzip compression**
2. **Set up CDN for static files**
3. **Implement database indexing**
4. **Use connection pooling**
5. **Set up caching (Redis)**
6. **Monitor memory usage**

## Maintenance

### Regular Tasks

- Database backup (daily)
- Log rotation (weekly)
- Security updates (monthly)
- Performance monitoring (ongoing)
- SSL certificate renewal (as needed)

### Scaling Considerations

- Load balancer setup
- Database replication
- Horizontal scaling with multiple instances
- CDN integration
- Caching layer implementation