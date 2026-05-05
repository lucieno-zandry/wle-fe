#Run the image in a container

```
docker run -d \
  -p 4000:3000 \
  -e VITE_API_BASE_URL=http://102.16.254.6:9000 \
  --name alofo_fe \
  lucienozandry/alofo-fe:latest
```