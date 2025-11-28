#!/bin/bash

# ============================================================
# Beaucharme Plant Image Generator
# Uses OpenAI GPT-Image-1 API (GPT-4o image generation)
#
# IMPORTANT: First regenerate your API key at:
# https://platform.openai.com/api-keys
#
# Usage:
#   export OPENAI_API_KEY="sk-your-new-key"
#   ./generate-images.sh
# ============================================================

if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY environment variable is required"
    echo ""
    echo "Usage:"
    echo '  export OPENAI_API_KEY="sk-your-new-key"'
    echo "  ./generate-images.sh"
    exit 1
fi

OUTPUT_DIR="public/images/plants"
mkdir -p "$OUTPUT_DIR"

echo "============================================================"
echo "Beaucharme Plant Image Generator - GPT-Image-1"
echo "============================================================"

# Function to generate and download an image
generate_image() {
    local id=$1
    local prompt=$2
    local output_file="$OUTPUT_DIR/$id.jpg"

    if [ -f "$output_file" ]; then
        echo "[SKIP] $id.jpg already exists"
        return
    fi

    echo ""
    echo "Generating: $id..."

    # Call OpenAI API
    response=$(curl -s https://api.openai.com/v1/images/generations \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $OPENAI_API_KEY" \
        -d "{
            \"model\": \"gpt-image-1\",
            \"prompt\": \"$prompt\",
            \"n\": 1,
            \"size\": \"1536x1024\",
            \"quality\": \"high\"
        }")

    # Extract base64 data from response (gpt-image-1 returns b64_json by default)
    b64_data=$(echo "$response" | grep -o '"b64_json": *"[^"]*"' | head -1 | sed 's/"b64_json": *"//' | sed 's/"$//')

    if [ -z "$b64_data" ]; then
        # Try URL format as fallback
        url=$(echo "$response" | grep -o '"url": *"[^"]*"' | head -1 | cut -d'"' -f4)
        if [ -z "$url" ]; then
            echo "  Error generating image. Response:"
            echo "$response" | head -10
            return
        fi
        echo "  Downloading from URL..."
        curl -s -L -o "$output_file" "$url"
    else
        echo "  Decoding base64..."
        echo "$b64_data" | base64 -d > "$output_file"
    fi

    if [ -f "$output_file" ]; then
        echo "  Saved: $output_file"
    else
        echo "  Failed to download"
    fi

    # Wait to avoid rate limits
    sleep 3
}

# Generate all plant images
generate_image "bourrache" "RAW photo of blue star-shaped borage flowers in a French farm field, shot with Canon EOS R5, 85mm f/1.4 lens, shallow depth of field, morning golden hour light, dew drops visible on petals, photorealistic, editorial nature photography for magazine, 8k resolution, no illustration, no painting, no digital art"

generate_image "cameline" "RAW photo of camelina sativa yellow flowers in agricultural field, Burgundy France countryside, shot with Sony A7R IV, 70-200mm telephoto lens, warm afternoon sunlight, realistic farming scene, photojournalistic style, National Geographic quality, no CGI, no illustration"

generate_image "camomille" "RAW photograph of white roman chamomile flowers with yellow centers in meadow, macro shot with Canon 100mm f/2.8L lens, morning dew drops, soft bokeh background, natural daylight, documentary style botanical photography, ultra realistic, film grain, no digital art"

generate_image "carthame" "RAW photo of orange safflower carthamus flowers blooming in field, shot on Hasselblad medium format, natural sunlight, French agricultural landscape background, photorealistic texture detail, editorial stock photography style, real plant no illustration"

generate_image "chanvre" "RAW photograph of industrial hemp cannabis sativa leaves and plants in farm field, shot with Nikon D850, 50mm lens, overcast natural lighting, shallow depth of field, documentary agricultural photography, photojournalistic, no CGI no illustration"

generate_image "laurier" "RAW photo of fresh bay laurel laurus nobilis branch with glossy dark green leaves, studio-style natural lighting, shot on Phase One IQ4, shallow focus, culinary herb photography, food magazine quality, photorealistic, no digital art"

generate_image "lavandin" "RAW photograph of purple lavender field rows in Provence France at sunset golden hour, shot with Canon 5D Mark IV, 24-70mm lens, warm light, real location photography, travel magazine quality, photorealistic landscape, no painting no illustration"

generate_image "menthe-poivree" "RAW macro photo of fresh green peppermint mentha leaves with water droplets, shot with Canon MP-E 65mm macro lens, natural window light, shallow depth of field, herb garden setting, food photography style, photorealistic detail, no CGI"

generate_image "sauge" "RAW photograph of clary sage salvia sclarea purple flower spikes in herb field, shot with Sony 90mm macro lens, soft natural lighting, French countryside background, botanical documentary style, National Geographic quality, photorealistic"

generate_image "tournesol" "RAW photo of sunflower field helianthus at golden hour sunset, France countryside, shot with Canon EOS R5 and 35mm lens, warm golden light, bees on flowers, editorial landscape photography, photojournalistic style, no illustration no digital art"

echo ""
echo "============================================================"
echo "Done! Generated images are in: $OUTPUT_DIR"
echo "============================================================"
ls -la "$OUTPUT_DIR"
