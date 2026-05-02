# Student Dashboard - Deployment Guide

## Prerequisites
- Salesforce CLI installed (`sf` command works)
- Already authenticated to your new org

## Step-by-Step Deployment

### 1. Navigate to the project folder
```bash
cd student-dashboard
```

### 2. Verify your org is connected
```bash
sf org list
```
Note the alias or username of your target org.

### 3. Deploy everything to your org
```bash
sf project deploy start --target-org <your-org-alias>
```
Replace `<your-org-alias>` with your org alias from step 2.

### 4. Open your org to verify
```bash
sf org open --target-org <your-org-alias>
```

### 5. Activate the App Page in Salesforce
1. Go to **Setup** → search **App Manager**
2. Find **Student Dashboard** → click **Open**
3. Go to **Setup** → search **Lightning App Builder**
4. Find **Student Dashboard** page → click **Activate**

### 6. Access your app
- Click the **App Launcher** (9-dot grid) in top left
- Search for **Student Dashboard**
- Click to open

## What gets deployed
- ✅ Student__c object (Name, Email, Status, Enrollment Date)
- ✅ Course__c object (Name, Department, Credits)
- ✅ Grade__c object (Score, Grade Letter, linked to Student & Course)
- ✅ studentDashboard LWC (the dashboard UI)
- ✅ StudentDashboardController Apex class
- ✅ Student Dashboard Lightning App
- ✅ App tabs for all 3 objects
