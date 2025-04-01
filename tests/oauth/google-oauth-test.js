// Google OAuth Test Script
import puppeteer from 'puppeteer';

async function testGoogleLogin() {
  console.log('Starting Google OAuth test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1280,800']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set up console log capturing
    page.on('console', msg => console.log('Browser log:', msg.text()));
    
    // Set a short navigation timeout
    page.setDefaultNavigationTimeout(10000);
    page.setDefaultTimeout(10000);
    
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3001/auth', {timeout: 5000})
      .catch(e => console.log('Navigation timeout, but continuing:', e.message));
    
    // Try to find the Google login button using different selectors
    console.log('Looking for Google login button...');
    
    // Get all buttons with their text content
    const buttons = await page.$$eval('button', buttons => 
      buttons.map(b => ({
        text: b.textContent?.trim() || '',
        hasGoogleSvg: b.querySelector('svg') !== null
      }))
    );
    
    console.log('Found buttons:', JSON.stringify(buttons));
    
    // Various selectors to try for the Google login button
    const selectors = [
      'button:has-text("Continue with Google")',
      'button:has-text("Google")',
      'button svg[viewBox="0 0 24 24"]',
      '.auth-container button[type="button"]',
      'form button[type="button"]'
    ];
    
    let buttonFound = false;
    let buttonSelector = '';
    
    for (const selector of selectors) {
      console.log(`Trying selector: ${selector}`);
      const exists = await page.$(selector)
        .then(button => !!button)
        .catch(() => false);
      
      if (exists) {
        buttonFound = true;
        buttonSelector = selector;
        console.log(`Button found with selector: ${selector}`);
        break;
      }
    }
    
    if (!buttonFound) {
      console.log('Google login button not found. Taking screenshot of current page...');
      await page.screenshot({ path: 'page-no-button.png' });
      console.log('Current URL:', page.url());
      console.log('Page content snippet:');
      const content = await page.content();
      console.log(content.substring(0, 500) + '...');
      throw new Error('Google login button not found');
    }
    
    console.log('Page loaded. Taking screenshot before clicking Google login button...');
    await page.screenshot({ path: 'before-google-login.png' });
    
    // Find the correct Google button based on text content
    console.log('Trying to find the specific Google button by text content...');
    
    // Look specifically for the button with "Continue with Google" text
    const googleButtons = await page.$$eval('button', buttons => 
      buttons.filter(b => b.textContent?.trim().includes('Continue with Google'))
        .map((b, i) => i)  // Return indices of matching buttons
    );
    
    if (googleButtons.length > 0) {
      console.log(`Found ${googleButtons.length} buttons with "Continue with Google" text`);
      const buttonIndex = googleButtons[0]; // Use the first match
      
      // Now get all buttons and click the one at the right index
      const allButtons = await page.$$('button');
      console.log(`Clicking button at index ${buttonIndex} out of ${allButtons.length} buttons`);
      await allButtons[buttonIndex].click();
    } else {
      console.log('Could not find button with "Continue with Google" text');
      // Fallback to the previously found selector if any
      if (buttonSelector) {
        console.log(`Falling back to selector: ${buttonSelector}`);
        await page.click(buttonSelector);
      } else {
        throw new Error('No suitable button found to click');
      }
    }
    
    // Wait briefly to see what happens
    console.log('Waiting to see response...');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'after-click-google-login.png' });
    
    // Check current URL after click
    const currentUrl = page.url();
    console.log('Current URL after click:', currentUrl);
    
    // Check network requests
    console.log('Checking network requests...');
    const googleAuthRequests = await page.evaluate(() => {
      return performance.getEntries()
        .filter(entry => entry.name.includes('/auth/google'))
        .map(entry => ({
          url: entry.name,
          type: entry.initiatorType,
          duration: Math.round(entry.duration)
        }));
    });
    
    console.log('Google auth requests:', JSON.stringify(googleAuthRequests, null, 2));
    
    // Check page console errors
    console.log('Taking final screenshot...');
    await page.screenshot({ path: 'final-state.png' });
    
    console.log('Test completed. Check the screenshots for visual results.');
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

// Run the test
testGoogleLogin();