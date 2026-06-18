# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tmp-playwright-tests\login.spec.cjs >> login local con visor de contrasena
- Location: tmp-playwright-tests\login.spec.cjs:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('CAMPAMENTOS DIOSES')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('CAMPAMENTOS DIOSES')

```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test('login local con visor de contrasena', async ({ page }) => {
  4  |   await page.goto('http://127.0.0.1:4180/SOPORTE/login');
> 5  |   await expect(page.getByText('CAMPAMENTOS DIOSES')).toBeVisible();
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  6  |   await page.getByLabel('Contrasena').fill('CD2026');
  7  |   await page.getByRole('button', { name: /mostrar contrasena/i }).click();
  8  |   await expect(page.getByLabel('Contrasena')).toHaveAttribute('type', 'text');
  9  |   await page.getByRole('button', { name: /iniciar sesion/i }).click();
  10 |   await page.waitForURL('**/SOPORTE/admin', { timeout: 10000 });
  11 |   const token = await page.evaluate(() => localStorage.getItem('accessToken'));
  12 |   expect(token).toBeTruthy();
  13 | });
  14 | 
```