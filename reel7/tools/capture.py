# Real-site capture with Playwright. Chromium has no access to the session CA, so every request is fetched by
# python-requests (TLS verified against /root/.ccr/ca-bundle.crt, through HTTPS_PROXY) and handed to the page.
# usage: python3 tools/capture.py NAME URL [desktop|iphone] [scroll_px]
import sys, os, requests
from playwright.sync_api import sync_playwright
name, url = sys.argv[1], sys.argv[2]
mode = sys.argv[3] if len(sys.argv) > 3 else "desktop"
scroll = int(sys.argv[4]) if len(sys.argv) > 4 else 0
S = requests.Session(); S.verify = "/root/.ccr/ca-bundle.crt"
UA = {"desktop": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
      "iphone": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"}[mode]
def handle(route):
    rq = route.request
    try:
        h = {k: v for k, v in rq.headers.items() if k.lower() not in ("host", "content-length")}
        r = S.request(rq.method, rq.url, headers=h, data=rq.post_data_buffer, timeout=25, allow_redirects=False)
        hd = {k: v for k, v in r.headers.items() if k.lower() not in ("content-encoding", "transfer-encoding", "content-length", "content-security-policy")}
        route.fulfill(status=r.status_code, headers=hd, body=r.content)
    except Exception as e:
        route.abort()
os.makedirs("assets/screens", exist_ok=True)
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium")
    vp = {"width": 1440, "height": 900} if mode == "desktop" else {"width": 393, "height": 852}
    ctx = b.new_context(viewport=vp, user_agent=UA, device_scale_factor=2 if mode == "desktop" else 3, locale="fr-FR",
                        is_mobile=mode == "iphone", has_touch=mode == "iphone")
    ctx.route("**/*", handle)
    p = ctx.new_page()
    r = p.goto(url, timeout=60000, wait_until="load"); p.wait_for_timeout(2500)
    # cookie banners: accept the minimum / close
    for sel in ["text=Tout refuser", "text=Refuser", "text=Continuer sans accepter", "#tarteaucitronAllDenied2", "button:has-text('Reject')"]:
        try:
            if p.locator(sel).first.is_visible(): p.locator(sel).first.click(timeout=2000); p.wait_for_timeout(800); break
        except Exception: pass
    print(name, r.status if r else None, p.title())
    p.screenshot(path=f"assets/screens/{name}.png")
    if scroll:
        p.screenshot(path=f"assets/screens/{name}_full.png", full_page=True)
    b.close()
