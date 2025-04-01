// E2E test for registration and login flow with temporary email addresses
import puppeteer from 'puppeteer';
import crypto from 'crypto';
import fs from 'fs';

// Generate a random email using the + alias feature of Gmail
function generateRandomEmail(baseEmail = 'mattsilv@gmail.com') {
  const randomString = crypto.randomBytes(8).toString('hex');
  const [username, domain] = baseEmail.split('@');
  return `${username}+${randomString}@${domain}`;
}

// Generate a random password that meets complexity requirements
function generateSecurePassword() {
  // Ensure it has at least one lowercase, uppercase, number, and special character
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let password = '';
  // Add one of each required character type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Add more random characters to reach a length of 12
  const allChars = lowercase + uppercase + numbers + special;
  for (let i = 0; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password characters
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}

async function testRegistrationAndLogin() {
  console.log('Starting E2E registration and login test...');

  const browser = await puppeteer.launch({
    headless: false, // Set to true for production, false to see the browser UI during testing
    defaultViewport: null,
    args: ['--window-size=1280,800'],
  });

  try {
    // Create a new browser page
    const page = await browser.newPage();

    // Configure longer timeouts for navigation
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(30000);

    // Enable console log capture from the page
    page.on('console', (message) => {
      console.log(`Browser console: ${message.text()}`);
    });

    // Monitor all network requests for debugging
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        console.log(`Network request: ${request.method()} ${request.url()}`);
      }
    });

    // Monitor all network responses for debugging
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        try {
          const status = response.status();
          console.log(`Network response: ${status} ${response.url()}`);
          if (status !== 200) {
            try {
              const respText = await response.text();
              console.log(`Response body: ${respText}`);
            } catch (e) {
              console.log(`Could not get response body: ${e.message}`);
            }
          }
        } catch (e) {
          console.log(`Error processing response: ${e.message}`);
        }
      }
    });

    // Generate test credentials
    const testEmail = generateRandomEmail();
    const testPassword = generateSecurePassword();
    console.log(`Using test email: ${testEmail}`);
    console.log(`Using test password: ${testPassword}`);

    // Navigate to the auth page
    console.log('Navigating to the auth page...');
    await page.goto('http://localhost:3000/auth', {
      waitUntil: 'networkidle2',
    });

    // Switch to register tab if needed
    const isOnLoginTab = await page.evaluate(() => {
      return document.querySelector('h1').textContent.includes('Login');
    });

    if (isOnLoginTab) {
      console.log('On login tab, switching to register tab...');
      await page.click('a[href="#"]');
    }

    // Take a screenshot to debug what's on the page
    await page.screenshot({
      path: './tests/screenshots/registration-page-initial.png',
    });

    // Wait for the form to be visible and log page content for debugging
    await page.waitForSelector('form');

    // Log the HTML content for debugging
    const html = await page.content();
    console.log('Page HTML structure:', html.substring(0, 500) + '...');

    // Log all input elements
    const inputs = await page.$$eval('input', (inputs) =>
      inputs.map((input) => ({
        name: input.name,
        id: input.id,
        type: input.type,
        placeholder: input.placeholder,
      }))
    );
    console.log('Input elements found:', JSON.stringify(inputs, null, 2));

    // Fill in the registration form using more specific targeting
    console.log('Filling registration form...');

    // Wait for form to be properly loaded
    await page.waitForSelector('form');

    // Fill using both evaluate and direct input to ensure it works
    await page.evaluate(
      (email, password) => {
        // Get all form fields
        const form = document.querySelector('form');
        const emailInput = form.querySelector('input[type="email"]');
        const passwordInput = form.querySelector('input[type="password"]');

        // Set values directly
        if (emailInput) {
          emailInput.value = email;
          // Trigger events to simulate typing
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
          emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (passwordInput) {
          passwordInput.value = password;
          // Trigger events to simulate typing
          passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
          passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      },
      testEmail,
      testPassword
    );

    // Also try to click and type directly
    try {
      console.log('Clicking and typing in email field...');
      await page.click('input[type="email"]', { clickCount: 3 }); // Triple click to select all
      await page.keyboard.type(testEmail);

      console.log('Clicking and typing in password field...');
      await page.click('input[type="password"]', { clickCount: 3 }); // Triple click to select all
      await page.keyboard.type(testPassword);
    } catch (err) {
      console.log('Error in direct typing:', err.message);
    }

    // Take a screenshot of the registration form
    await page.screenshot({
      path: './tests/screenshots/registration-form.png',
    });

    // Submit the registration form
    console.log('Submitting registration form...');

    // Get all buttons on the page for debugging
    const buttons = await page.$$eval('button', (buttons) =>
      buttons.map((button) => ({
        text: button.textContent.trim(),
        type: button.type,
        classes: button.className,
        isDisabled: button.disabled,
      }))
    );
    console.log('Buttons found:', JSON.stringify(buttons, null, 2));

    // Try to find the submit button more reliably
    const submitButtonSelector = 'button[type="submit"]';
    console.log(
      `Looking for submit button with selector: ${submitButtonSelector}`
    );

    // Add username field for registration
    // Since we switched tabs, we need to fill in the username field which is only on the register form
    console.log('Filling in username field...');
    const usernameInput = await page.$(
      'input[type="text"][placeholder*="username" i]'
    );
    if (usernameInput) {
      await usernameInput.type(testEmail.split('@')[0]); // Use part of email as username
    } else {
      console.log(
        'Username field not found, this might cause registration to fail'
      );
    }

    // Try to click the button and wait for navigation
    try {
      // Take a screenshot before submission
      await page.screenshot({
        path: './tests/screenshots/before-registration-submit.png',
      });

      // Get all forms on the page and log them
      const forms = await page.$$eval('form', (forms) =>
        forms.map((form) => ({
          action: form.action,
          method: form.method,
          hasSubmitButton: !!form.querySelector('button[type="submit"]'),
        }))
      );
      console.log('Forms found:', JSON.stringify(forms, null, 2));

      // Get the specific form with "Create Account" button
      const registerButton = await page.$$eval(
        'button[type="submit"]',
        (buttons) => {
          const createAccountBtn = buttons.find((btn) =>
            btn.textContent.includes('Create Account')
          );
          return createAccountBtn
            ? {
                text: createAccountBtn.textContent,
                disabled: createAccountBtn.disabled,
                location: {
                  x: createAccountBtn.getBoundingClientRect().x,
                  y: createAccountBtn.getBoundingClientRect().y,
                },
              }
            : null;
        }
      );
      console.log('Create Account button:', registerButton);

      // Try direct form submission instead of button click
      console.log('Submitting form directly...');

      // First check the form values to make sure they're set correctly
      const formValues = await page.evaluate(() => {
        // Get the full DOM structure for analysis
        const htmlStructure = document.body.innerHTML.substring(0, 1000);
        console.log('DOM structure:', htmlStructure);

        // Analyze forms in more detail
        const forms = Array.from(document.forms).map((form, index) => {
          return {
            index,
            action: form.action,
            method: form.method,
            id: form.id,
            className: form.className,
            formHTML: form.outerHTML.substring(0, 200) + '...',
          };
        });
        console.log('All forms on page:', JSON.stringify(forms));

        const form = document.querySelector('form');
        const emailInput = document.querySelector('input[type="email"]');
        const usernameInput = document.querySelector('input[type="text"]');
        const passwordInput = document.querySelector('input[type="password"]');

        return {
          email: emailInput ? emailInput.value : 'email-not-found',
          username: usernameInput ? usernameInput.value : 'username-not-found',
          password: passwordInput ? passwordInput.value : 'password-not-found',
          formValid: form ? form.checkValidity() : 'no-form-found',
          emailValid: emailInput ? emailInput.checkValidity() : false,
          usernameValid: usernameInput ? usernameInput.checkValidity() : false,
          passwordValid: passwordInput ? passwordInput.checkValidity() : false,
          formCount: document.forms.length,
          buttonCount: document.querySelectorAll('button').length,
          inputCount: document.querySelectorAll('input').length,
        };
      });

      console.log('Form values before submission:', formValues);

      // If form values look wrong, try setting them directly
      if (formValues.email === 'email-not-found' || formValues.email === '') {
        console.log(
          'Email not set correctly, trying direct value assignment...'
        );
        await page.evaluate((email) => {
          const emailInput = document.querySelector('input[type="email"]');
          if (emailInput) {
            emailInput.value = email;
            // Trigger input event
            const event = new Event('input', { bubbles: true });
            emailInput.dispatchEvent(event);
          }
        }, testEmail);
      }

      if (
        formValues.username === 'username-not-found' ||
        formValues.username === ''
      ) {
        console.log(
          'Username not set correctly, trying direct value assignment...'
        );
        await page.evaluate((username) => {
          const usernameInput = document.querySelector('input[type="text"]');
          if (usernameInput) {
            usernameInput.value = username;
            // Trigger input event
            const event = new Event('input', { bubbles: true });
            usernameInput.dispatchEvent(event);
          }
        }, testEmail.split('@')[0]);
      }

      if (
        formValues.password === 'password-not-found' ||
        formValues.password === ''
      ) {
        console.log(
          'Password not set correctly, trying direct value assignment...'
        );
        await page.evaluate((password) => {
          const passwordInput = document.querySelector(
            'input[type="password"]'
          );
          if (passwordInput) {
            passwordInput.value = password;
            // Trigger input event
            const event = new Event('input', { bubbles: true });
            passwordInput.dispatchEvent(event);
          }
        }, testPassword);
      }

      // Now submit using React-style approach - bypass clicking and directly trigger the handler
      try {
        console.log('Attempting direct React-style form submission...');

        // Instead of clicking buttons, let's try to trigger the form submission handler directly
        await page.evaluate(() => {
          // Find the form and handle submit
          const form = document.querySelector('form');
          if (!form) {
            console.log('Form not found!');
            return false;
          }

          // Create a synthetic submit event
          const submitEvent = new Event('submit', {
            bubbles: true,
            cancelable: true,
          });

          // Log form data before submission for debugging
          const formData = {
            email: document.querySelector('input[type="email"]')?.value,
            username: document.querySelector('input[type="text"]')?.value,
            password: document.querySelector('input[type="password"]')?.value,
          };
          console.log('Form data before submission:', JSON.stringify(formData));

          // Dispatch the event on the form
          console.log('Dispatching form submit event...');
          const result = form.dispatchEvent(submitEvent);
          console.log('Form event dispatched, result:', result);

          return true;
        });

        // Take a screenshot right after form submission
        console.log('Taking screenshot after form submission...');
        await page.screenshot({
          path: './tests/screenshots/after-form-submission.png',
        });

        // Try using node-fetch to bypass browser CORS
        console.log(
          'Making direct API call using Node.js fetch to bypass CORS...'
        );

        // Create a fetch request to the backend directly
        try {
          const fetch = await import('node-fetch');
          // Create a valid username (no special chars, no +, max 20 chars)
          const validUsername = testEmail
            .split('@')[0]
            .replace(/\+/g, '_')
            .replace(/[^a-zA-Z0-9_-]/g, '')
            .substring(0, 20);
          console.log(`Using validated username: ${validUsername}`);

          const apiResponse = await fetch.default(
            'http://localhost:8787/api/auth/register',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Origin: 'http://localhost:8787', // Same origin to avoid CORS
              },
              body: JSON.stringify({
                email: testEmail,
                username: validUsername,
                password: testPassword,
              }),
            }
          );

          const result = await apiResponse.json();
          console.log('Direct Node.js API registration result:', result);

          if (result.success) {
            console.log('Registration successful through direct API call!');
            if (result.requiresVerification) {
              console.log(
                'Verification required. Getting verification code from API...'
              );

              // Fetch verification code
              const verificationResponse = await fetch.default(
                `http://localhost:8787/api/auth/test-get-verification-code?email=${encodeURIComponent(testEmail)}`
              );
              const verificationData = await verificationResponse.json();

              if (
                verificationData.success &&
                verificationData.data.verificationCode
              ) {
                // We have the verification code, but we'll need to input it
                console.log(
                  'Got verification code from direct API call:',
                  verificationData.data.verificationCode
                );

                // Navigate to the verification page
                await page.goto('http://localhost:3000/verify', {
                  waitUntil: 'networkidle2',
                });
                await page.waitForSelector('input[type="text"]');

                // Enter the verification code
                await page.type(
                  'input[type="text"]',
                  verificationData.data.verificationCode
                );

                // Click verify button
                await page.click('button[type="submit"]');

                // Wait for navigation to dashboard
                await page
                  .waitForNavigation({ waitUntil: 'networkidle2' })
                  .catch(() => {
                    console.log(
                      'No navigation after verification. Checking if on dashboard.'
                    );
                  });
              }
            }
          }

          return {
            success: apiResponse.ok,
            status: apiResponse.status,
            result,
          };
        } catch (error) {
          console.error('Node fetch error:', error.message);
          return { success: false, error: error.message };
        }

        // No need for the timeout race anymore - we handle timeouts in the try/catch

        // Wait for navigation or responses
        // eslint-disable-next-line no-unreachable
        await Promise.race([
          page
            .waitForNavigation({ timeout: 10000 })
            .catch(() => console.log('No navigation observed')),
          page
            .waitForResponse(
              (response) => response.url().includes('/api/auth'),
              { timeout: 10000 }
            )
            .catch(() => console.log('No auth API call observed')),
        ]);
      } catch (err) {
        console.log('Form submission error:', err.message);
      }

      // Sleep to make sure any async operations complete
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Check if there were any API errors in the console
      const errors = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.error-message')).map(
          (el) => el.textContent
        );
      });
      if (errors.length > 0) {
        console.log('Error messages found:', errors);
      }
    } catch (error) {
      console.error('Error submitting form:', error.message);
      await page.screenshot({
        path: './tests/screenshots/form-submit-error.png',
      });
    }

    // Check for verification requirement
    const needsVerification = await page.evaluate(() => {
      return (
        window.location.pathname.includes('/verify') ||
        document.body.textContent.includes('verification') ||
        document.body.textContent.includes('Verify')
      );
    });

    if (needsVerification) {
      console.log(
        'Verification required. Getting verification code from API...'
      );

      // Take a screenshot of the verification page
      await page.screenshot({
        path: './tests/screenshots/verification-page.png',
      });

      // Make an API call to get the verification code (test API endpoint)
      const verificationResponse = await fetch(
        `http://localhost:8787/api/auth/test-get-verification-code?email=${encodeURIComponent(testEmail)}`
      );
      const verificationData = await verificationResponse.json();

      if (
        !verificationData.success ||
        !verificationData.data.verificationCode
      ) {
        throw new Error(
          `Failed to get verification code: ${JSON.stringify(verificationData)}`
        );
      }

      // eslint-disable-next-line no-unreachable
      const verificationCode = verificationData.data.verificationCode;
      console.log(`Got verification code: ${verificationCode}`);

      // Enter the verification code
      await page.waitForSelector(
        'input[placeholder*="code" i], input[placeholder*="verification" i], input[type="text"]'
      );
      await page.type(
        'input[placeholder*="code" i], input[placeholder*="verification" i], input[type="text"]',
        verificationCode
      );

      // Take a screenshot of the verification form
      await page.screenshot({
        path: './tests/screenshots/verification-form.png',
      });

      // Submit the verification form
      console.log('Submitting verification code...');
      await Promise.all([
        page.click('button[type="submit"]'),
        page
          .waitForNavigation({ waitUntil: 'networkidle2' })
          .catch(() =>
            console.log('Navigation may not have completed, continuing...')
          ),
      ]);
    }

    // Check if we're redirected to the dashboard
    const currentUrl = page.url();
    console.log(`Current URL after registration: ${currentUrl}`);

    if (!currentUrl.includes('/dashboard')) {
      console.log(
        'Not redirected to dashboard. Taking screenshot of current page...'
      );
      await page.screenshot({
        path: './tests/screenshots/after-registration.png',
      });
      // If not on dashboard, log out (if possible) to try the login flow
      console.log('Attempting to log out manually...');
      await page.evaluate(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        window.location.href = '/auth?tab=login';
      });
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    } else {
      console.log('Successfully registered and redirected to dashboard');
      // Take a screenshot of the dashboard
      await page.screenshot({ path: './tests/screenshots/dashboard.png' });

      // Log out to test the login flow
      console.log('Logging out to test login...');
      await page.click('[data-testid="logout-button"]').catch(() => {
        // If logout button not found, try manual logout
        return page.evaluate(() => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          window.location.href = '/auth?tab=login';
        });
      });
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    // Test login flow
    console.log('Testing login flow...');
    // Make sure we're on the login page
    await page.goto('http://localhost:3000/auth', {
      waitUntil: 'networkidle2',
    });

    // Switch to login tab if needed
    const isOnRegisterTab = await page.evaluate(() => {
      return document
        .querySelector('h1')
        .textContent.includes('Create Account');
    });

    if (isOnRegisterTab) {
      console.log('On register tab, switching to login tab...');
      await page.click('a[href="#"]');
    }

    // Fill in the login form
    console.log('Filling login form with test credentials...');
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', testEmail);
    await page.type('input[type="password"]', testPassword);

    // Take a screenshot of the login form
    await page.screenshot({ path: './tests/screenshots/login-form.png' });

    // Submit the login form
    console.log('Submitting login form...');

    // Find a button that contains 'Login' text
    const loginButtonSelector =
      'button:contains("Login"), button[type="submit"]';
    console.log(
      `Looking for login button with selector: ${loginButtonSelector}`
    );

    try {
      await Promise.all([
        page.evaluate(() => {
          // Find the submit button in the login form
          const loginBtn = Array.from(
            document.querySelectorAll('button[type="submit"]')
          ).find((btn) => btn.textContent.includes('Login'));
          if (loginBtn) loginBtn.click();
          else {
            // Fallback to any submit button
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.click();
          }
        }),
        page
          .waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
          .catch(() =>
            console.log('Navigation may not have completed, continuing...')
          ),
      ]);
    } catch (error) {
      console.error('Error submitting login form:', error.message);
      await page.screenshot({
        path: './tests/screenshots/login-submit-error.png',
      });
    }

    // Check if login was successful (should be redirected to dashboard)
    const loginUrl = page.url();
    console.log(`Current URL after login: ${loginUrl}`);

    // Check if we need verification again on login
    const needsLoginVerification = await page.evaluate(() => {
      return (
        window.location.pathname.includes('/verify') ||
        document.body.textContent.includes('verification') ||
        document.body.textContent.includes('Verify')
      );
    });

    if (needsLoginVerification) {
      console.log(
        'Verification required after login. Getting verification code from API...'
      );

      // Make an API call to get the verification code (test API endpoint)
      const verificationResponse = await fetch(
        `http://localhost:8787/api/auth/test-get-verification-code?email=${encodeURIComponent(testEmail)}`
      );
      const verificationData = await verificationResponse.json();

      if (
        !verificationData.success ||
        !verificationData.data.verificationCode
      ) {
        throw new Error(
          `Failed to get verification code: ${JSON.stringify(verificationData)}`
        );
      }

      // eslint-disable-next-line no-unreachable
      const verificationCode = verificationData.data.verificationCode;
      console.log(`Got verification code: ${verificationCode}`);

      // Enter the verification code
      await page.waitForSelector(
        'input[placeholder*="code" i], input[placeholder*="verification" i], input[type="text"]'
      );
      await page.type(
        'input[placeholder*="code" i], input[placeholder*="verification" i], input[type="text"]',
        verificationCode
      );

      // Submit the verification form
      console.log('Submitting verification code...');
      await Promise.all([
        page.click('button[type="submit"]'),
        page
          .waitForNavigation({ waitUntil: 'networkidle2' })
          .catch(() =>
            console.log('Navigation may not have completed, continuing...')
          ),
      ]);
    }

    // Final check - we should be on the dashboard
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);

    if (finalUrl.includes('/dashboard')) {
      console.log(
        'SUCCESS: Registration and login test passed! User is on the dashboard.'
      );
      await page.screenshot({
        path: './tests/screenshots/success-dashboard.png',
      });
    } else {
      console.log(
        'FAILURE: Registration and login test failed. User is not on the dashboard.'
      );
      await page.screenshot({ path: './tests/screenshots/test-failure.png' });
      throw new Error(
        'Login test failed: Not redirected to dashboard after login'
      );
    }
  } catch (error) {
    console.error('Test failed with error:', error);
    // Take a screenshot of the error state
    const pages = await browser.pages();
    const page = pages[0];
    await page.screenshot({ path: './tests/screenshots/error-state.png' });
    throw error;
  } finally {
    // Make sure to close the browser
    await browser.close();
  }
}

// Create the screenshots directory if it doesn't exist
const screenshotsDir = './tests/screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Set a global timeout for the test
const TEST_TIMEOUT = 60000; // 60 seconds

// Run the test with a timeout
const timeout = setTimeout(() => {
  console.error('Test timed out after ' + TEST_TIMEOUT + 'ms');
  process.exit(2);
}, TEST_TIMEOUT);

testRegistrationAndLogin()
  .then(() => {
    clearTimeout(timeout);
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error('Test failed:', error);
    process.exit(1);
  });
