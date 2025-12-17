

Builds a multi-arch image & Pushes the image to Docker Hub
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t nasirnjs/gostudentsvc:0.0.2 --push .
```

Build for Linux locally only.
```bash
docker buildx build --platform linux/amd64 -t nasirnjs/gostudentsvc:0.0.2 --load .
```