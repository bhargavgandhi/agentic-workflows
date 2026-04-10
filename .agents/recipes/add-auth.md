---
name: add-auth
description: Add authentication to your app with route protection
parameters:
  - name: auth_provider
    type: select
    options: [firebase, supabase, clerk, custom]
    default: firebase
    description: Which authentication provider should we use?
  - name: protected_routes
    type: text
    description: Which routes should be protected? (comma-separated)
    default: "/dashboard, /settings, /profile"
  - name: login_page
    type: text
    description: Path for the login/sign-in page
    default: "/login"
skills_required:
  - firebase-setup
  - frontend-design
workflow: build_feature_agent
tags: [auth, security, firebase, supabase]
---

## Task: Add {{auth_provider}} Authentication

**Protected routes:** {{protected_routes}}
**Login page:** {{login_page}}

### What to build

1. Set up {{auth_provider}} authentication provider and configuration
2. Create an `AuthProvider` context component that wraps the app
3. Create a `ProtectedRoute` guard component that redirects unauthenticated users to `{{login_page}}`
4. Build a login/sign-in page at `{{login_page}}` with email+password and social login options
5. Add a logout button to the navigation
6. Protect these routes: `{{protected_routes}}`

### Standards to follow

- Follow the `firebase-setup` skill conventions for auth configuration
- Follow the `frontend-design` skill for all UI components
- Store the auth state in context — do NOT use local component state
- Handle loading states (show a spinner while auth initialises)
- Handle error states (invalid credentials, account not found)
- The login page must be accessible without authentication
