"""End-to-end smoke test: local MariaDB (docker compose) + dm-ml API + Nuxt production build.

Prerequisites:
  1. `docker compose up -d` (MariaDB on 127.0.0.1:3307 with db/seed.sql)
  2. `bun install && bun run build`
  3. a clone of dm-course-monorepo with apps/api/.venv set up (scripts/setup.sh) and Playwright in that venv
Run:
  DM_ML_DIR=/path/to/dm-course-monorepo/apps/api $DM_ML_DIR/.venv/bin/python scripts/smoke.py
"""
import json, os, signal, subprocess, sys, tempfile, time, urllib.request
from pathlib import Path

FE = Path(__file__).resolve().parents[1]
ML = Path(os.environ.get("DM_ML_DIR", FE.parent / "dm-course-monorepo" / "apps" / "api")).resolve()
PY = ML / ".venv" / "bin" / "python"
FE_URL, ML_URL = "http://127.0.0.1:3000", "http://127.0.0.1:3001"
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail)); print(("PASS " if cond else "FAIL ") + name + (f"  [{detail}]" if detail and not cond else ""))


def http(method, url, body=None):
    req = urllib.request.Request(url, method=method, data=None if body is None else json.dumps(body).encode(),
                                 headers={"content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.loads(r.read() or b"null")
    except urllib.error.HTTPError as e:
        return e.code, None


def wait(url, t=90):
    for _ in range(t):
        try:
            urllib.request.urlopen(url, timeout=2); return True
        except Exception:
            time.sleep(1)
    return False


def start_ml(tmp):
    env = {**os.environ, "DM_MODELS_DIR": str(tmp / "models"), "DM_LIVE_EVENTS": str(tmp / "live.csv"),
           "HF_HUB_DISABLE_PROGRESS_BARS": "1"}
    p = subprocess.Popen([str(ML / ".venv/bin/uvicorn"), "app.main:app", "--port", "3001", "--host", "127.0.0.1"],
                         cwd=ML, env=env, stdout=open(tmp / "ml.log", "w"), stderr=subprocess.STDOUT, start_new_session=True)
    return p


def stop(p):
    if p and p.poll() is None:
        os.killpg(p.pid, signal.SIGTERM); p.wait(10)


def main():
    tmp = Path(tempfile.mkdtemp())
    ml = start_ml(tmp)
    fe = subprocess.Popen(["bun", ".output/server/index.mjs"], cwd=FE, env={**os.environ, "PORT": "3000", "HOST": "127.0.0.1"},
                          stdout=open(tmp / "fe.log", "w"), stderr=subprocess.STDOUT, start_new_session=True)
    try:
        check("dm-ml /health", wait(ML_URL + "/health"))
        check("frontend up", wait(FE_URL + "/api/shop"))
        s, shop = http("GET", FE_URL + "/api/shop"); check("GET /api/shop -> 252 products with a price", s == 200 and len(shop) == 252 and shop[0]["price"] > 0)
        slug = shop[0]["slug"]; pid = shop[0]["product_id"]
        s, cat = http("GET", FE_URL + "/api/category/electronics"); check("GET /api/category/electronics", s == 200 and len(cat["products"]) == 21)
        s, _ = http("GET", FE_URL + "/api/category/nope"); check("GET /api/category/nope -> 404", s == 404)
        s, pr = http("GET", FE_URL + f"/api/product/{slug}"); check("GET /api/product/{slug} with SEO", s == 200 and pr["seo"]["title"])
        s, ev = http("POST", FE_URL + "/api/event/track", {"event_type": "product_view", "product_id": pid, "user_session": "smoke_s1", "user_id": 395})
        check("POST /api/event/track -> 201 + forwarded_to_ml", s == 201 and ev["event_id"] > 0 and ev["forwarded_to_ml"] is True, str(ev))
        s, _ = http("POST", FE_URL + "/api/event/track", {"event_type": "add_to_cart", "user_session": "smoke_s1"})
        check("POST /api/event/track without product_id -> 422", s == 422)
        s, _ = http("POST", FE_URL + "/api/event/track", {"event_type": "bogus", "user_session": "x"}); check("unknown event_type -> 422", s == 422)
        s, h = http("GET", FE_URL + "/ml/health"); check("Nitro proxy /ml/** -> dm-ml", s == 200 and h["status"] == "ok")

        from playwright.sync_api import sync_playwright
        with sync_playwright() as pw:
            chrome = os.environ.get("CHROME_PATH", "/usr/bin/google-chrome")
            b = pw.chromium.launch(executable_path=chrome if os.path.exists(chrome) else None, headless=True, args=["--no-sandbox"])
            page = b.new_page(); errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            def visit(path, selector, name, timeout=60000):
                try:
                    page.goto(FE_URL + path, wait_until="networkidle", timeout=timeout)
                    page.wait_for_selector(selector, timeout=timeout)
                    check(f"page {path}: {name}", True)
                except Exception as e:
                    check(f"page {path}: {name}", False, str(e)[:200])
            visit("/", "[data-testid=home-hero]", "home hero (Day 12)")
            visit("/shop", "[data-testid=shop-status]:has-text('recommended')", "personalized order available (Day 8)")
            page.click("[data-testid=personalized-toggle]"); page.wait_for_timeout(300)
            check("shop: Personalized shows the 'For you' badge", page.locator("text=For you").count() > 0)
            visit("/category/electronics", "text=Electronics", "category")
            visit(f"/product/{slug}", "[data-testid=rec-content]", "content recommendations (Day 5)")
            for sec, day in (("collaborative", 6), ("semantic", 10), ("session", 9)):
                try:
                    page.wait_for_selector(f"[data-testid=rec-{sec}]", timeout=30000); check(f"product: {sec} section (Day {day})", True)
                except Exception as e:
                    check(f"product: {sec} section (Day {day})", False, str(e)[:150])
            check("product: catalog price (not '15$')", "€" in page.inner_text("[data-testid=product-price]"))
            page.click("text=Add to cart"); page.wait_for_timeout(800)
            sid = page.evaluate("localStorage.getItem('user_session')")
            visit("/search?q=wireless%20earbuds%20for%20travel", "[data-testid=search-meta]", "semantic search (Day 10)")
            visit("/admin/segments", "[data-testid=train-segments]", "admin segments")
            page.click("[data-testid=train-segments]"); page.wait_for_selector("[data-testid=segments-table]", timeout=120000)
            check("admin segments: training -> segment table (Day 2)", True)
            visit("/admin/conversion", "[data-testid=train-conversion]", "admin conversion")
            page.click("[data-testid=train-conversion]"); page.wait_for_selector("[data-testid=metrics-table]", timeout=120000)
            check("admin conversion: training -> metrics (Day 3) despite live events", True)
            page.click("[data-testid=predict]"); page.wait_for_selector("[data-testid=prediction]", timeout=30000)
            check("admin conversion: prediction for a user", True)
            visit("/admin/campaigns", "[data-testid=campaigns-table]", "admin campaigns")
            page.click("[data-testid=load-audience]"); page.wait_for_selector("[data-testid=audience-summary]", timeout=120000)
            page.wait_for_selector("[data-testid=comparison-table]", timeout=120000)
            check("admin campaigns: audience + rule vs ML (Day 4)", "mode ml" in page.inner_text("[data-testid=audience-summary]"))
            visit("/admin/recommendations", "[data-testid=eval-table]", "evaluation (Day 7)", timeout=180000)
            visit("/admin/recommendations", "[data-testid=ctr-card]", "CTR card (Day 9)")
            visit("/admin/recommendations/hybrid", "[data-testid=hybrid-table]", "hybrid evaluation (Day 8)", timeout=180000)
            visit("/admin/ai", "[data-testid=generate-seo]", "admin AI")
            page.wait_for_timeout(500); page.click("[data-testid=generate-seo]"); page.wait_for_selector("[data-testid=seo-result]", timeout=30000)
            check("admin AI: SEO result (Day 11)", "template" in page.inner_text("[data-testid=seo-result]"))
            visit("/admin/marketing", "[data-testid=modules-table]", "marketing modules (Day 12)")
            visit("/admin/event", "[data-testid=event-counts]", "admin events (Day 1)")
            s, evs = http("GET", FE_URL + f"/api/event?session={sid}&limit=200")
            types = {c["event_type"] for c in evs["counts"]}
            check("browser events written to the local database", {"product_view", "recommendation_impression", "add_to_cart", "search"} <= types, str(types))
            s, sess = http("GET", ML_URL + f"/recommendations/session/{sid}?limit=5")
            check("dm-ml sees the live session (session recs without fallback)", s == 200 and sess["fallback"] is False, str(sess)[:200])
            check("no JS errors on pages", not errors, "; ".join(errors)[:300])
            # graceful fallback: dm-ml stopped
            stop(ml); ml = None; errors.clear()
            visit(f"/product/{slug}", "[data-testid=product-name]", "product works when dm-ml is down")
            check("product without dm-ml: no recommendations, no crash", page.locator("[data-testid=rec-content]").count() == 0 and not errors)
            visit("/shop", "[data-testid=shop-status]:has-text('unavailable')", "shop: default order when dm-ml is down")
            visit("/admin/segments", "text=dm-ml is unavailable", "admin: clear message when dm-ml is down")
            s, ev = http("POST", FE_URL + "/api/event/track", {"event_type": "product_view", "product_id": pid, "user_session": "smoke_s2"})
            check("tracking works without dm-ml (forwarded_to_ml=false)", s == 201 and ev["forwarded_to_ml"] is False)
            b.close()
    finally:
        stop(ml); stop(fe)
    n_ok = sum(r[1] for r in results)
    print(f"\nfrontend smoke: passed={n_ok} failed={len(results) - n_ok}")
    sys.exit(0 if n_ok == len(results) else 1)


if __name__ == "__main__":
    main()
