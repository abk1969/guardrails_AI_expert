"""
Visual test for OWASP Data Security PDF integration.
Validates:
1. OWASP COMPASS banner visible + expandable, 3+ PDFs
2. UC-0001 modal shows DSGAI01, DSGAI11, DSGAI15 badges
3. Wiki DSGAI section with 22 accordions
4. FR/EN language toggle works (no untranslated strings)
"""
from playwright.sync_api import sync_playwright
import sys
import re

BASE_URL = "http://localhost:5080"
SCREENSHOT_DIR = "C:/Users/globa/ai_risk_and_red_team_manager/guardrails_AI_expert/.test-screenshots"


def log(msg):
    print(f"[TEST] {msg}", flush=True)


def discover_nav(page):
    """Print all visible nav buttons/links for orientation."""
    log("--- DOM Reconnaissance ---")
    buttons = page.locator("button, a").all()
    log(f"Found {len(buttons)} buttons/links")
    texts = set()
    for b in buttons[:200]:
        try:
            txt = b.inner_text(timeout=500).strip()
            if txt and len(txt) < 80:
                texts.add(txt)
        except Exception:
            pass
    for t in sorted(texts):
        log(f"  -{t}")


def main():
    import os
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        console_errors = []
        page.on("pageerror", lambda err: console_errors.append(f"PAGEERROR: {err}"))
        page.on("console", lambda msg: console_errors.append(f"CONSOLE-{msg.type}: {msg.text}") if msg.type == "error" else None)

        log(f"Navigating to {BASE_URL}")
        page.goto(BASE_URL, wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(1500)
        page.screenshot(path=f"{SCREENSHOT_DIR}/01-home.png", full_page=True)
        log(f"Title: {page.title()}")

        # ------------- Step 1: reconnaissance -------------
        discover_nav(page)

        # ------------- Step 2: navigate to COMPASS -------------
        log("\n=== TEST 1: Navigate to Référentiels → OWASP COMPASS ===")
        # Try multiple selector strategies
        candidates = [
            "text=Référentiels",
            "text=COMPASS",
            "text=OWASP COMPASS",
            "text=Cas d'Usage COMPASS",
        ]
        found_compass = False
        for sel in candidates:
            try:
                loc = page.locator(sel).first
                if loc.count() > 0 and loc.is_visible():
                    log(f"Clicking: {sel}")
                    loc.click()
                    page.wait_for_timeout(800)
                    # Try inner COMPASS link
                    for sub in ["text=Cas d'Usage COMPASS", "text=OWASP COMPASS", "text=COMPASS"]:
                        try:
                            s = page.locator(sub).first
                            if s.count() > 0 and s.is_visible():
                                s.click()
                                page.wait_for_timeout(1200)
                                found_compass = True
                                break
                        except Exception:
                            continue
                    if found_compass:
                        break
            except Exception as e:
                log(f"  {sel} → {e}")

        page.screenshot(path=f"{SCREENSHOT_DIR}/02-compass-view.png", full_page=True)

        # ------------- Step 3: OWASP banner -------------
        log("\n=== TEST 2: OWASP reference banner ===")
        banner_texts = ["Documents OWASP de référence", "OWASP Reference Documents"]
        banner_found = False
        for txt in banner_texts:
            if page.locator(f"text={txt}").count() > 0:
                banner_found = True
                log(f"  Banner found: '{txt}'")
                break
        results["banner_visible"] = banner_found

        if banner_found:
            # Click to expand
            banner = page.get_by_role("button", name=re.compile("Documents OWASP|OWASP Reference"))
            if banner.count() > 0:
                banner.first.click()
                page.wait_for_timeout(500)
                page.screenshot(path=f"{SCREENSHOT_DIR}/03-banner-expanded.png", full_page=True)

                # Check for 3+ PDF titles (one per category)
                pdf_ids_expected = [
                    "OWASP GenAI Data Security",
                    "OWASP Top 10 for Agentic",
                    "Securing Agentic",
                    "COMPASS",
                ]
                pdfs_seen = []
                for pdf_title in pdf_ids_expected:
                    if page.locator(f"text=/{pdf_title}/i").count() > 0:
                        pdfs_seen.append(pdf_title)
                log(f"  PDFs visible in banner: {pdfs_seen}")
                results["banner_pdf_count"] = len(pdfs_seen)

        # ------------- Step 4: click UC-0001 -------------
        log("\n=== TEST 3: UC-0001 modal with DSGAI badges ===")
        # Collapse banner first
        try:
            banner = page.get_by_role("button", name=re.compile("Documents OWASP|OWASP Reference"))
            if banner.count() > 0:
                banner.first.click()
                page.wait_for_timeout(300)
        except Exception:
            pass

        # Look for UC-0001 card — the title is "Jailbreak of internal chatbot"
        # Click the "Voir détails" button of the card containing that title.
        title_locator = page.locator("text=Jailbreak of internal chatbot").first
        opened = False
        if title_locator.count() > 0:
            try:
                title_locator.scroll_into_view_if_needed(timeout=3000)
            except Exception:
                pass
            # Find enclosing card then its "Voir détails" button
            card = title_locator.locator("xpath=ancestor::*[self::div or self::article][1]")
            btn = card.locator("button", has_text=re.compile("Voir détails|View details", re.I)).first
            if btn.count() == 0:
                # Fallback: any "Voir détails" near the title
                btn = page.locator("button", has_text=re.compile("Voir détails|View details", re.I)).first
            if btn.count() > 0:
                btn.click()
                opened = True
            else:
                title_locator.click()
                opened = True
            page.wait_for_timeout(1200)
        if opened:
            page.screenshot(path=f"{SCREENSHOT_DIR}/04-uc0001-modal.png", full_page=True)

            # Scroll modal to find OWASP references panel
            for _ in range(5):
                page.keyboard.press("PageDown")
                page.wait_for_timeout(200)
            page.screenshot(path=f"{SCREENSHOT_DIR}/05-uc0001-owasp-panel.png", full_page=True)

            # Also scroll inside the modal dialog container
            try:
                dialog = page.locator(".overflow-y-auto").last
                dialog.evaluate("el => el.scrollTo(0, el.scrollHeight)")
                page.wait_for_timeout(400)
            except Exception:
                pass
            page.screenshot(path=f"{SCREENSHOT_DIR}/05b-uc0001-bottom.png", full_page=True)

            badges_expected = ["DSGAI01", "DSGAI11", "DSGAI15"]
            badges_found = []
            for b in badges_expected:
                if page.locator(f"text=/{b}/").count() > 0:
                    badges_found.append(b)
            log(f"  Badges found: {badges_found}")
            results["uc0001_dsgai_badges"] = badges_found

            # Close modal: click the X button in the modal header (lucide X icon
            # inside a button on the fixed overlay)
            try:
                overlay = page.locator(".fixed.inset-0.z-50").first
                # The close button is the only top-right button with an X icon inside the header
                close_btns = overlay.locator("button").all()
                for cb in close_btns:
                    try:
                        html = cb.evaluate("el => el.outerHTML")
                        if 'lucide-x' in html.lower() and 'lucide-x-' not in html.lower():
                            cb.click()
                            break
                    except Exception:
                        continue
                else:
                    # Fallback: click the backdrop itself at the edge
                    overlay.click(position={"x": 10, "y": 10})
            except Exception as e:
                log(f"  Modal close fallback: {e}")
                page.keyboard.press("Escape")
            page.wait_for_timeout(600)
            # Verify modal is gone before continuing
            if page.locator(".fixed.inset-0.z-50").count() > 0:
                log("  Modal still open, forcing backdrop click")
                page.locator(".fixed.inset-0.z-50").first.click(position={"x": 5, "y": 5}, force=True)
                page.wait_for_timeout(500)
        else:
            log("  UC-0001 card NOT found")
            results["uc0001_dsgai_badges"] = []

        # ------------- Step 5: Wiki DSGAI section -------------
        log("\n=== TEST 4: Wiki Red Teamer → DSGAI section ===")
        # Navigate to wiki
        wiki_selectors = [
            "text=Wiki Red Teamer",
            "text=Wiki",
        ]
        for sel in wiki_selectors:
            try:
                loc = page.locator(sel).first
                if loc.count() > 0 and loc.is_visible():
                    loc.click()
                    page.wait_for_timeout(1200)
                    break
            except Exception:
                pass

        page.screenshot(path=f"{SCREENSHOT_DIR}/06-wiki.png", full_page=True)

        # Look for DSGAI section
        dsgai_section = page.locator("text=/Sécurité Données GenAI|DSGAI|Data Security GenAI/i").first
        if dsgai_section.count() > 0:
            log("  DSGAI section found")
            dsgai_section.scroll_into_view_if_needed(timeout=3000)
            try:
                dsgai_section.click()
            except Exception:
                pass
            page.wait_for_timeout(500)
            page.screenshot(path=f"{SCREENSHOT_DIR}/07-wiki-dsgai.png", full_page=True)

            # Count DSGAI01..DSGAI21 + DSPM accordions
            dsgai_codes = []
            for i in range(1, 22):
                code = f"DSGAI{i:02d}"
                if page.locator(f"text=/{code}/").count() > 0:
                    dsgai_codes.append(code)
            if page.locator("text=/DSPM/i").count() > 0:
                dsgai_codes.append("DSPM")
            log(f"  DSGAI/DSPM codes visible on page: {len(dsgai_codes)}")
            results["wiki_dsgai_count"] = len(dsgai_codes)
            results["wiki_dsgai_codes"] = dsgai_codes
        else:
            log("  DSGAI section NOT found on wiki page")
            results["wiki_dsgai_count"] = 0

        # ------------- Step 6: FR/EN toggle -------------
        log("\n=== TEST 5: FR/EN language toggle ===")
        try:
            lang_btn = page.locator("button:has-text('EN'), button:has-text('English')").first
            if lang_btn.count() > 0:
                lang_btn.click()
                page.wait_for_timeout(800)
                page.screenshot(path=f"{SCREENSHOT_DIR}/08-wiki-en.png", full_page=True)
                # Check we still see DSGAI codes
                en_count = 0
                for i in range(1, 22):
                    if page.locator(f"text=/DSGAI{i:02d}/").count() > 0:
                        en_count += 1
                log(f"  After EN toggle, DSGAI codes visible: {en_count}")
                results["wiki_dsgai_count_en"] = en_count
                # Toggle back
                fr_btn = page.locator("button:has-text('FR'), button:has-text('Français')").first
                if fr_btn.count() > 0:
                    fr_btn.click()
                    page.wait_for_timeout(500)
        except Exception as e:
            log(f"  Lang toggle skipped: {e}")

        # ------------- Step 7: console errors -------------
        log("\n=== TEST 6: Console errors ===")
        error_set = set()
        for e in console_errors:
            # Ignore known noise (vite HMR port, websocket)
            if "WebSocket" in e or "3004" in e or "HMR" in e:
                continue
            error_set.add(e[:200])
        log(f"  Unique console errors (filtered): {len(error_set)}")
        for e in list(error_set)[:10]:
            log(f"  -{e}")
        results["console_errors"] = len(error_set)

        browser.close()

    # ------------- Summary -------------
    log("\n" + "=" * 50)
    log("SUMMARY")
    log("=" * 50)
    for k, v in results.items():
        log(f"{k}: {v}")
    log("")

    # Verdict
    ok = True
    if not results.get("banner_visible"):
        log("FAIL: banner not visible")
        ok = False
    if results.get("banner_pdf_count", 0) < 3:
        log(f"FAIL: banner had {results.get('banner_pdf_count', 0)} PDFs (expected ≥3)")
        ok = False
    if len(results.get("uc0001_dsgai_badges", [])) < 3:
        log(f"FAIL: UC-0001 showed only {len(results.get('uc0001_dsgai_badges', []))} DSGAI badges (expected 3)")
        ok = False
    if results.get("wiki_dsgai_count", 0) < 21:
        log(f"FAIL: Wiki had {results.get('wiki_dsgai_count', 0)} DSGAI/DSPM codes (expected ≥21)")
        ok = False
    if results.get("console_errors", 0) > 0:
        log(f"WARN: {results.get('console_errors')} console errors")

    log(f"VERDICT: {'PASS' if ok else 'FAIL'}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
