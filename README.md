# 🎓 Student Dashboard — Salesforce LWC Project

A full-stack academic management application built on Salesforce, featuring custom objects, Apex backend logic, automation flows, and a Lightning Web Component dashboard with live data visualizations.

---

## 📸 Features

- **Student Management** — Add, edit, and track students with enrollment status
- **Course Management** — Manage courses by department and credit hours
- **Grade Tracking** — Record scores with automatic grade letter assignment
- **Live Charts** — Donut chart for student status, bar charts for grade distribution and average scores per course
- **Automation** — Flow, Trigger, and Validation Rule enforce data integrity

---

## 🏗️ Project Structure

```
force-app/main/default/
├── objects/
│   ├── Student__c/         # Student custom object + fields
│   ├── Course__c/          # Course custom object + fields
│   └── Grade__c/           # Grade custom object + fields + validation rule
├── classes/
│   └── StudentDashboardController.cls   # Apex controller for all CRUD operations
├── lwc/
│   └── studentDashboard/   # Main LWC dashboard component
│       ├── studentDashboard.html
│       ├── studentDashboard.js
│       ├── studentDashboard.css
│       └── studentDashboard.js-meta.xml
├── flows/
│   └── Auto_Set_Grade_Letter.flow-meta.xml  # Auto-assigns grade letter from score
├── triggers/
│   └── GradeTrigger.trigger  # Blocks grading inactive students
├── tabs/                   # Custom tabs for each object
└── applications/           # Student Dashboard Lightning App
```

---

## ⚙️ Technical Components

### Custom Objects
| Object | Key Fields |
|--------|-----------|
| Student__c | Name, Email, Status (Active/Inactive/Graduated/On Leave), Enrollment Date |
| Course__c | Name, Department, Credits |
| Grade__c | Score, Grade Letter, Student (Lookup), Course (Lookup) |

### Apex Controller (`StudentDashboardController.cls`)
- `getStudents()` — fetches all student records
- `getCourses()` — fetches all course records
- `getGrades()` — fetches all grade records with related student and course names
- `saveStudent()` — creates or updates a student record
- `saveCourse()` — creates or updates a course record
- `saveGrade()` — creates or updates a grade record

### Flow — Auto Set Grade Letter
Record-triggered flow that runs **before save** on Grade records. Automatically assigns Grade Letter based on Score:
| Score | Grade |
|-------|-------|
| 90–100 | A |
| 80–89 | B |
| 70–79 | C |
| 60–69 | D |
| 0–59 | F |

### Apex Trigger — GradeTrigger
Fires on `before insert` and `before update` on Grade records. Prevents saving a grade if the linked Student has **Inactive** status.

### Validation Rule — Score Range
Blocks saving a Grade record if Score is less than 0 or greater than 100.

---

## 🚀 Deployment

### Prerequisites
- [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli) installed
- A Salesforce Developer org

### Steps

**1. Authenticate your org**
```bash
sf org login web --alias my-org --instance-url https://login.salesforce.com
```

**2. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/student-dashboard.git
cd student-dashboard
```

**3. Deploy to Salesforce**
```bash
sf project deploy start --target-org my-org
```

**4. Open your org**
```bash
sf org open --target-org my-org
```

**5. Activate the dashboard page**
- Go to **Setup → Lightning App Builder**
- Find **Student Dashboard** → click **Activate**

**6. Launch the app**
- Click the **App Launcher** (9-dot grid)
- Search for **Student Dashboard**

---

## 🛠️ Built With

- **Salesforce Platform** — Custom objects, flows, validation rules
- **Apex** — Server-side backend logic and SOQL queries
- **Lightning Web Components (LWC)** — Frontend UI framework
- **SVG** — Custom charts rendered without external libraries
- **Salesforce CLI** — Metadata deployment via VS Code

---

## 👩‍💻 Author

**Olivia Sam**  
Salesforce Developer Edition Project  
Deployed via Salesforce CLI + VS Code