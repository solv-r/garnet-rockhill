Unzip this INTO your project folder (the one containing package.json) and choose "Replace" when asked.

NEW files (3): a placeholder picture and two small source files
  public/placeholders/manifesto.svg
  src/app/homes/FeatureHero.tsx
  src/components/Emphasis.tsx

REPLACED files (15):
  CHANGELOG.md
  docs/ADMIN_GUIDE.md
  docs/PLACEHOLDER_PHOTOS.md
  src/app/(corp)/about/page.tsx
  src/app/(corp)/layout.tsx
  src/app/(corp)/page.tsx
  src/app/(corp)/projects/page.tsx
  src/app/(corp)/services/page.tsx
  src/app/homes/page.tsx
  src/components/Icons.tsx
  src/lib/corporate-content.ts
  src/lib/siteContent.ts
  src/styles/globals.css
  tests/e2e/admin_e2e_2.py
  tests/integration/content.int.test.ts

The two files under tests/ are developer tests and are optional; the rest are needed.
No npm install and no database change are needed.
Then: stop npm run dev, delete the .next folder, run npm run dev, and hard-refresh the browser (Ctrl+Shift+R).
Text you may have already edited in Admin > Site content is kept; the new default wording appears only where you have not changed it.
