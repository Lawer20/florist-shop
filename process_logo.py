from PIL import Image
import os

def remove_white_background(input_path, output_path):
    print(f"Processing {input_path}...")
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            # Check if pixel is close to white (adjust threshold as needed)
            # Strategy: If it's a black logo on white, we can also use 'Luminance to Alpha' 
            # for smoother edges, but let's stick to a clean threshold + alpha clean first
            # to preserve original colors if any.
            
            # Simple thresholding with some tolerance
            if item[0] > 230 and item[1] > 230 and item[2] > 230:
                new_data.append((255, 255, 255, 0)) # Make transparent
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Saved to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

# Paths
input_file = r"C:/Users/Альона Шаповал/.gemini/antigravity/brain/08142d09-588d-4aa7-8562-076161a56e2c/uploaded_image_1768772114229.png"
output_file = r"c:/Users/Альона Шаповал/.gemini/antigravity/scratch/florist_shop/images/logo_transparent.png"

# Ensure directory exists
os.makedirs(os.path.dirname(output_file), exist_ok=True)

remove_white_background(input_file, output_file)
