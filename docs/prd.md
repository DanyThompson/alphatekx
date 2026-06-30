# Requirements Document

## 1. Application Overview

**Application Name**: AlphaTekx Portal

**Description**: A production-ready infrastructure bridge at alphatekx.name.ng that deploys user code to real public URLs using Supabase Storage as the hosting backend. Users authenticate via Google OAuth, receive 20 free credits, provision unique subdomains, upload code via file drop or URL input, and deploy securely with automated security scanning and fixing. The platform includes a credit system with Paystack payment integration, custom domain connection capability, and three enterprise-grade modules: Protection for runtime security, Rules for compliance management, and History with version rollback capability.

**Tech Stack**: React + TypeScript + Tailwind CSS + Vite + shadcn/ui + Supabase (Auth, Storage, Edge Functions, Database)

## 2. Users and Usage Scenarios

**Target Users**:
- Developers needing quick secure deployments without DevOps knowledge
- Non-technical users wanting to move code online without server setup
- Teams requiring simple security auditing before going live
- Enterprise users needing runtime protection and compliance enforcement
- Organizations requiring audit trails and version rollback capabilities

**Core Usage Scenarios**:
- User visits landing page and signs in with Google OAuth
- System auto-creates user profile with 20 free credits on first sign-in
- User provisions unique subdomain on ingestion screen
- User uploads code via file drop or URL input
- System scans code for security issues with real-time progress narrative
- System automatically fixes detected problems
- System deploys files to Supabase Storage and consumes 1 credit
- System provides live Supabase Storage public URL
- User accesses deployed application via provided URL
- User connects custom domain and configures DNS
- User monitors runtime security threats and self-healing actions
- User defines and enforces compliance policies
- User reviews audit logs and performs version rollback
- User tops up credits via Paystack when balance is insufficient

## 3. Page Structure and Functional Description

### 3.1 Page Hierarchy

```
AlphaTekx Portal
├── Landing Page (/) — unauthenticated, redesigned
│   ├── Hero Section
│   ├── Trust Bar
│   ├── How It Works Section
│   ├── Features Grid Section
│   ├── Live Pipeline Visualization Section
│   ├── Security Showcase Section
│   ├── Speed Performance Section
│   ├── Testimonials Section
│   ├── Pricing Preview Section
│   ├── Final CTA Section
│   └── Footer
├── Login Page (/login) — Google OAuth
├── Ingestion Screen (/deploy) — authenticated
├── Guardian Deployment Pipeline (/pipeline) — authenticated
│   ├── Locking the Doors Step
│   ├── Checking for Safety Step
│   ├── Verifying Site Integrity Step
│   ├── Going Live Step
│   └── Success View
└── Post-Deployment Dashboard — authenticated
    ├── Protection Module
    │   ├── Real-Time Threat Feed
    │   └── Self-Healing Log
    ├── Rules Module
    │   ├── Policy Rule Builder
    │   └── Fix-It Reports
    └── History Module
        ├── Audit Log Table
        └── Version Rollback Interface
```

### 3.2 Landing Page (/) — Redesigned

