import zlib
import struct
import math

def generate_hk_png(filepath, size=512):
    # RGBA image buffer
    width = size
    height = size
    raw_data = bytearray()

    cx, cy = width / 2.0, height / 2.0
    outer_radius = size * 0.46
    inner_radius = size * 0.43
    center_radius = size * 0.41

    # Colors
    bg_dark = (15, 23, 42, 255)      # #0f172a
    gold_border = (245, 158, 11, 255) # #f59e0b
    gold_light = (251, 191, 36, 255)  # #fbbf24

    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            dx = x - cx
            dy = y - cy
            dist = math.sqrt(dx*dx + dy*dy)

            if dist > outer_radius:
                # Transparent outside circle
                raw_data.extend([0, 0, 0, 0])
            elif dist > inner_radius:
                # Outer gold ring
                raw_data.extend(gold_border)
            elif dist > center_radius:
                # Inner thin gold highlight
                raw_data.extend(gold_light)
            else:
                # Dark navy emblem background
                # Let's draw stylized 'H' and 'K' in the center
                norm_x = (x - cx) / (size * 0.28)
                norm_y = (y - cy) / (size * 0.28)

                is_letter = False

                # Letter 'H' on left (-0.8 to -0.1)
                # Left bar: x in [-0.85, -0.65], y in [-0.7, 0.7]
                if -0.85 <= norm_x <= -0.65 and -0.7 <= norm_y <= 0.7:
                    is_letter = True
                # Right bar of H: x in [-0.35, -0.15], y in [-0.7, 0.7]
                elif -0.35 <= norm_x <= -0.15 and -0.7 <= norm_y <= 0.7:
                    is_letter = True
                # Crossbar of H: x in [-0.7, -0.2], y in [-0.12, 0.12]
                elif -0.7 <= norm_x <= -0.2 and -0.12 <= norm_y <= 0.12:
                    is_letter = True

                # Letter 'K' on right (0.1 to 0.85)
                # Left bar of K: x in [0.15, 0.35], y in [-0.7, 0.7]
                elif 0.15 <= norm_x <= 0.35 and -0.7 <= norm_y <= 0.7:
                    is_letter = True
                # Upper diagonal of K: y ≈ -x + 0.35
                elif 0.25 <= norm_x <= 0.85 and -0.7 <= norm_y <= 0.1:
                    # distance to line y + x - 0.15 = 0
                    if abs((norm_x - 0.25) - (-norm_y)) < 0.15:
                        is_letter = True
                # Lower diagonal of K: y ≈ x - 0.25
                elif 0.25 <= norm_x <= 0.85 and -0.1 <= norm_y <= 0.7:
                    if abs((norm_x - 0.25) - norm_y) < 0.15:
                        is_letter = True

                if is_letter:
                    raw_data.extend(gold_light)
                else:
                    raw_data.extend(bg_dark)

    # Encode PNG chunks
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    png_header = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr = chunk(b'IHDR', ihdr_data)
    idat = chunk(b'IDAT', zlib.compress(bytes(raw_data), 6))
    iend = chunk(b'IEND', b'')

    with open(filepath, 'wb') as f:
        f.write(png_header + ihdr + idat + iend)
    print(f"Generated {filepath} successfully ({size}x{size})")

generate_hk_png('/app/applet/public/icon-512.png', 512)
generate_hk_png('/app/applet/public/icon-192.png', 192)
