## Adminz Mobile + AWS Integration Plan

### Goal
Enable the React PWA to be installed on smartphones (“Add to Home Screen”) and synchronize install metadata with the AWS/FastAPI backend for personalization, push notifications, and automation triggers.

### Deliverables
1. **PWA Shell**
   - `manifest.json` describing the app, icons, and theme colors.
   - `sw.js` service worker that caches static assets for offline use.
   - Service worker registration inside `src/main.jsx`.

2. **AWS Modules (frontend)**
   - `src/modules/aws/mobileInstall.js` — helper to notify the FastAPI backend when the PWA is installed.
   - `src/modules/aws/notifications.js` — helper for push subscription flows (Pinpoint / SNS).

3. **Backend endpoints (FastAPI)**
   - `POST /mobile/installations`: store install payload in DynamoDB (fields: deviceId, platform, userId, installedAt, locale).
   - `POST /mobile/subscriptions`: accept push tokens and forward to Pinpoint/SNS topic.
   - `POST /mobile/subscriptions/test`: trigger a smoke-test push notification.

4. **AWS Infrastructure**
   - DynamoDB table: `adminz-mobile-installs`.
   - SNS topic or Pinpoint application for mobile messaging.
   - IAM role for Lambda/FastAPI service to publish notifications.

5. **Future Enhancements**
   - Capture `beforeinstallprompt` events to display a custom CTA before the browser prompt.
   - Store install events per Cognito user to sync preferences across devices.
   - Use EventBridge to trigger follow-up automations when a device installs the PWA.

### Implementation Steps
1. Frontend PWA setup (done in this commit).
2. Surface “Install app” CTA, capturing install status via `registerMobileInstall`.
3. Implement FastAPI endpoints, connect to AWS resources.
4. Create Amplify/CloudFront deployment pipeline to serve the PWA under HTTPS (required for service workers).
5. Add monitoring (CloudWatch logs, Pinpoint analytics) for install and push metrics.

This document should be updated as the AWS backend pieces land.*** End Patch

