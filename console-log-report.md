# Console Statement Analysis Report

## Summary

- Total console statements found: 197
- Statements to remove: 55
- Statements to replace: 12
- Statements to keep: 130

## Files containing console statements

### /src/frontend/context/AuthContext.jsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
18 | `console.error('Failed to parse stored user', e);` | Keep  | Already using appropriate console.error
58 | `console.error('Failed to validate token:', err);` | Keep  | Already using appropriate console.error
77 | `console.log(` | Remove  | Debug statement not needed in production
89 | `console.log('AuthContext: Login response status:', response.status);` | Remove  | Debug statement not needed in production
94 | `console.log('AuthContext: Login response data:', errorData);` | Replace with `console.error('AuthContext: Login response data:', errorData)` | Convert to error - contains error information
111 | `console.error('AuthContext: Login error response:', errorData);` | Keep  | Already using appropriate console.error
118 | `console.error('AuthContext: Login error response:', errorData);` | Keep  | Already using appropriate console.error
123 | `console.log('AuthContext: Login success, user data:', data.user);` | Replace with `console.info('AuthContext: Login success, user data:', data.user)` | Convert to info - contains initialization or success information
133 | `console.error('AuthContext: Login error:', err);` | Keep  | Already using appropriate console.error
143 | `console.log(` | Remove  | Debug statement not needed in production
147 | `console.log('AuthContext: Registration payload:', {` | Remove  | Debug statement not needed in production
161 | `console.log(` | Remove  | Debug statement not needed in production
170 | `console.error('AuthContext: Registration error response:', errorData);` | Keep  | Already using appropriate console.error
175 | `console.log('AuthContext: Registration success, user data:', data.user);` | Replace with `console.info('AuthContext: Registration success, user data:', data.user)` | Convert to info - contains initialization or success information
211 | `console.error('AuthContext: Registration error:', err);` | Keep  | Already using appropriate console.error
229 | `console.log('AuthContext: Sending profile update request');` | Remove  | Debug statement not needed in production
242 | `console.error('AuthContext: Profile update error response:', errorData);` | Keep  | Already using appropriate console.error
265 | `console.error('AuthContext: Profile update error:', err);` | Keep  | Already using appropriate console.error
275 | `console.log('AuthContext: Sending account deletion request');` | Remove  | Debug statement not needed in production
286 | `console.error(` | Keep  | Already using appropriate console.error
297 | `console.error('AuthContext: Account deletion error:', err);` | Keep  | Already using appropriate console.error
307 | `console.log('AuthContext: Sending email verification request');` | Remove  | Debug statement not needed in production
319 | `console.error('AuthContext: Verification error response:', errorData);` | Keep  | Already using appropriate console.error
324 | `console.log('AuthContext: Verification success, user data:', data.user);` | Replace with `console.info('AuthContext: Verification success, user data:', data.user)` | Convert to info - contains initialization or success information
339 | `console.error('AuthContext: Email verification error:', err);` | Keep  | Already using appropriate console.error
349 | `console.log('AuthContext: Resending verification code');` | Remove  | Debug statement not needed in production
361 | `console.error('AuthContext: Resend verification error:', errorData);` | Keep  | Already using appropriate console.error
379 | `console.error('AuthContext: Resend verification error:', err);` | Keep  | Already using appropriate console.error

