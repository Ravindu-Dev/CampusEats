# MongoDB Atlas Configuration Guide

## Quick Setup Steps

### 1. Create MongoDB Atlas Account & Cluster

Follow the detailed guide: [mongodb-atlas-setup.md](file:///C:/Users/user/.gemini/antigravity/brain/47935813-5ecd-4230-aa15-1204a6525500/mongodb-atlas-setup.md)

**Quick Summary:**
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a **FREE M0 cluster**
3. Create a database user with password
4. Whitelist your IP address (or allow all: 0.0.0.0/0 for development)
5. Get your connection string

### 2. Configure Your Application

#### Option A: Using Environment Variables (Recommended)

**Windows PowerShell:**
```powershell
# Set MongoDB connection string
$env:MONGODB_URI="mongodb+srv://your-username:your-password@your-cluster.xxxxx.mongodb.net/campuseats?retryWrites=true&w=majority"

# Set JWT secret
$env:JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"

# Set Stripe API key (optional for now)
$env:STRIPE_API_KEY="sk_test_your-stripe-key"

# Run the application
mvn spring-boot:run
```

**Windows CMD:**
```cmd
set MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.xxxxx.mongodb.net/campuseats?retryWrites=true^&w=majority
set JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
set STRIPE_API_KEY=sk_test_your-stripe-key
mvn spring-boot:run
```

#### Option B: Using .env File

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your actual values:
   ```properties
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.xxxxx.mongodb.net/campuseats?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
   STRIPE_API_KEY=sk_test_your-stripe-key
   ```

3. **Important:** `.env` is already in `.gitignore` - never commit it!

4. Load environment variables before running:
   ```powershell
   # PowerShell
   Get-Content .env | ForEach-Object {
       if ($_ -match '^([^=]+)=(.+)$') {
           [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
       }
   }
   mvn spring-boot:run
   ```

### 3. Verify Connection

Start your application and check the logs:

```
✅ Success: Opened connection [connectionId{...}] to campuseats-cluster...
❌ Error: Authentication failed or Network timeout
```

## Connection String Format

```
mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://campuseats-admin:MyP@ssw0rd@campuseats-cluster.abc123.mongodb.net/campuseats?retryWrites=true&w=majority
```

**Replace:**
- `campuseats-admin` → Your database username
- `MyP@ssw0rd` → Your database password
- `campuseats-cluster.abc123.mongodb.net` → Your cluster URL
- `campuseats` → Your database name

## Important Notes

> [!WARNING]
> **Special Characters in Password**
> 
> If your password contains special characters like `@`, `#`, `$`, etc., you must URL-encode them:
> - `@` → `%40`
> - `#` → `%23`
> - `$` → `%24`
> - `:` → `%3A`
> 
> Example: `MyP@ss#123` becomes `MyP%40ss%23123`

> [!IMPORTANT]
> **Security Best Practices**
> 
> - ✅ Use environment variables, not hardcoded values
> - ✅ Keep `.env` in `.gitignore`
> - ✅ Use different credentials for dev/staging/production
> - ✅ Restrict IP addresses in production
> - ❌ Never commit credentials to Git
> - ❌ Never share your connection string publicly

## Fallback to Localhost

The application is configured to fallback to localhost if `MONGODB_URI` is not set:

```properties
spring.data.mongodb.uri=${MONGODB_URI:mongodb://localhost:27017/campuseats}
```

This means:
- **If `MONGODB_URI` is set** → Use cloud database
- **If `MONGODB_URI` is NOT set** → Use localhost

## Team Collaboration

Each team member should:

1. Create their own MongoDB Atlas account (free tier)
2. Create their own cluster
3. Set their own `MONGODB_URI` environment variable
4. **OR** share one cluster and create separate database users

**Shared Cluster Approach:**
- One person creates the cluster
- Share the cluster URL
- Each person creates their own database user
- Each person uses their own credentials in their local `.env`

## Troubleshooting

### "Authentication failed"
- Verify username and password are correct
- Check for special characters (URL-encode them)
- Ensure user has correct database privileges

### "Network timeout" or "Connection refused"
- Check Network Access whitelist in MongoDB Atlas
- Add your current IP address
- For development, allow all IPs: `0.0.0.0/0`

### "Database not found"
- Ensure database name is in the connection string
- MongoDB creates the database automatically on first write
- Try creating a user to trigger database creation

### "SSL connection error"
- Ensure you're using `mongodb+srv://` (not `mongodb://`)
- Update Java to latest version if needed

---

**You're ready to use cloud MongoDB!** 🚀
