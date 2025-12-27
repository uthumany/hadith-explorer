// Playwright test file for Hadith Explorer
const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Simple static file server
function createServer(port) {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

            const extname = path.extname(filePath);
            const contentTypes = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpg',
                '.svg': 'image/svg+xml'
            };

            const contentType = contentTypes[extname] || 'text/plain';

            fs.readFile(filePath, (error, content) => {
                if (error) {
                    res.writeHead(404);
                    res.end('File not found');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });
        });

        server.listen(port, () => {
            resolve(server);
        });
    });
}

async function runTests() {
    const PORT = 3456;
    const BASE_URL = `http://localhost:${PORT}`;

    console.log('Starting Hadith Explorer tests...\n');

    // Start the server
    const server = await createServer(PORT);
    console.log(`Server started on port ${PORT}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    let passed = 0;
    let failed = 0;

    // Collect console messages
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push({ type: msg.type(), text: msg.text() });
    });

    try {
        // Test 1: Homepage loads correctly
        console.log('Test 1: Homepage loads correctly...');
        await page.goto(BASE_URL);
        await page.waitForSelector('.books-grid', { timeout: 10000 });
        const booksCount = await page.locator('.book-card').count();

        if (booksCount > 0) {
            console.log(`✓ PASSED: Found ${booksCount} hadith books`);
            passed++;
        } else {
            console.log('✗ FAILED: No books found on homepage');
            failed++;
        }

        // Test 2: Book cards are interactive
        console.log('\nTest 2: Book cards are interactive...');
        const firstBook = page.locator('.book-card').first();
        const isVisible = await firstBook.isVisible();

        if (isVisible) {
            console.log('✓ PASSED: Book cards are visible');
            passed++;
        } else {
            console.log('✗ FAILED: Book cards not visible');
            failed++;
        }

        // Test 3: Click on a book to load chapters
        console.log('\nTest 3: Click on Sahih Bukhari...');
        await firstBook.click();
        await page.waitForSelector('.chapters-list', { timeout: 10000 });
        const chaptersVisible = await page.locator('.chapter-item').first().isVisible();

        if (chaptersVisible) {
            console.log('✓ PASSED: Chapters loaded after clicking book');
            passed++;
        } else {
            console.log('✗ FAILED: Chapters not loaded');
            failed++;
        }

        // Test 4: Navigate back to home
        console.log('\nTest 4: Navigate back to home...');
        await page.click('.breadcrumb-item:first-child');
        await page.waitForSelector('.books-grid', { timeout: 10000 });
        const booksVisible = await page.locator('.books-grid').isVisible();

        if (booksVisible) {
            console.log('✓ PASSED: Navigation back to home works');
            passed++;
        } else {
            console.log('✗ FAILED: Navigation failed');
            failed++;
        }

        // Test 5: Search functionality exists
        console.log('\nTest 5: Search input exists...');
        const searchInput = await page.locator('#searchInput').isVisible();

        if (searchInput) {
            console.log('✓ PASSED: Search input is visible');
            passed++;
        } else {
            console.log('✗ FAILED: Search input not found');
            failed++;
        }

        // Test 6: Theme toggle exists
        console.log('\nTest 6: Theme toggle exists...');
        const themeToggle = await page.locator('#themeToggle').isVisible();

        if (themeToggle) {
            console.log('✓ PASSED: Theme toggle is visible');
            passed++;
        } else {
            console.log('✗ FAILED: Theme toggle not found');
            failed++;
        }

        // Test 7: Click theme toggle
        console.log('\nTest 7: Theme toggle functionality...');
        await page.click('#themeToggle');
        const theme = await page.getAttribute('html', 'data-theme');

        if (theme === 'dark') {
            console.log('✓ PASSED: Theme toggle switches to dark mode');
            passed++;
        } else {
            console.log('✗ FAILED: Theme toggle did not work');
            failed++;
        }

        // Test 8: Responsive design - mobile view
        console.log('\nTest 8: Mobile responsiveness...');
        await page.setViewportSize({ width: 375, height: 667 });
        const mobileSearchVisible = await page.locator('.search-container').isVisible();

        if (mobileSearchVisible) {
            console.log('✓ PASSED: Layout adapts to mobile viewport');
            passed++;
        } else {
            console.log('✗ FAILED: Mobile layout issue');
            failed++;
        }

        // Test 9: Hadith card display
        console.log('\nTest 9: Click chapter to view hadiths...');
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.click('.breadcrumb-item:first-child');
        await page.waitForSelector('.books-grid', { timeout: 5000 });
        await page.click('.book-card:first-child');
        await page.waitForSelector('.chapter-item', { timeout: 10000 });
        await page.click('.chapter-item:first-child');
        await page.waitForSelector('.hadith-card', { timeout: 10000 });
        const hadithCards = await page.locator('.hadith-card').count();

        if (hadithCards > 0) {
            console.log(`✓ PASSED: Found ${hadithCards} hadith cards`);
            passed++;
        } else {
            console.log('✗ FAILED: No hadith cards displayed');
            failed++;
        }

        // Test 10: Check for Arabic text rendering
        console.log('\nTest 10: Arabic text rendering...');
        const arabicText = await page.locator('.hadith-arabic').first().textContent();

        if (arabicText && arabicText.includes('عَنْ')) {
            console.log('✓ PASSED: Arabic text is rendering correctly');
            passed++;
        } else {
            console.log('✗ FAILED: Arabic text not found or incorrect');
            failed++;
        }

    } catch (error) {
        console.log(`\n✗ TEST ERROR: ${error.message}`);
        failed++;
    }

    // Print console logs for debugging
    if (consoleLogs.length > 0) {
        console.log('\n--- Console Logs ---');
        const errors = consoleLogs.filter(log => log.type === 'error');
        if (errors.length > 0) {
            console.log('Errors found:');
            errors.forEach(e => console.log(`  - ${e.text}`));
        }
    }

    // Close browser and server
    await browser.close();
    server.close();

    // Summary
    console.log('\n========================================');
    console.log(`Tests Complete: ${passed + failed} total`);
    console.log(`✓ Passed: ${passed}`);
    console.log(`✗ Failed: ${failed}`);
    console.log('========================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
