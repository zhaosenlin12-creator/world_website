import urllib.request, socket, time
socket.setdefaulttimeout(30)
urls = [
    "https://world-website.pages.dev/",
    "https://world-website.pages.dev/resources/",
    "https://world-website.pages.dev/stories/",
    "https://world-website.pages.dev/planets/earth/",
    "https://world-website.pages.dev/explore/",
    "https://world-website.pages.dev/assets/textures/earth.jpg",
    "https://world-website.pages.dev/assets/textures/jupiter.jpg",
    "https://world-website.pages.dev/assets/textures/neptune.webp",
    "https://world-website.pages.dev/assets/textures/sun.jpg",
    "https://world-website.pages.dev/assets/textures/mars.jpg",
    "https://world-website.pages.dev/assets/textures/venus.jpg",
    "https://world-website.pages.dev/assets/textures/mercury.jpg",
    "https://world-website.pages.dev/assets/textures/saturn.jpg",
    "https://world-website.pages.dev/assets/textures/uranus.jpg",
    "https://world-website.pages.dev/assets/textures/pluto.jpg",
    "https://world-website.pages.dev/assets/textures/ceres.jpg",
    "https://world-website.pages.dev/assets/textures/moon.jpg",
    "https://world-website.pages.dev/assets/textures/neptune.jpg",
    "https://world-website.pages.dev/assets/textures/saturn_ring.jpg"
]
for url in urls:
    try:
        t0 = time.time()
        req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
        with urllib.request.urlopen(req) as r:
            data = r.read(500)
            ct = r.headers.get("Content-Type", "?")
            cl = r.headers.get("Content-Length", "-")
            print(r.status, ct, cl, round(time.time() - t0, 1), "s", url)
    except Exception as e:
        print("ERR", type(e).__name__, url, str(e)[:60])