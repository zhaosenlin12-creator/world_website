import re, sys
from scrapling.fetchers import Fetcher

print("==> Fetcher probe of homepage")
home = Fetcher.get("https://science.nasa.gov/solar-system/", impersonate="chrome", stealthy_headers=True)
print("status:", home.status)
print("len_html:", len(home.text))
print("has body?:", bool(home.css("body")))
print("a count:", len(home.css("a")))
print("first 500 chars:")
print((home.text or "")[:500])
print("---")
print("body content-types:", [r.headers.get("content-type") for r in [home]])