### /src/frontend/context/AuthContext.tsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
69 | `console.error('Failed to parse stored user', e);` | Keep  | Already using appropriate console.error
110 | `console.error('Failed to validate token:', err);` | Keep  | Already using appropriate console.error
132 | `console.log(` | Remove  | Debug statement not needed in production
144 | `console.log('AuthContext: Login response status:', response.status);` | Remove  | Debug statement not needed in production
149 | `console.log('AuthContext: Login response data:', errorData);` | Replace with `console.error('AuthContext: Login response data:', errorData)` | Convert to error - contains error information
166 | `console.error('AuthContext: Login error response:', errorData);` | Keep  | Already using appropriate console.error
173 | `console.error('AuthContext: Login error response:', errorData);` | Keep  | Already using appropriate console.error
178 | `console.log('AuthContext: Login success, user data:', data.user);` | Replace with `console.info('AuthContext: Login success, user data:', data.user)` | Convert to info - contains initialization or success information
188 | `console.error('AuthContext: Login error:', err);` | Keep  | Already using appropriate console.error
203 | `console.log(` | Remove  | Debug statement not needed in production
207 | `console.log('AuthContext: Registration payload:', {` | Remove  | Debug statement not needed in production
221 | `console.log(` | Remove  | Debug statement not needed in production
230 | `console.error('AuthContext: Registration error response:', errorData);` | Keep  | Already using appropriate console.error
235 | `console.log('AuthContext: Registration success, user data:', data.user);` | Replace with `console.info('AuthContext: Registration success, user data:', data.user)` | Convert to info - contains initialization or success information
271 | `console.error('AuthContext: Registration error:', err);` | Keep  | Already using appropriate console.error
290 | `console.log('AuthContext: Sending profile update request');` | Remove  | Debug statement not needed in production
303 | `console.error('AuthContext: Profile update error response:', errorData);` | Keep  | Already using appropriate console.error
326 | `console.error('AuthContext: Profile update error:', err);` | Keep  | Already using appropriate console.error
337 | `console.log('AuthContext: Sending account deletion request');` | Remove  | Debug statement not needed in production
348 | `console.error(` | Keep  | Already using appropriate console.error
359 | `console.error('AuthContext: Account deletion error:', err);` | Keep  | Already using appropriate console.error
373 | `console.log('AuthContext: Sending email verification request');` | Remove  | Debug statement not needed in production
385 | `console.error('AuthContext: Verification error response:', errorData);` | Keep  | Already using appropriate console.error
390 | `console.log('AuthContext: Verification success, user data:', data.user);` | Replace with `console.info('AuthContext: Verification success, user data:', data.user)` | Convert to info - contains initialization or success information
405 | `console.error('AuthContext: Email verification error:', err);` | Keep  | Already using appropriate console.error
418 | `console.log('AuthContext: Resending verification code');` | Remove  | Debug statement not needed in production
430 | `console.error('AuthContext: Resend verification error:', errorData);` | Keep  | Already using appropriate console.error
448 | `console.error('AuthContext: Resend verification error:', err);` | Keep  | Already using appropriate console.error

