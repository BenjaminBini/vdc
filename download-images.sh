#!/bin/bash

# Download Midjourney product images
# Run from project root: ./download-images.sh

cd public/images

echo "Downloading Midjourney product images..."

curl -L -o product-a-0.png "https://cdn.midjourney.com/a9634353-73b2-4a82-ad73-e4cf12e409d9/0_0.png"
curl -L -o product-a-1.png "https://cdn.midjourney.com/a9634353-73b2-4a82-ad73-e4cf12e409d9/0_1.png"
curl -L -o product-a-2.png "https://cdn.midjourney.com/a9634353-73b2-4a82-ad73-e4cf12e409d9/0_2.png"
curl -L -o product-a-3.png "https://cdn.midjourney.com/a9634353-73b2-4a82-ad73-e4cf12e409d9/0_3.png"
curl -L -o product-b-0.png "https://cdn.midjourney.com/c2a61d95-5a03-4368-b036-258ac444ec94/0_0.png"
curl -L -o product-b-1.png "https://cdn.midjourney.com/c2a61d95-5a03-4368-b036-258ac444ec94/0_1.png"
curl -L -o product-b-2.png "https://cdn.midjourney.com/c2a61d95-5a03-4368-b036-258ac444ec94/0_2.png"
curl -L -o product-b-3.png "https://cdn.midjourney.com/c2a61d95-5a03-4368-b036-258ac444ec94/0_3.png"

echo ""
echo "Done! Downloaded files:"
ls -la product-*.png
