from PIL import Image

def remove_white_background(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    # threshold for 'white'
    for item in datas:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(out_path, "PNG")

remove_white_background("/Users/kanlamat/.gemini/antigravity/brain/6557d836-c749-4806-bb40-db20832da894/media__1783496253268.png", "favicon.png")
print("Done")