### /src/backend/api/auth.js

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
31 | `console.log(`Found ${usersToDelete.length} users to permanently delete`);` | Remove  | Debug statement not needed in production
51 | `console.log(`Permanently deleted user ${user.id}`);` | Remove  | Debug statement not needed in production
56 | `console.error('Error in scheduled user deletion:', error);` | Keep  | Already using appropriate console.error
64 | `console.log('Auth API request:', request.method, path);` | Remove  | Debug statement not needed in production
65 | `console.log('Auth headers:', Object.fromEntries(request.headers.entries()));` | Remove  | Debug statement not needed in production
74 | `console.log('Direct deletion test for user ID:', userId);` | Remove  | Debug statement not needed in production
109 | `console.log('User marked for deletion:', userId);` | Remove  | Debug statement not needed in production
125 | `console.error('Error in test deletion:', error);` | Keep  | Already using appropriate console.error
240 | `console.error('Rate limiting error:', error);` | Keep  | Already using appropriate console.error
292 | `console.error('Rate limiting update error:', error);` | Keep  | Already using appropriate console.error
347 | `console.error(` | Keep  | Already using appropriate console.error
390 | `console.error(` | Keep  | Already using appropriate console.error
427 | `console.error('Rate limiting reset error:', error);` | Keep  | Already using appropriate console.error
577 | `console.log(` | Remove  | Debug statement not needed in production
581 | `console.error('Failed to send verification email:', emailError);` | Keep  | Already using appropriate console.error
667 | `console.log('Processing deletion request for user:', request.user);` | Remove  | Debug statement not needed in production
668 | `console.log('User ID:', request.user?.id);` | Remove  | Debug statement not needed in production
714 | `console.error('Error in user deletion:', error);` | Keep  | Already using appropriate console.error
735 | `console.log('Direct test delete for user ID:', userId);` | Remove  | Debug statement not needed in production
780 | `console.error('Error in test user deletion:', error);` | Keep  | Already using appropriate console.error
894 | `console.error('Error in user restoration:', error);` | Keep  | Already using appropriate console.error
996 | `console.error('Email verification error:', error);` | Keep  | Already using appropriate console.error
1084 | `console.error('Resend verification error:', error);` | Keep  | Already using appropriate console.error
1148 | `console.error('Test get verification code error:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/test-helpers.js

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
7 | `console.log('Testing localStorage functionality...');` | Keep  | Test file
50 | `console.log('Test data stored in localStorage');` | Keep  | Test file
57 | `console.log('User retrieved:', storedUser);` | Keep  | Test file
58 | `console.log('Prompts retrieved:', storedPrompts);` | Keep  | Test file
59 | `console.log('Responses retrieved:', storedResponses);` | Keep  | Test file
66 | `console.error('localStorage test failed:', error);` | Keep  | Test file
78 | `console.log('Testing API client utilities...');` | Keep  | Test file
86 | `console.log(`Mock fetch: ${url}`, options);` | Keep  | Test file
121 | `console.log('Fetch API mocked successfully');` | Keep  | Test file
125 | `console.log(` | Keep  | Test file
134 | `console.error('API client test failed:', error);` | Keep  | Test file
149 | `console.log('Testing UI components with mock data...');` | Keep  | Test file
153 | `console.log('Would render and test components here');` | Keep  | Test file
160 | `console.error('UI component test failed:', error);` | Keep  | Test file
172 | `console.log('Testing CSS/Styling functionality...');` | Keep  | Test file
190 | `console.log('Tailwind styles applied:', hasBackgroundColor && hasPadding);` | Keep  | Test file
197 | `console.error('CSS/Styling test failed:', error);` | Keep  | Test file
209 | `console.log('=== STARTING FRONTEND TESTS ===');` | Keep  | Test file
216 | `console.log('\n=== FRONTEND TEST RESULTS ===');` | Keep  | Test file
217 | `console.log(` | Keep  | Test file
221 | `console.log('API client tests:', apiResult.success ? 'PASSED' : 'FAILED');` | Keep  | Test file
222 | `console.log('UI component tests:', uiResult.success ? 'PASSED' : 'FAILED');` | Keep  | Test file
223 | `console.log(` | Keep  | Test file

### /src/frontend/pages/Auth.tsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
57 | `console.error('API check failed:', err);` | Keep  | Already using appropriate console.error
101 | `console.log('Auth form submission:', {` | Remove  | Debug statement not needed in production
110 | `console.log(`Making direct fetch to ${API_URL}/auth/${endpoint}`);` | Remove  | Debug statement not needed in production
124 | `console.log('Direct API response status:', response.status);` | Remove  | Debug statement not needed in production
128 | `console.error('Direct API error response:', errorData);` | Keep  | Already using appropriate console.error
135 | `console.log('Direct API success response:', data);` | Replace with `console.info('Direct API success response:', data)` | Convert to info - contains initialization or success information
142 | `console.log('Authentication successful, attempting data migration');` | Replace with `console.info('Authentication successful, attempting data migration')` | Convert to info - contains initialization or success information
145 | `console.log('Migration result:', result);` | Remove  | Debug statement not needed in production
152 | `console.error('Authentication error:', err);` | Keep  | Already using appropriate console.error
196 | `console.error('API test error:', err);` | Keep  | Already using appropriate console.error

### /src/backend/local-test.js

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
122 | `console.log(`${req.method} ${path}`);` | Keep  | Test file
244 | `console.error('Login error:', error);` | Keep  | Test file
358 | `console.error('Registration error:', error);` | Keep  | Test file
395 | `console.log(`Test deletion for user: ${userId}`);` | Keep  | Test file
401 | `console.log('User not found in registered users:', userId);` | Keep  | Test file
414 | `console.log(`User marked for deletion: ${userId}`);` | Keep  | Test file
437 | `console.log(`Local test backend running at http://localhost:${PORT}`);` | Keep  | Test file
438 | `console.log('Available test users:');` | Keep  | Test file
440 | `console.log(`- Email: ${user.email}, Password: ${user.password}`);` | Keep  | Test file

### /src/frontend/utils/migrateLegacyData.ts

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
70 | `console.error(`[MIGRATION] ${message}`);` | Keep  | Already using appropriate console.error
73 | `console.warn(`[MIGRATION] ${message}`);` | Keep  | Already using appropriate console.warn
76 | `console.log(`[MIGRATION] ✅ ${message}`);` | Remove  | Debug statement not needed in production
79 | `console.log(`[MIGRATION] ${message}`);` | Remove  | Debug statement not needed in production
341 | `console.log('[MIGRATION] Clearing localStorage data');` | Remove  | Debug statement not needed in production
351 | `console.log(` | Remove  | Debug statement not needed in production
358 | `console.log(` | Remove  | Debug statement not needed in production
367 | `console.log('[MIGRATION] Cleared original localStorage data');` | Remove  | Debug statement not needed in production
398 | `console.error('Failed to parse migration logs:', error);` | Keep  | Already using appropriate console.error

### /src/backend/utils/seedTestData.js

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
12 | `console.log('Seeding test data...');` | Remove  | Debug statement not needed in production
20 | `console.log('Test data already exists. Skipping seed operation.');` | Remove  | Debug statement not needed in production
47 | `console.log('Created test users');` | Remove  | Debug statement not needed in production
95 | `console.log('CONTENT_STORE not available. Skipping content storage.');` | Remove  | Debug statement not needed in production
99 | `console.log('Created test prompts');` | Remove  | Debug statement not needed in production
171 | `console.log(` | Remove  | Debug statement not needed in production
177 | `console.log('Created test responses');` | Remove  | Debug statement not needed in production
192 | `console.error('Failed to seed test data:', error);` | Keep  | Already using appropriate console.error

### /src/backend/utils/storage.js

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
34 | `console.error(` | Keep  | Already using appropriate console.error
37 | `console.error(`Failed to store ${prefix} content with key: ${key}`);` | Keep  | Already using appropriate console.error
70 | `console.error(` | Keep  | Already using appropriate console.error
73 | `console.error(`Failed to retrieve content with key: ${key}`);` | Keep  | Already using appropriate console.error
100 | `console.error(` | Keep  | Already using appropriate console.error
103 | `console.error(`Failed to delete content with key: ${key}`);` | Keep  | Already using appropriate console.error
107 | `console.error(`Failed to delete content from R2: ${error.message}`);` | Keep  | Already using appropriate console.error

### /src/backend/index.ts

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
73 | `console.log(`Request: ${request.method} ${path}`);` | Remove  | Debug statement not needed in production
105 | `console.error(` | Keep  | Already using appropriate console.error
157 | `console.error('Authentication error for general API route:', error);` | Keep  | Already using appropriate console.error
204 | `console.error('Error fetching static asset:', assetError);` | Keep  | Already using appropriate console.error
225 | `console.warn(`404 Not Found for path: ${path}`);` | Keep  | Already using appropriate console.warn
229 | `console.error('Unhandled error in fetch handler:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/utils/dataMigration.js

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
55 | `console.log(`Migrated prompt: ${prompt.title || 'Untitled'}`);` | Remove  | Debug statement not needed in production
57 | `console.error(` | Keep  | Already using appropriate console.error
86 | `console.log(` | Remove  | Debug statement not needed in production
90 | `console.error('Failed to migrate response:', error);` | Keep  | Already using appropriate console.error
114 | `console.error('Migration failed:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/utils/dataMigration.ts

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
121 | `console.log(`Migrated prompt: ${prompt.title || 'Untitled'}`);` | Remove  | Debug statement not needed in production
123 | `console.error(` | Keep  | Already using appropriate console.error
152 | `console.log(` | Remove  | Debug statement not needed in production
156 | `console.error('Failed to migrate response:', error);` | Keep  | Already using appropriate console.error
180 | `console.error('Migration failed:', error);` | Keep  | Already using appropriate console.error

### /src/backend/utils/emailService.js

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
22 | `console.error('RESEND_API_KEY is not set in the environment');` | Keep  | Already using appropriate console.error
42 | `console.error('Failed to send email:', errorData);` | Keep  | Already using appropriate console.error
49 | `console.log(`Email sent successfully to ${to}, ID: ${data.id}`);` | Replace with `console.info(`Email sent successfully to ${to}, ID: ${data.id}`)` | Convert to info - contains initialization or success information
52 | `console.error('Email service error:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/pages/PromptDetail.jsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
71 | `console.error('Error loading prompt:', error);` | Keep  | Already using appropriate console.error
91 | `console.error('Error updating prompt:', error);` | Keep  | Already using appropriate console.error
102 | `console.error('Error deleting prompt:', error);` | Keep  | Already using appropriate console.error
156 | `console.error('Error updating prompt:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/components/auth/RegisterForm.jsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
66 | `console.log('Attempting registration for:', formData.email);` | Remove  | Debug statement not needed in production
97 | `console.error('API connection error:', apiError);` | Keep  | Already using appropriate console.error
116 | `console.error('Registration error:', error);` | Keep  | Already using appropriate console.error

### /src/backend/utils/errorHandler.js

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
80 | `console.error('Server error:', message, details);` | Keep  | Already using appropriate console.error
108 | `console.error('Unhandled error:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/components/auth/LoginForm.jsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
61 | `console.log('Attempting login for:', formData.email);` | Remove  | Debug statement not needed in production
74 | `console.error('Login error:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/components/auth/LoginForm.tsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
77 | `console.log('Attempting login for:', formData.email);` | Remove  | Debug statement not needed in production
90 | `console.error('Login error:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/components/auth/VerificationForm.jsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
95 | `console.error('Verification error:', error);` | Keep  | Already using appropriate console.error
132 | `console.error('Resend code error:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/components/prompt/PromptCard.jsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
37 | `console.log('Duplicate prompt:', id);` | Remove  | Debug statement not needed in production
43 | `console.log('Delete prompt:', id);` | Remove  | Debug statement not needed in production

### /src/frontend/pages/Settings.jsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
79 | `console.error('Error updating profile:', error);` | Keep  | Already using appropriate console.error
127 | `console.error('Error deleting account:', error);` | Keep  | Already using appropriate console.error

### /src/backend/api/prompts.js

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
92 | `console.error('Error handling prompt request:', error);` | Keep  | Already using appropriate console.error

### /src/backend/middleware/cors.js

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
66 | `console.log(`Warning: Using wildcard CORS for unknown origin: ${origin}`);` | Replace with `console.warn(`Warning: Using wildcard CORS for unknown origin: ${origin}`)` | Convert to warn - contains warning information

### /src/backend/utils/auth.ts

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
134 | `console.error('Token verification error:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/components/response/ResponseCard.jsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
28 | `console.error('Error deleting response:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/components/response/ResponseForm.jsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
126 | `console.error('Error creating response:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/components/ui/CopyButton.jsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
16 | `console.error('Failed to copy content:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/components/ui/MigrationBanner.jsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
35 | `console.error('Migration failed:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/components/ui/MigrationBanner.tsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
82 | `console.error('Migration failed:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/pages/PromptCreate.jsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
71 | `console.error('Error creating prompt:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/pages/SharedPrompt.jsx

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
62 | `console.error('Error loading shared prompt:', error);` | Keep  | Already using appropriate console.error

### /src/frontend/utils/auth.js

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
15 | `console.error('Error parsing user JSON:', e);` | Keep  | Already using appropriate console.error

### /src/frontend/utils/auth.ts

Line | Statement | Recommendation | Reason
-----|-----------|----------------|-------
27 | `console.error('Error parsing user JSON:', e);` | Keep  | Already using appropriate console.error

