import asyncio
from playwright.async_api import async_playwright
import sys

async def trace_login():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Capture console messages
        def on_console(msg):
            print(f"[{msg.type}] {msg.text}")
        
        page.on("console", on_console)
        
        print("Navigating to account page...")
        await page.goto("https://app.muachung.co/account")
        
        print("Clicking login button...")
        try:
            # Wait for button to be visible
            button = page.locator("button:has-text('Zalo')")
            await button.wait_for(state="visible", timeout=5000)
            await button.click()
            print("Button clicked. Waiting 3 seconds for redirect or errors...")
            await page.wait_for_timeout(3000)
            print(f"Current URL after click: {page.url}")
        except Exception as e:
            print(f"Failed to click button: {e}")
            
        await browser.close()

asyncio.run(trace_login())
