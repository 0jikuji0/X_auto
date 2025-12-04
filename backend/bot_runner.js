require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const LOGIN_URL = 'https://x.com/i/flow/login';
const POST_URL = 'https://x.com/compose/tweet';
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const POSTS_FILE = path.join(__dirname, 'posts.json');

// Anti-bot Utilities
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = (min, max) => delay(Math.floor(Math.random() * (max - min + 1) + min));

// Local Database Helpers
function getScheduledPosts() {
    try {
        if (!fs.existsSync(POSTS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(POSTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading posts.json:', error);
        return [];
    }
}

function updatePostStatus(postId, status, error = null) {
    try {
        const posts = getScheduledPosts();
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            posts[postIndex].status = status;
            posts[postIndex].updatedAt = new Date().toISOString();
            if (error) {
                posts[postIndex].error = error;
            }
            fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
            console.log(`Updated post ${postId} status to ${status}`);
        }
    } catch (error) {
        console.error('Error updating posts.json:', error);
    }
}

async function runBot() {
    console.log('Starting X Bot Runner (Local Mode)...');

    // 2. Initialize Puppeteer
    const browser = await puppeteer.launch({
        headless: false, // Set to true for production/headless mode
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();

    // Set User Agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        // 3. Login Flow
        console.log('Navigating to login...');
        await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });
        await randomDelay(2000, 4000);

        // Check if already logged in (cookies) - simplified for this version to just login
        // Enter Username
        try {
            const usernameInput = await page.waitForSelector('input[autocomplete="username"]', { timeout: 10000 });
            await usernameInput.type(process.env.X_USERNAME, { delay: 100 });
            await page.keyboard.press('Enter');
            await randomDelay(2000, 3000);

            // Check for "Unusual activity" or password
            // Enter Password
            const passwordInput = await page.waitForSelector('input[name="password"]', { timeout: 10000 });
            await passwordInput.type(process.env.X_PASSWORD, { delay: 100 });
            await page.keyboard.press('Enter');
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            console.log('Logged in successfully.');
        } catch (e) {
            console.log('Login step skipped or failed (might be already logged in or different flow):', e.message);
        }

        // 4. Main Loop
        while (true) {
            console.log(`Checking for scheduled posts at ${new Date().toISOString()}...`);

            const posts = getScheduledPosts();
            const now = new Date().toISOString();

            // Find first scheduled post that is due
            const task = posts.find(p => p.status === 'scheduled' && p.scheduleTime <= now);

            if (!task) {
                console.log('No posts to schedule.');
            } else {
                console.log(`Found task ${task.id}: "${task.content}"`);

                try {
                    // Execute Post
                    await page.goto(POST_URL, { waitUntil: 'networkidle2' });
                    await randomDelay(3000, 5000);

                    // Type content
                    const editorSelector = 'div[data-testid="tweetTextarea_0"]';
                    await page.waitForSelector(editorSelector);
                    await page.click(editorSelector);
                    await page.type(editorSelector, task.content, { delay: 50 });
                    await randomDelay(1000, 2000);

                    // Click Tweet button
                    const tweetButtonSelector = 'div[data-testid="tweetButton"]';
                    await page.waitForSelector(tweetButtonSelector);
                    await page.click(tweetButtonSelector);

                    // Wait for confirmation
                    await randomDelay(3000, 5000);

                    console.log('Post executed.');

                    // Update Local DB
                    updatePostStatus(task.id, 'posted');

                } catch (postError) {
                    console.error(`Failed to post task ${task.id}:`, postError);
                    updatePostStatus(task.id, 'failed', postError.message);
                }
            }

            // Wait for next cycle
            console.log(`Waiting ${CHECK_INTERVAL / 1000} seconds...`);
            await delay(CHECK_INTERVAL);
        }

    } catch (error) {
        console.error('Fatal Bot Error:', error);
    } finally {
        // await browser.close();
    }
}

runBot();
