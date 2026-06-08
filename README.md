# Build the image for Staging

```
docker build -t wle-fe:latest .
```

# Run the image in a container

```
docker run -d -p 3000:3000 \
 --name wle-fe-staging \
 -e API_BASE_URL="http://localhost:8000" \
 -e SERVER_API_BASE_URL="http://host.docker.internal:8000" \
 wle-fe:latest
```