**Overall Design Language**:
- Base background: #050915 (deep navy/black)
- Glassmorphism aesthetic: frosted glass cards with rgba(255,255,255,0.05) backgrounds, backdrop-blur-xl, subtle 1px borders rgba(255,255,255,0.1)
- Accent colors: electric blue (#58a6ff), cyber green (#7ee787), purple (#a5b4fc)
- Animated gradient orbs/blobs in background using CSS animations
- Smooth micro-animations on scroll and hover
- Typography: large bold headlines with gradient text effects
- Professional, cinematic, trustworthy visual tone
- NO emoji in UI elements

#### 3.2.1 Hero Section

**Visual Design**:
- Full viewport height section
- Animated gradient background with floating orbs (electric blue, purple, cyber green)
- Floating navigation bar at top with glassmorphism effect
- Navigation contains: AlphaTekx logo (left), navigation links (Features, Security, Pricing), Sign In button (right)
- Centered hero content with large gradient text headline
- Subheadline in muted white
- Two CTA buttons: primary and secondary
- Social proof numbers row below CTAs
- Subtle particle animation overlay

**Layout**:
- Floating nav bar: logo, nav links (Features, Security, Pricing), Sign In button
- Hero content centered:
  - Headline: \"Your code. Online. In 60 seconds.\" (gradient text: electric blue to purple)
  - Subheadline: \"The infrastructure bridge that takes your files from your machine to the live internet — secured, deployed, and protected automatically. No DevOps. No servers. Just results.\"
  - Primary CTA button: \"Get Started Free\" (electric blue accent, glow effect)
  - Secondary CTA button: \"Watch Demo\" (outlined glassmorphism style)
  - Social proof row: \"20,000+ deployments · 5,000+ developers · 99.9% uptime\"

**Functionality**:
- User views hero section on page load
- Animated gradient orbs move slowly in background
- User clicks \"Get Started Free\" button
- System navigates to /login
- User clicks \"Watch Demo\" button
- System smooth scrolls to Live Pipeline Visualization Section
- User clicks \"Sign In\" button in navigation
- System navigates to /login
- User clicks navigation links (Features, Security, Pricing)
- System smooth scrolls to corresponding section

#### 3.2.2 Trust Bar

**Visual Design**:
- Full-width section below hero
- Glassmorphism bar with subtle glow
- Displays trust indicators and security badges
- Horizontal scroll on mobile

**Layout**:
- Centered glassmorphism bar containing:
  - Label: \"Trusted by developers worldwide\"
  - Security badges: \"SOC 2 Compliant\", \"GDPR Ready\", \"ISO 27001\"
  - Trust indicators: \"Enterprise-grade security\", \"99.9% uptime SLA\"

**Functionality**:
- User views trust bar on scroll
- Badges display with fade-in animation

#### 3.2.3 How It Works Section

**Visual Design**:
- Dark background with subtle gradient
- Section headline with gradient text
- Three-step visual flow with animated icons
- Each step in glassmorphism card
- Connecting lines between steps with animated glow

**Layout**:
- Section headline: \"Deploy in three simple steps\"
- Three glassmorphism cards in horizontal row:
  - Step 1: \"Drop Your Code\" with folder icon
  - Step 2: \"Guardian Secures It\" with shield icon
  - Step 3: \"Go Live Instantly\" with rocket icon
- Each card contains: icon, step number, title, description
- Animated connecting lines between cards

**Functionality**:
- User scrolls to section
- Cards animate in with stagger effect
- Icons pulse with subtle glow on hover

#### 3.2.4 Features Grid Section

**Visual Design**:
- Dark background with animated gradient orbs
- Section headline with gradient text
- Grid of glassmorphism feature cards (3 columns, 2 rows = 6 cards)
- Each card has icon, title, description
- Hover effect: card lifts with glow

**Layout**:
- Section headline: \"Everything you need to deploy with confidence\"
- Six feature cards:
  - Card 1: \"Smart Ingestion\" — Drop files or paste URLs, we handle the rest
  - Card 2: \"Guardian Security\" — Automated scanning and fixing of vulnerabilities
  - Card 3: \"Sub-60s Deployment\" — From code to live URL in under 60 seconds
  - Card 4: \"Custom Domains\" — Connect your own domain with one click
  - Card 5: \"Runtime Protection\" — 24/7 threat monitoring and self-healing
  - Card 6: \"Version Rollback\" — Instant rollback to any previous version

**Functionality**:
- User scrolls to section
- Cards animate in with stagger effect
- User hovers over card
- Card lifts with glow effect and scale transform

#### 3.2.5 Live Pipeline Visualization Section

**Visual Design**:
- Full-width section with dark gradient background
- Section headline with gradient text
- Large glassmorphism card containing animated pipeline visualization
- Four pipeline steps displayed vertically with progress indicators
- Real-time animation showing deployment flow
- Glowing connections between steps

**Layout**:
- Section headline: \"Watch your deployment happen in real-time\"
- Large glassmorphism card with:
  - Pipeline header: \"Guardian Deployment Pipeline\"
  - Four vertical steps:
    - Step 1: \"Locking the Doors\" with shield icon
    - Step 2: \"Checking for Safety\" with shield icon
    - Step 3: \"Verifying Site Integrity\" with checkmark icon
    - Step 4: \"Going Live\" with rocket icon
  - Animated progress bars and status indicators
  - Live URL output at bottom

**Functionality**:
- User scrolls to section
- Pipeline animation plays automatically
- Steps complete sequentially with progress narratives
- Final step displays mock live URL
- Animation loops after completion

#### 3.2.6 Security Showcase Section

**Visual Design**:
- Dark background with cyber green accent glow
- Section headline with gradient text
- Two-column layout: left text, right visual
- Right side shows animated security scan visualization
- Glassmorphism cards for security features

**Layout**:
- Section headline: \"Security that works while you sleep\"
- Left column:
  - Subheadline: \"Guardian scans every line of code, fixes vulnerabilities automatically, and protects your deployment 24/7\"
  - Three glassmorphism cards:
    - Card 1: \"Automated Scanning\" — Detects exposed secrets and vulnerabilities
    - Card 2: \"Auto-Fix\" — Replaces hardcoded secrets with environment variables
    - Card 3: \"Runtime Protection\" — Blocks SQL injection, XSS, DDoS attacks
- Right column:
  - Animated visualization of security scan in progress
  - Mock code editor with highlighted vulnerabilities
  - Real-time fix animation

**Functionality**:
- User scrolls to section
- Security scan animation plays
- Vulnerabilities highlight in red
- Auto-fix animation shows replacement with green highlights

#### 3.2.7 Speed Performance Section

**Visual Design**:
- Dark background with electric blue accent glow
- Section headline with gradient text
- Large centered glassmorphism card
- Animated timer counting down from 60 to 0
- Performance metrics displayed in grid

**Layout**:
- Section headline: \"From code to live in under 60 seconds\"
- Large glassmorphism card with:
  - Animated timer: \"00:60\" counting down to \"00:00\"
  - Subtext: \"Average deployment time\"
  - Performance metrics grid:
    - Metric 1: \"99.9% uptime\"
    - Metric 2: \"< 100ms response time\"
    - Metric 3: \"Global CDN\"
    - Metric 4: \"Auto-scaling\"

**Functionality**:
- User scrolls to section
- Timer animation plays automatically
- Metrics fade in with stagger effect

#### 3.2.8 Testimonials Section

**Visual Design**:
- Dark background with subtle gradient
- Section headline with gradient text
- Three glassmorphism testimonial cards in horizontal row
- Each card has quote, author name, author role, author avatar placeholder

**Layout**:
- Section headline: \"Trusted by developers worldwide\"
- Three testimonial cards:
  - Card 1: Quote, Author: \"Sarah Chen\", Role: \"Senior Developer\"
  - Card 2: Quote, Author: \"Michael Rodriguez\", Role: \"CTO\"
  - Card 3: Quote, Author: \"Emily Watson\", Role: \"Product Manager\"

**Functionality**:
- User scrolls to section
- Cards animate in with stagger effect
- Cards have subtle hover glow effect

#### 3.2.9 Pricing Preview Section

**Visual Design**:
- Dark background with purple accent glow
- Section headline with gradient text
- Three glassmorphism pricing cards in horizontal row
- Each card has plan name, price, credit amount, feature list, CTA button
- Middle card (Pro) has highlighted border and \"Most Popular\" badge

**Layout**:
- Section headline: \"Simple, transparent pricing\"
- Three pricing cards:
  - Card 1: \"Starter\" — ₦500 = 10 credits
  - Card 2: \"Pro\" — ₦2000 = 50 credits (highlighted, \"Most Popular\" badge)
  - Card 3: \"Enterprise\" — ₦5000 = 150 credits
- Each card contains:
  - Plan name
  - Price in large text
  - Credit amount
  - Feature list (3-4 items)
  - \"Get Started\" button

**Functionality**:
- User scrolls to section
- Cards animate in with stagger effect
- User clicks \"Get Started\" button on any card
- System navigates to /login

#### 3.2.10 Final CTA Section

**Visual Design**:
- Full-width section with dramatic gradient background (electric blue to purple)
- Large centered glassmorphism card
- Bold headline with gradient text
- Subheadline
- Primary CTA button with glow effect
- Secondary text link

**Layout**:
- Large glassmorphism card centered:
  - Headline: \"Ready to deploy your next project?\"
  - Subheadline: \"Join 5,000+ developers who trust AlphaTekx for secure, instant deployments\"
  - Primary CTA button: \"Get Started Free\" (electric blue accent, large, glow effect)
  - Secondary text link: \"or watch a demo\"

**Functionality**:
- User scrolls to section
- Card animates in with scale effect
- User clicks \"Get Started Free\" button
- System navigates to /login
- User clicks \"or watch a demo\" link
- System smooth scrolls to Live Pipeline Visualization Section

#### 3.2.11 Footer

**Visual Design**:
- Dark background with subtle glassmorphism effect
- Four-column layout on desktop, stacked on mobile
- AlphaTekx logo and tagline
- Navigation links organized by category
- Social media icons
- Copyright text

**Layout**:
- Four columns:
  - Column 1: AlphaTekx logo, tagline \"The infrastructure bridge for modern developers\"
  - Column 2: \"Product\" links (Features, Security, Pricing, Documentation)
  - Column 3: \"Company\" links (About, Blog, Careers, Contact)
  - Column 4: \"Legal\" links (Terms, Privacy, Security)
- Bottom row: Social media icons (Twitter, GitHub, LinkedIn), Copyright text

**Functionality**:
- User clicks navigation links
- System navigates to corresponding page or section
- User clicks social media icons
- System opens social media profile in new tab

### 3.3 Login Page (/login)

**Visual Design**:
- Background: deep sapphire blue (#050d1a)
- Central glassmorphism card
- AlphaTekx logo at top of card
- Headline: \"Sign in to AlphaTekx\"
- Google sign-in button with Google logo

**Layout**:
- Centered card containing:
  - AlphaTekx logo
  - Headline
  - Google sign-in button
  - Footer text: \"By signing in, you agree to our Terms and Privacy Policy\"

**Functionality**:
- User clicks Google sign-in button
- System initiates Google OAuth flow via Supabase Auth with Google provider
- User completes Google authentication
- System receives OAuth callback
- System checks if user exists in profiles table
- If first sign-in:
  - System creates user record in profiles table with user_id (FK to auth.users), email, credit_balance (20), created_at
  - System logs transaction in transaction_history table: type (credit), amount (20), action_type (signup_bonus)
- System redirects to /deploy or intended page if stored

### 3.4 Ingestion Screen (/deploy)

**Auth Guard**: Requires authentication. Unauthenticated users redirected to /login with return URL stored.

**Visual Design**:
- Background: deep sapphire blue (#050d1a)
- Persistent top navigation bar with glassmorphism effect
- Navigation contains: AlphaTekx logo, user avatar, credit balance display, \"Top Up\" button, sign out option
- Headline: \"Drop your project. We handle the rest.\"
- Subheading: \"Already have code? Just drop it here — we'll secure it and put it online.\"
- Single large glassmorphism card centered on viewport
- Card contains subdomain input section and Drop Zone

**Layout**:
- Top navigation bar
- Headline and subheading
- Central glass card with:
  - Subdomain input section:
    - Label: \"Choose your web address\"
    - Input field with placeholder \"pick-your-name\"
    - Format hint: \"Your project will live at: [name].alphatekx.name.ng\"
    - Real-time availability indicator
  - Large Drop Zone area with dashed electric blue border
  - Main label: \"Drop your project here\"
  - Folder icon (folder with down-arrow)
  - Secondary label: \"or paste a URL below\"
  - URL input field with placeholder \"Paste a URL to deploy (GitHub repo, zip file, or website)\"
  - Primary button \"Secure & Deploy\" with electric blue accent

**Functionality**:
- System fetches user credit balance from profiles table on page load
- System displays credit balance in navigation bar
- User enters desired subdomain name into input field
- System validates subdomain format in real-time:
  - Lowercase letters only
  - Alphanumeric characters and hyphens allowed
  - Length: 3-30 characters
  - No consecutive hyphens
  - Cannot start or end with hyphen
- System checks subdomain availability in deployments table
- Availability indicator displays:
  - Green checkmark + \"Available\" if subdomain is free
  - Red cross + \"Taken, try another\" if subdomain exists
  - Yellow warning + format error message if validation fails
- User drags folder or files into Drop Zone or clicks to browse
- System accepts folder/file upload
- System displays folder name and file count
- Alternatively, user pastes URL into URL input field
- System validates URL format
- \"Secure & Deploy\" button disabled until subdomain is available and code is provided
- User clicks \"Secure & Deploy\" button
- System navigates to /pipeline with subdomain and code data

### 3.5 Guardian Deployment Pipeline (/pipeline)

**Auth Guard**: Requires authentication. Unauthenticated users redirected to /login.

**Visual Design**:
- Background: deep sapphire blue (#050d1a)
- Persistent top navigation bar with user avatar, credit balance, sign out option
- Vertical progress flow with glassmorphism cards
- Each step card displays: icon, plain English status text, progress indicator
- Icons: Shield (Locking the Doors, Checking for Safety), Checkmark (Verifying Site Integrity), Rocket (Going Live)
- Real-time progress narrative in muted blue-grey text
- Pipeline header during run: \"Securing & deploying your project…\"
- Pipeline header when done: \"Deployment Successful\"

**Layout**:
- Top navigation bar
- Vertical stack of progress cards:
  - Card 1: Locking the Doors Step
  - Card 2: Checking for Safety Step
  - Card 3: Verifying Site Integrity Step
  - Card 4: Going Live Step
  - Card 5: Success View (appears after completion)

#### 3.5.1 Locking the Doors Step

**Functionality**:
- System displays Shield icon with glassmorphism card
- Step title: \"Locking the Doors\"
- Progress narratives cycle through:
  - \"Locking the doors…\"
  - \"Setting up your private space…\"
  - \"Your address is reserved.\"
- System performs domain verification by checking subdomain availability in deployments table
- Done line displays: \"The doors are locked. Your address is ready.\"
- Card transitions to completed state with soft sage green accent
- System automatically proceeds to Checking for Safety Step

#### 3.5.2 Checking for Safety Step

**Functionality**:
- System displays Shield icon with glassmorphism card
- Step title: \"Checking for Safety\"
- Progress narratives cycle through:
  - \"Checking your files for safety…\"
  - \"Making sure nothing harmful is inside…\"
  - \"Almost done checking…\"
- System performs security scanning using regex pattern matching for:
  - AWS Access Key ID: AKIA[0-9A-Z]{16}
  - OpenAI API Key: sk-[a-zA-Z0-9]{48}
  - Stripe Live Key: sk_live_[0-9a-zA-Z]{24}
  - GitHub PAT: ghp_[a-zA-Z0-9]{36}
  - Private Keys: -----BEGIN RSA PRIVATE KEY-----
- System returns findings array with: file path, line number, issue type, suggested fix
- Done line displays: \"All clear — your files are safe.\"
- Card transitions to completed state with soft sage green accent
- System automatically proceeds to Verifying Site Integrity Step

#### 3.5.3 Verifying Site Integrity Step

**Functionality**:
- System displays Checkmark icon with glassmorphism card
- Step title: \"Verifying Site Integrity\"
- Progress narratives cycle through:
  - \"Verifying site integrity…\"
  - \"Applying finishing touches…\"
  - \"Making everything perfect…\"
- System automatically applies fixes for each finding:
  - Reads target file
  - Locates specific line number
  - Replaces exposed secret with environment variable reference (e.g., process.env.API_KEY)
  - Performs atomic save operation
- Done line displays: \"Site integrity verified. Everything looks great.\"
- Card transitions to completed state with soft sage green accent
- System automatically proceeds to Going Live Step

#### 3.5.4 Going Live Step

**Functionality**:
- System displays Rocket icon with glassmorphism card
- Step title: \"Going Live\"
- Progress narratives cycle through:
  - \"Going live now…\"
  - \"Putting your project on the internet…\"
  - \"Seconds away…\"
- System calls Edge Function create-site with payload: { subdomain, files, user_id }
- Edge Function create-site performs:
  - Calls Edge Function consume-credits with payload: { action_type: 'deploy' }
  - consume-credits validates JWT, checks credit_balance in profiles table
  - If balance insufficient: returns { success: false, message: \"Insufficient credits\" }
  - If balance sufficient: decrements credit_balance by 1, logs transaction in transaction_history, returns { success: true, balance: new_balance }
  - If URL deploy method: calls Edge Function fetch-and-store to fetch URL content
  - Uploads all files to Supabase Storage bucket sites at path sites/{subdomain}/{filename}
  - Identifies index.html or first HTML file as entry point
  - Creates deployment record in deployments table: user_id, subdomain, file_paths (jsonb array), live_url, status (active), created_at
  - Returns { success: true, live_url, balance }
- If consume-credits returns success: false:
  - System displays Top-Up Modal
  - Pipeline pauses until credits topped up
- If create-site succeeds:
  - System updates credit balance display in navigation
  - Live URL format: https://{SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/sites/{subdomain}/index.html
  - Done line displays: \"You're live!\"
  - Card transitions to completed state with soft sage green accent
  - Pipeline header updates to \"Deployment Successful\"
  - System displays Success View

#### 3.5.5 Success View

**Functionality**:
- System displays Checkmark icon with glassmorphism card
- Card shows soft sage green accent
- Headline: \"Deployment Successful\"
- Subtext: \"Your project is live and protected. Here is your link:\"
- Displays live URL in green-bordered box with label \"Deployment Successful: [URL]\"
- Live URL is the Supabase Storage public URL
- Provides buttons in order:
  1. \"Copy My Link\" button (primary, electric blue accent)
  2. \"Open My Site\" button (secondary, sage green tint, external link)
  3. \"Download Production Code\" button (tertiary, outlined)
  4. \"See My Dashboard\" button (full-width, gradient blue)
  5. \"Deploy another project\" text link (muted)
- User clicks \"Copy My Link\" button to copy URL to clipboard
- System displays brief confirmation message: \"Link copied\"
- User clicks \"Open My Site\" button to open live site in new tab
- User clicks \"Download Production Code\" button
- System triggers browser download of zip file using JSZip library containing:
  - All project files
  - README.md with local run instructions
  - .env.example stub
- User clicks \"See My Dashboard\" button to navigate to /dashboard
- User clicks \"Deploy another project\" link to return to /deploy

### 3.6 Top-Up Modal

**Visual Design**:
- Modal overlay with glassmorphism card
- Headline: \"Top Up Your Credits\"
- Subheading: \"Choose a plan to continue deploying\"
- Three plan cards with glassmorphism effect
- Each card shows: plan name, price, credit amount, \"Select\" button

**Layout**:
- Modal centered on viewport
- Headline and subheading at top
- Three plan cards in horizontal row:
  - Starter: ₦500 = 10 credits
  - Pro: ₦2000 = 50 credits
  - Enterprise: ₦5000 = 150 credits
- Each card has \"Select\" button with electric blue accent
- \"Cancel\" button at bottom

**Functionality**:
- Modal triggered when consume-credits returns success: false
- Modal also accessible via \"Top Up\" button in navigation bar
- User clicks \"Select\" button on desired plan
- System initializes Paystack Inline Checkout using PAYSTACK_PUBLIC_KEY
- Paystack payload: { email: user.email, amount: plan.price * 100, reference: generated_reference, metadata: { user_id, plan_name, credits } }
- User completes payment in Paystack inline popup
- Paystack sends webhook to Edge Function verify-payment
- Edge Function verify-payment:
  - Verifies Paystack webhook signature using PAYSTACK_SECRET_KEY
  - Looks up user by email or reference
  - Atomically increments credit_balance in profiles table by plan credits
  - Logs transaction in transaction_history: type (credit), amount (credits), action_type (top_up), reference
  - Returns { success: true, new_balance }
- System reloads credit balance from profiles table
- System updates credit balance display in navigation
- System closes Top-Up Modal
- If pipeline was paused: system resumes deployment

### 3.7 Post-Deployment Dashboard

**Auth Guard**: Requires authentication. Unauthenticated users redirected to /login.

**Visual Design**:
- Background: deep sapphire blue (#050d1a)
- Persistent top navigation bar with glassmorphism effect
- Navigation contains: AlphaTekx logo, Shield icon button, Policy icon button, History icon button, download icon button, user avatar, credit balance, \"Top Up\" button, sign out option
- Main content area displays selected module
- All cards use glassmorphism design with electric blue borders
- Dashboard headline: \"Your Project Dashboard\"

**Layout**:
- Top navigation bar
- Main content area below navigation

**Functionality**:
- User clicks Shield icon to view Protection module
- User clicks Policy icon to view Rules module
- User clicks History icon to view History module
- System displays selected module in main content area
- Navigation remains persistent across all modules
- User clicks download icon button
- System triggers browser download of zip file using JSZip library containing:
  - All project files from Supabase Storage
  - README.md with content: \"# [subdomain] — AlphaTekx Deployment

To run locally:
1. Open index.html in your browser
2. No server required for static sites

Deployed at: https://{SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/sites/{subdomain}/index.html\"
  - .env.example content: \"# Add your environment variables here
# Example:
# API_KEY=your_key_here\"
- User clicks \"Top Up\" button to open Top-Up Modal
- User clicks sign out option
- System signs out user via Supabase Auth
- System redirects to landing page

### 3.8 Protection Module

**Visual Design**:
- Page headline: \"Your Project is Protected\"
- Description: \"AlphaTekx watches your project 24/7 and blocks anything harmful — automatically.\"
- Two-column layout with glassmorphism cards
- Left column: Real-Time Threat Feed
- Right column: Self-Healing Log
- Each card has Shield icon and plain English headings

#### 3.8.1 Real-Time Threat Feed

**Functionality**:
- System displays live stream of detected attacks
- Each threat entry shows:
  - Timestamp
  - Attack type (SQL Injection, XSS Pattern, DDoS Pattern)
  - Source IP address
  - Target endpoint
  - Status badge (Blocked, Rate-Limited, Isolated)
- Entries update in real-time as attacks are detected
- System monitors deployed application for:
  - SQL injection patterns in request parameters
  - XSS patterns in user input
  - DDoS patterns based on request frequency
- Threat feed displays most recent 50 entries
- User can scroll to view older entries

#### 3.8.2 Self-Healing Log

**Functionality**:
- System displays automated response actions taken
- Each log entry shows:
  - Timestamp
  - Action type (Firewall Rule Created, Traffic Rate-Limited, Container Isolated)
  - Trigger reason
  - Action details in plain English
  - Status (Active, Completed)
- System automatically triggers self-healing responses:
  - Spin up temporary firewall rules when SQL injection detected
  - Rate-limit malicious traffic when DDoS pattern detected
  - Isolate compromised container when XSS pattern detected
- Log displays most recent 50 actions
- User can scroll to view older actions
- All actions occur without developer intervention

### 3.9 Rules Module

**Visual Design**:
- Page headline: \"Deployment Rules\"
- Description: \"Set simple rules for your project. We'll enforce them automatically.\"
- Two-section layout with glassmorphism cards
- Top section: Policy Rule Builder
- Bottom section: Fix-It Reports
- Policy icon and plain English headings

#### 3.9.1 Policy Rule Builder

**Functionality**:
- System displays four policy categories:
  - Security
  - Privacy
  - Access Control
  - Performance
- Each category contains toggle switches for specific rules
- Security rules:
  - \"Block all deployments with insecure dependencies\" (toggle on/off)
  - Plain English description below each rule
- Privacy rules:
  - \"Enforce privacy-compliant headers\" (toggle on/off)
  - Plain English description below each rule
- Access Control rules:
  - \"Require 2FA for all deployment changes\" (toggle on/off)
  - Plain English description below each rule
- Performance rules:
  - User can define custom performance thresholds (toggle on/off)
  - Plain English description below each rule
- User toggles rules on or off
- System saves policy configuration
- System applies policies to all future deployments
- Any build violating active policies is rejected before deployment

#### 3.9.2 Fix-It Reports

**Functionality**:
- System displays list of rejected deployments
- Each report entry shows:
  - Timestamp
  - Deployment attempt identifier
  - Violated policy rules
  - Plain English explanation of each violation
  - Suggested resolution steps
- User clicks on report entry to view full details
- System generates automated Fix-It Report for each rejection
- Report explains:
  - What policy was violated
  - Why it was violated
  - How to resolve the violation
- User can download report as text file

### 3.10 History Module

**Visual Design**:
- Page headline: \"What's Happened\"
- Description: \"A complete record of every change to your project.\"
- Two-section layout with glassmorphism cards
- Top section: Audit Log Table
- Bottom section: Version Rollback Interface
- History icon and plain English headings

#### 3.10.1 Audit Log Table

**Functionality**:
- System displays immutable, searchable audit log table
- Table columns:
  - Timestamp
  - Action Type (File Upload, URL Input, Security Scan, Auto-Fix, Deployment, Policy Change, Rollback, Credit Top-Up, Credit Consumption)
  - Actor (User, System)
  - Details (plain English description)
  - Status (Success, Failed, In Progress)
- System logs every action from file upload to final deployment
- Each entry includes: who performed action, what action was performed, when it occurred
- User can search audit log by keyword
- User can filter by action type, actor, status, date range
- Table displays most recent 100 entries
- User can scroll or paginate to view older entries
- Audit log is immutable and cannot be edited or deleted

#### 3.10.2 Version Rollback Interface

**Functionality**:
- System displays list of previous deployments from deployments table
- Each deployment entry shows:
  - Timestamp
  - Version identifier
  - Deployment status badge (Success, Failed)
  - \"Last Known Good\" badge on most recent successful deployment
  - \"Rollback\" button with electric blue accent
- User clicks \"Rollback\" button on desired version
- System displays rollback confirmation dialog
- Dialog shows:
  - Source version (current)
  - Target version (selected)
  - Diff summary (plain English description of changes)
  - \"Confirm Rollback\" button
  - \"Cancel\" button
- User clicks \"Confirm Rollback\" button
- System reverts entire site by:
  - Fetching file_paths from target deployment record
  - Copying files from sites/{subdomain}/ to current deployment path
  - Updating deployments table with rollback record
- System logs rollback action in audit trail
- System displays success message: \"Rollback completed\"
- User can view live site at subdomain URL to verify rollback

### 3.11 Custom Domain Connection

**Visual Design**:
- Section in dashboard with glassmorphism card
- Headline: \"Connect Your Domain\"
- Description: \"Use your own domain name for your deployed project\"
- Input field for custom domain
- DNS instructions panel
- Nginx config snippet panel
- Status indicator

**Layout**:
- Card containing:
  - Headline and description
  - Input field with placeholder \"myapp.com\"
  - \"Connect Domain\" button with electric blue accent
  - DNS instructions panel (appears after connection)
  - Nginx config snippet panel (appears after connection)
  - Status indicator: Pending DNS / Active

**Functionality**:
- User enters custom domain into input field
- User clicks \"Connect Domain\" button
- System calls Edge Function consume-credits with payload: { action_type: 'custom_domain' }
- consume-credits validates JWT, checks credit_balance
- If balance insufficient: displays Top-Up Modal
- If balance sufficient: decrements credit_balance by 1, logs transaction
- System stores custom domain in deployments.custom_domain column
- System displays DNS instructions:
  - \"Set a CNAME record: your-domain.com → {supabase-project-ref}.supabase.co\"
- System displays Nginx config snippet:
  - \"If you have a server at 15.197.212.204, add this to your Nginx config:\"
  - Code block with Nginx proxy configuration
- System displays status: Pending DNS
- System updates credit balance display
- When DNS propagates: status updates to Active

## 4. Business Rules and Logic

### 4.1 Authentication Rules

- Google OAuth via Supabase Auth with Google provider
- On first sign-in: system creates user record in profiles table with user_id (FK to auth.users), email, credit_balance (20), created_at
- System logs signup bonus transaction in transaction_history: type (credit), amount (20), action_type (signup_bonus)
- After authentication: redirect to /deploy or stored return URL
- Unauthenticated users accessing /deploy, /pipeline, /dashboard redirected to /login with return URL stored
- Session persisted via Supabase client
- User avatar and credit balance displayed in all authenticated screens
- Sign out option available in dashboard navigation

### 4.2 Credit System Rules

- profiles table: user_id (FK to auth.users), email, credit_balance (integer, default 20), created_at
- transaction_history table: id, user_id, type (credit/debit), amount, action_type, reference, created_at
- Edge Function consume-credits: POST, validates JWT, checks balance, decrements if sufficient
  - Payload: { action_type: 'deploy' | 'custom_domain' }
  - Deploy costs 1 credit
  - Custom domain connection costs 1 credit
  - Returns { success: boolean, balance: number, message?: string }
- Credit balance always fetched from profiles table, never stored in localStorage
- Credit balance displayed in navigation bar, refreshed after each action
- When consume-credits returns success: false, Top-Up Modal triggered

### 4.3 Payment Rules

- Paystack Inline Checkout using PAYSTACK_PUBLIC_KEY on frontend
- Three plans: Starter (₦500 = 10 credits), Pro (₦2000 = 50 credits), Enterprise (₦5000 = 150 credits)
- Paystack payload: { email, amount: price * 100, reference: generated_reference, metadata: { user_id, plan_name, credits } }
- Edge Function verify-payment: POST, also serves as Paystack webhook endpoint
  - Verifies Paystack webhook signature using PAYSTACK_SECRET_KEY
  - Looks up user by email or reference
  - Atomically increments credit_balance in profiles table
  - Logs transaction in transaction_history: type (credit), amount (credits), action_type (top_up), reference
  - Returns { success: true, new_balance }
- After successful payment: reload credit balance from profiles table
- Top-Up Modal accessible via \"Top Up\" button in navigation or when credits insufficient

### 4.4 Subdomain Provisioning Rules

- Subdomain format: [user-name].alphatekx.name.ng
- Subdomain name validation:
  - Lowercase letters only
  - Alphanumeric characters and hyphens allowed
  - Length: 3-30 characters
  - No consecutive hyphens
  - Cannot start or end with hyphen
- Real-time availability check performed on every keystroke (debounced)
- Subdomain must be unique across deployments table
- User cannot proceed until subdomain is confirmed available

### 4.5 Smart Ingestion Rules

- Two input methods: file/folder upload or URL input
- Drop Zone accepts folder structure with HTML/CSS/JS files
- URL input accepts GitHub repo URLs, zip file URLs, or website URLs
- User must provide code via one method before deploying
- Only one method can be used per deployment

### 4.6 Security Scanning Rules

- Scanning uses regex pattern matching to detect exposed secrets
- Supported patterns:
  - AWS Access Key ID: AKIA[0-9A-Z]{16}
  - OpenAI API Key: sk-[a-zA-Z0-9]{48}
  - Stripe Live Key: sk_live_[0-9a-zA-Z]{24}
  - GitHub PAT: ghp_[a-zA-Z0-9]{36}
  - Private Keys: -----BEGIN RSA PRIVATE KEY-----
- Each finding includes: file path, line number, issue type, suggested fix
- Findings array returned as JSON

### 4.7 Auto-Fix Rules

- System automatically applies fixes without user confirmation
- Fix process:
  - Read target file from ingested code
  - Locate specific line number containing exposed secret
  - Replace hardcoded secret with environment variable reference (e.g., process.env.API_KEY)
  - Perform atomic save operation
- All fixes applied sequentially
- Progress narrative updates after each fix

### 4.8 Deployment Rules

- Supabase Storage bucket: sites (public bucket)
- Edge Function create-site handles full deploy flow:
  - Calls consume-credits to check and deduct 1 credit
  - If URL deploy method: calls Edge Function fetch-and-store to fetch URL content
  - Uploads all files to sites/{subdomain}/{filename} path
  - Identifies index.html or first HTML file as entry point
  - Creates deployment record in deployments table: user_id, subdomain, file_paths (jsonb), live_url, status (active), created_at
  - Returns { success: true, live_url, balance }
- Live URL format: https://{SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/sites/{subdomain}/index.html
- Deployment must complete within 60 seconds from code ingestion to live URL
- If consume-credits fails: pipeline pauses, Top-Up Modal displayed

### 4.9 Subdomain Serving Rules

- Files stored in Supabase Storage at sites/{subdomain}/ path
- Live URL is direct Supabase Storage public URL
- Edge Function serve-site: reads subdomain from URL path param, proxies file from Storage
  - URL pattern: /functions/v1/serve-site/{subdomain}/{filepath}
- DNS instructions provided in dashboard: \"Point *.alphatekx.name.ng → CNAME to {project}.supabase.co\"
- Server IP for user's DNS configuration: 15.197.212.204

### 4.10 Custom Domain Rules

- User enters custom domain in dashboard
- System calls consume-credits with action_type: 'custom_domain'
- Custom domain connection costs 1 credit
- System stores domain in deployments.custom_domain column
- System displays DNS instructions: \"Set a CNAME record: your-domain.com → {supabase-project-ref}.supabase.co\"
- System displays Nginx config snippet for server at 15.197.212.204
- Status shown: Pending DNS / Active
- When DNS propagates: status updates to Active

### 4.11 Progress Narrative Rules

- All status messages use plain English
- No technical jargon or error codes
- Real-time updates during each step
- Step 1 narratives: \"Locking the doors…\", \"Setting up your private space…\", \"Your address is reserved.\", done line: \"The doors are locked. Your address is ready.\"
- Step 2 narratives: \"Checking your files for safety…\", \"Making sure nothing harmful is inside…\", \"Almost done checking…\", done line: \"All clear — your files are safe.\"
- Step 3 narratives: \"Verifying site integrity…\", \"Applying finishing touches…\", \"Making everything perfect…\", done line: \"Site integrity verified. Everything looks great.\"
- Step 4 narratives: \"Going live now…\", \"Putting your project on the internet…\", \"Seconds away…\", done line: \"You're live!\"
- Pipeline header during run: \"Securing & deploying your project…\"
- Pipeline header when done: \"Deployment Successful\"

### 4.12 Design Rules

- Background color: deep sapphire blue (#050d1a)
- Glassmorphism for all cards and forms:
  - Backdrop-filter blur effect
  - Translucent backgrounds
  - Electric blue 1px borders (rgba(88,166,255,0.18))
- Grandmother-friendly design:
  - Zero technical jargon
  - Simple icons only (Shield, Rocket, Checkmark, Folder with down-arrow, Download, Policy, History)
  - Plain English throughout
- Fully responsive, mobile-first approach

### 4.13 Download Production Code Rules

- Download triggered from Success View or Dashboard download icon button
- System uses JSZip library to generate zip file client-side
- Zip file contains:
  - All uploaded files from Supabase Storage
  - README.md with local run instructions
  - .env.example stub
- README.md content: \"# [subdomain] — AlphaTekx Deployment

To run locally:
1. Open index.html in your browser
2. No server required for static sites

Deployed at: https://{SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/sites/{subdomain}/index.html\"
- .env.example content: \"# Add your environment variables here
# Example:
# API_KEY=your_key_here\"
- Zip file named: [subdomain]-production.zip
- Browser triggers download automatically

### 4.14 Protection Module Rules

- Runtime monitoring runs in parallel to main deployment pipeline
- Monitoring does not slow down 60-second go-live promise
- System detects three attack types:
  - SQL injection patterns in request parameters
  - XSS patterns in user input
  - DDoS patterns based on request frequency
- Self-healing responses triggered automatically:
  - SQL injection detected → spin up temporary firewall rules
  - DDoS pattern detected → rate-limit malicious traffic
  - XSS pattern detected → isolate compromised container
- All responses occur without developer intervention
- Threat feed and self-healing log update in real-time

### 4.15 Rules Module Rules

- Policy enforcement runs in parallel to main deployment pipeline
- Policy checks do not slow down 60-second go-live promise
- Four policy categories: Security, Privacy, Access Control, Performance
- Each category contains toggle-based rules
- User can enable or disable rules at any time
- Active policies applied to all future deployments
- Any build violating active policies is rejected before deployment
- System generates automated Fix-It Report for each rejection
- Report explains violation and provides resolution steps in plain English

### 4.16 History Module Rules

- Audit logging runs in parallel to main deployment pipeline
- Logging does not slow down 60-second go-live promise
- Every action logged from file upload to final deployment
- Log entries include: timestamp, action type, actor (user/system), details, status
- Audit log is immutable and cannot be edited or deleted
- User can search and filter audit log
- Version rollback allows user to revert entire site by copying files from target deployment
- Rollback requires confirmation with diff summary
- Most recent successful deployment marked with \"Last Known Good\" badge
- Rollback action logged in audit trail

### 4.17 Module Access Rules

- Post-Deployment Dashboard accessible only after first successful deployment
- User clicks \"See My Dashboard\" button on Success View to access dashboard
- Three modules accessible via persistent top navigation: Protection, Rules, History
- All modules run independently and do not interfere with main deployment flow
- User can switch between modules at any time

### 4.18 Landing Page Animation Rules

- Animated gradient orbs move slowly in background using CSS keyframe animations
- Hero section elements fade in on page load with stagger effect
- Section content animates in on scroll using intersection observer
- Cards have hover effects: lift with scale transform and glow
- Pipeline visualization in Live Pipeline Visualization Section plays automatically on scroll into view
- Security scan animation in Security Showcase Section plays automatically on scroll into view
- Timer in Speed Performance Section counts down automatically on scroll into view
- All animations use smooth easing functions
- Animations respect user's prefers-reduced-motion setting

## 5. Exception and Boundary Cases

| Scenario | Handling |
|----------|----------|
| User not authenticated accessing /deploy | Redirect to /login with return URL stored |
| User not authenticated accessing /pipeline | Redirect to /login |
| User not authenticated accessing /dashboard | Redirect to /login |
| First-time Google sign-in | Create user record in profiles table with 20 credits, log signup bonus transaction |
| Credit balance insufficient for deploy | Display Top-Up Modal, pause pipeline until credits topped up |
| Credit balance insufficient for custom domain | Display Top-Up Modal |
| Paystack payment fails | Display error message, allow retry |
| Paystack webhook signature invalid | Reject webhook, log error |
| User enters invalid subdomain format | Display inline validation message with format requirements |
| Subdomain already exists in deployments table | Display: \"Taken, try another\" with red cross indicator |
| Subdomain field is empty | Disable \"Secure & Deploy\" button |
| User uploads empty folder | Display: \"Please upload a folder with code files\" |
| User enters invalid URL format | Display: \"Please enter a valid URL\" |
| User provides neither files nor URL | Disable \"Secure & Deploy\" button |
| Security scan finds zero issues | Display: \"All clear — your files are safe.\", proceed directly to Verifying Site Integrity Step |
| Auto-fix fails on specific file | Display: \"Could not fix 1 problem\", continue with remaining fixes |
| Supabase Storage upload fails | Display: \"Upload failed, please try again\" |
| Edge Function create-site fails | Display: \"Deployment failed, please try again\" |
| Edge Function fetch-and-store fails | Display: \"Could not fetch URL, please try again\" |
| User clicks \"Copy My Link\" with no URL | Disable button until URL is available |
| User clicks \"Download Production Code\" with no files | Generate zip with placeholder index.html and README |
| JSZip library fails to generate zip | Display: \"Download failed, please try again\" |
| Network error during scan | Display: \"Connection problem, please try again\" |
| Domain verification fails | Display: \"Domain verification failed, please try again\" |
| User accesses dashboard before first deployment | Redirect to /deploy with message: \"Please complete your first deployment\" |
| No threats detected in real-time feed | Display: \"No threats detected yet\" |
| No self-healing actions taken | Display: \"No actions taken yet\" |
| User disables all policy rules | Display warning: \"No policies active, deployments will not be checked\" |
| No policy violations found | Display: \"All deployments passed policy checks\" |
| Audit log is empty | Display: \"No actions logged yet\" |
| No previous deployments available for rollback | Display: \"No previous versions available\" |
| User attempts rollback to current version | Disable \"Rollback\" button on current version |
| Rollback fails | Display: \"Rollback failed, please try again\" |
| User cancels rollback confirmation | Close dialog, no action taken |
| Custom domain DNS not propagated | Status remains: Pending DNS |
| Custom domain DNS propagated | Status updates to: Active |
| User signs out | Sign out via Supabase Auth, redirect to landing page |
| User has prefers-reduced-motion enabled | Disable all animations, show static content |
| Landing page animations fail to load | Display static content without animations |
| User scrolls quickly through landing page | Animations trigger only when section is in viewport |

## 6. Acceptance Criteria

1. User navigates to landing page at /, views full viewport hero section with animated gradient background (#050915 base with electric blue, purple, cyber green orbs), floating navigation bar with AlphaTekx logo, navigation links (Features, Security, Pricing), Sign In button, large gradient text headline \"Your code. Online. In 60 seconds.\", subheadline \"The infrastructure bridge that takes your files from your machine to the live internet — secured, deployed, and protected automatically. No DevOps. No servers. Just results.\", primary CTA button \"Get Started Free\" with electric blue accent and glow effect, secondary CTA button \"Watch Demo\" with outlined glassmorphism style, social proof row \"20,000+ deployments · 5,000+ developers · 99.9% uptime\"
2. User scrolls down, views Trust Bar section with glassmorphism bar displaying label \"Trusted by developers worldwide\", security badges \"SOC 2 Compliant\", \"GDPR Ready\", \"ISO 27001\", trust indicators \"Enterprise-grade security\", \"99.9% uptime SLA\", badges fade in with animation
3. User continues scrolling, views How It Works section with gradient text headline \"Deploy in three simple steps\", three glassmorphism cards in horizontal row (Step 1: \"Drop Your Code\" with folder icon, Step 2: \"Guardian Secures It\" with shield icon, Step 3: \"Go Live Instantly\" with rocket icon), animated connecting lines between cards with glow effect, cards animate in with stagger effect, icons pulse with subtle glow on hover
4. User scrolls to Features Grid section, views gradient text headline \"Everything you need to deploy with confidence\", six glassmorphism feature cards in 3x2 grid (Smart Ingestion, Guardian Security, Sub-60s Deployment, Custom Domains, Runtime Protection, Version Rollback), cards animate in with stagger effect, user hovers over card, card lifts with glow effect and scale transform
5. User scrolls to Live Pipeline Visualization section, views gradient text headline \"Watch your deployment happen in real-time\", large glassmorphism card with pipeline header \"Guardian Deployment Pipeline\", four vertical steps (Locking the Doors, Checking for Safety, Verifying Site Integrity, Going Live) with animated progress bars and status indicators, pipeline animation plays automatically showing sequential step completion with progress narratives, final step displays mock live URL, animation loops after completion
6. User scrolls to Security Showcase section, views gradient text headline \"Security that works while you sleep\", two-column layout with left column showing subheadline \"Guardian scans every line of code, fixes vulnerabilities automatically, and protects your deployment 24/7\", three glassmorphism cards (Automated Scanning, Auto-Fix, Runtime Protection), right column showing animated security scan visualization with mock code editor, vulnerabilities highlight in red, auto-fix animation shows replacement with green highlights
7. User scrolls to Speed Performance section, views gradient text headline \"From code to live in under 60 seconds\", large glassmorphism card with animated timer counting down from 00:60 to 00:00, subtext \"Average deployment time\", performance metrics grid (99.9% uptime, < 100ms response time, Global CDN, Auto-scaling), timer animation plays automatically, metrics fade in with stagger effect
8. User scrolls to Testimonials section, views gradient text headline \"Trusted by developers worldwide\", three glassmorphism testimonial cards in horizontal row (Card 1: Quote, Author: \"Sarah Chen\", Role: \"Senior Developer\", Card 2: Quote, Author: \"Michael Rodriguez\", Role: \"CTO\", Card 3: Quote, Author: \"Emily Watson\", Role: \"Product Manager\"), cards animate in with stagger effect, cards have subtle hover glow effect
9. User scrolls to Pricing Preview section, views gradient text headline \"Simple, transparent pricing\", three glassmorphism pricing cards in horizontal row (Starter: ₦500 = 10 credits, Pro: ₦2000 = 50 credits with \"Most Popular\" badge and highlighted border, Enterprise: ₦5000 = 150 credits), each card contains plan name, price in large text, credit amount, feature list, \"Get Started\" button, cards animate in with stagger effect
10. User scrolls to Final CTA section, views full-width section with dramatic gradient background (electric blue to purple), large glassmorphism card with gradient text headline \"Ready to deploy your next project?\", subheadline \"Join 5,000+ developers who trust AlphaTekx for secure, instant deployments\", primary CTA button \"Get Started Free\" with electric blue accent and large glow effect, secondary text link \"or watch a demo\", card animates in with scale effect
11. User scrolls to Footer, views four-column layout with Column 1: AlphaTekx logo and tagline \"The infrastructure bridge for modern developers\", Column 2: \"Product\" links (Features, Security, Pricing, Documentation), Column 3: \"Company\" links (About, Blog, Careers, Contact), Column 4: \"Legal\" links (Terms, Privacy, Security), bottom row with social media icons (Twitter, GitHub, LinkedIn) and copyright text
12. User clicks \"Get Started Free\" button in hero section, system navigates to /login, user views Google sign-in button, user clicks Google sign-in button, system initiates Google OAuth via Supabase Auth, user completes authentication, system creates user record in profiles table with credit_balance 20 on first sign-in, logs signup bonus transaction in transaction_history, redirects to /deploy
13. User views ingestion screen at /deploy with top navigation showing user avatar and credit balance 20, headline \"Drop your project. We handle the rest.\", subdomain input section with label \"Choose your web address\", input field placeholder \"pick-your-name\", format hint \"Your project will live at: [name].alphatekx.name.ng\", real-time availability indicator, large Drop Zone with dashed electric blue border, main label \"Drop your project here\", folder icon, secondary label \"or paste a URL below\", URL input field, disabled \"Secure & Deploy\" button
14. User enters subdomain \"my-app\" into input field, system validates format in real-time (lowercase, alphanumeric, hyphens, 3-30 chars), checks availability in deployments table, displays green checkmark + \"Available\", user drags folder into Drop Zone, system displays folder name and file count, enables \"Secure & Deploy\" button, user clicks \"Secure & Deploy\", system navigates to /pipeline
15. User views Guardian Deployment Pipeline at /pipeline with pipeline header \"Securing & deploying your project…\", first card displays Shield icon with step title \"Locking the Doors\", progress narratives cycle through \"Locking the doors…\", \"Setting up your private space…\", \"Your address is reserved.\", system checks subdomain availability in deployments table, done line displays \"The doors are locked. Your address is ready.\", card transitions to completed state with soft sage green accent, second card displays Shield icon with step title \"Checking for Safety\", progress narratives cycle through \"Checking your files for safety…\", \"Making sure nothing harmful is inside…\", \"Almost done checking…\", system performs security scan using regex patterns, returns findings array with 2 issues, done line displays \"All clear — your files are safe.\", card transitions to completed state, third card displays Checkmark icon with step title \"Verifying Site Integrity\", progress narratives cycle through \"Verifying site integrity…\", \"Applying finishing touches…\", \"Making everything perfect…\", system applies fixes sequentially, done line displays \"Site integrity verified. Everything looks great.\", card transitions to completed state, fourth card displays Rocket icon with step title \"Going Live\", progress narratives cycle through \"Going live now…\", \"Putting your project on the internet…\", \"Seconds away…\", system calls Edge Function create-site, create-site calls consume-credits, consume-credits checks credit_balance (20 credits), decrements by 1, logs transaction, uploads files to Supabase Storage bucket sites at path sites/my-app/{filename}, creates deployment record in deployments table, returns { success: true, live_url, balance: 19 }, system updates credit balance display to 19, done line displays \"You're live!\", card transitions to completed state, pipeline header updates to \"Deployment Successful\", fifth card shows Checkmark icon with soft sage green accent, headline \"Deployment Successful\", subtext \"Your project is live and protected. Here is your link:\", displays live URL in green-bordered box, provides buttons \"Copy My Link\", \"Open My Site\", \"Download Production Code\", \"See My Dashboard\", \"Deploy another project\" link

## 7. Out of Scope for This Release

- Multi-user team collaboration features
- Project sharing or public project gallery
- Advanced user roles or permissions beyond single user
- Custom authentication providers beyond Google OAuth
- Two-factor authentication (2FA) implementation
- Password-based authentication
- Email verification flows
- Account recovery mechanisms
- User profile editing beyond basic info
- Credit gifting or transfer between users
- Subscription-based pricing models
- Automatic credit renewal
- Invoice generation or billing history
- Refund processing
- Multiple payment methods beyond Paystack
- Currency support beyond Nigerian Naira
- Real Git repository integration beyond URL fetch
- GitHub App installation or OAuth
- GitLab or Bitbucket integration
- Continuous deployment from Git commits
- Branch-based deployments
- Pull request previews
- Automated testing integration
- Code quality metrics or linting
- Performance profiling or optimization
- SEO analysis or recommendations
- Accessibility auditing
- Browser compatibility testing
- Mobile responsiveness testing
- Load testing or stress testing
- Container orchestration or Kubernetes support
- Multi-cloud deployment options
- Staging or preview environments
- A/B testing or canary deployments
- Blue-green deployment strategies
- Deployment scheduling or cron jobs
- Webhook notifications for deployment events
- Slack or Discord integration
- Email notifications for deployment status
- SMS alerts for security threats
- Advanced security scanning beyond regex patterns
- Dependency vulnerability scanning
- License compliance checking
- GDPR compliance tools
- SOC 2 compliance features
- Penetration testing integration
- DDoS mitigation beyond basic rate limiting
- WAF (Web Application Firewall) configuration
- SSL certificate management
- Custom SSL certificate upload
- HTTP/2 or HTTP/3 support
- CDN integration or edge caching
- Image optimization or lazy loading
- Asset minification or bundling
- Environment variable management UI
- Secrets rotation automation
- Database integration or provisioning
- Serverless function deployment
- API gateway configuration
- GraphQL endpoint setup
- WebSocket support
- Real-time collaboration features
- In-app chat or support
- Knowledge base or documentation portal
- Video tutorials or onboarding flows
- Gamification or achievement system
- Referral program or affiliate system
- White-label or reseller options
- API for programmatic deployments
- CLI tool for command-line deployments
- IDE plugins or extensions
- Desktop application
- Mobile app for iOS or Android
- Offline mode or local development sync
- File versioning beyond deployment rollback
- Diff viewer for file changes
- Code editor or IDE integration
- Visual page builder or drag-and-drop UI
- Template marketplace or library
- AI-powered code generation
- Automated bug fixing or code suggestions
- Natural language deployment commands
- Voice-controlled deployment interface
- Landing page A/B testing
- Landing page analytics dashboard
- Landing page personalization based on user behavior
- Landing page multi-language support
- Landing page chatbot or live chat
- Landing page video backgrounds
- Landing page 3D graphics or WebGL effects
- Landing page interactive demos beyond pipeline visualization
- Landing page user-generated content sections
- Landing page blog integration
- Landing page newsletter signup
- Landing page event calendar
- Landing page job board
- Landing page partner/sponsor logos beyond trust bar
- Landing page case studies or success stories beyond testimonials
- Landing page comparison tables with competitors
- Landing page ROI calculator
- Landing page free trial signup flow beyond \"Get Started Free\"
- Landing page product tour or guided walkthrough
- Landing page exit-intent popups
- Landing page sticky headers or floating CTAs
- Landing page progress indicators for long-form content
- Landing page lazy loading for images
- Landing page service worker for offline access