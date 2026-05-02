import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getStudents from '@salesforce/apex/StudentDashboardController.getStudents';
import getCourses from '@salesforce/apex/StudentDashboardController.getCourses';
import getGrades from '@salesforce/apex/StudentDashboardController.getGrades';
import saveStudent from '@salesforce/apex/StudentDashboardController.saveStudent';
import saveCourse from '@salesforce/apex/StudentDashboardController.saveCourse';
import saveGrade from '@salesforce/apex/StudentDashboardController.saveGrade';

export default class StudentDashboard extends LightningElement {
    @track students = [];
    @track courses = [];
    @track grades = [];
    @track editRecord = {};
    @track showStudentModal = false;
    @track showCourseModal = false;
    @track showGradeModal = false;
    @track modalTitle = '';
    @track currentType = '';
    @track errorMessage = '';

    // Chart data
    @track donutSegments = [];
    @track donutLegend = [];
    @track gradeBarItems = [];
    @track scoreBarItems = [];
    @track gradeBarMax = 1;
    @track scoreBarMax = 100;

    _studentsWire;
    _coursesWire;
    _gradesWire;

    @wire(getStudents)
    wiredStudents(result) {
        this._studentsWire = result;
        if (result.data) { this.students = result.data; this.buildCharts(); }
    }

    @wire(getCourses)
    wiredCourses(result) {
        this._coursesWire = result;
        if (result.data) { this.courses = result.data; this.buildCharts(); }
    }

    @wire(getGrades)
    wiredGrades(result) {
        this._gradesWire = result;
        if (result.data) {
            this.grades = result.data.map(g => ({
                ...g,
                StudentName: g.Student__r ? g.Student__r.Name : '',
                CourseName: g.Course__r ? g.Course__r.Name : ''
            }));
            this.buildCharts();
        }
    }

    buildCharts() {
        this.buildDonut();
        this.buildGradeBar();
        this.buildScoreBar();
    }

    buildDonut() {
        const colors = { 'Active': '#22c55e', 'Inactive': '#ef4444', 'Graduated': '#3b82f6', 'On Leave': '#f59e0b' };
        const counts = {};
        this.students.forEach(s => { const st = s.Status__c || 'Unknown'; counts[st] = (counts[st] || 0) + 1; });
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        let offset = 0;
        const cx = 80, cy = 80, r = 60;
        const segments = [];
        const legend = [];
        Object.entries(counts).forEach(([label, count]) => {
            const pct = count / total;
            const angle = pct * 2 * Math.PI;
            const x1 = cx + r * Math.sin(offset);
            const y1 = cy - r * Math.cos(offset);
            offset += angle;
            const x2 = cx + r * Math.sin(offset);
            const y2 = cy - r * Math.cos(offset);
            const large = angle > Math.PI ? 1 : 0;
            const color = colors[label] || '#94a3b8';
            segments.push({ d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, fill: color, key: label });
            legend.push({ label: `${label} (${count})`, dotStyle: `display:inline-block;width:12px;height:12px;border-radius:50%;background:${color};margin-right:6px;`, key: label });
        });
        this.donutSegments = segments;
        this.donutLegend = legend;
    }

    buildGradeBar() {
        const colors = { A: '#22c55e', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444' };
        const counts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        this.grades.forEach(g => { if (g.Grade_Letter__c && counts[g.Grade_Letter__c] !== undefined) counts[g.Grade_Letter__c]++; });
        const max = Math.max(...Object.values(counts), 1);
        this.gradeBarMax = max;
        this.gradeBarItems = Object.entries(counts).map(([label, val]) => ({
            label, val, key: label,
            barStyle: `height:${Math.max(Math.round((val / max) * 80), val > 0 ? 4 : 0)}px;background:${colors[label]};width:32px;border-radius:4px 4px 0 0;margin:0 auto;display:block;`
        }));
    }

    buildScoreBar() {
        const courseScores = {};
        const courseCounts = {};
        this.grades.forEach(g => {
            const name = g.CourseName || 'Unknown';
            if (g.Score__c != null) {
                courseScores[name] = (courseScores[name] || 0) + g.Score__c;
                courseCounts[name] = (courseCounts[name] || 0) + 1;
            }
        });
        const avgs = Object.keys(courseScores).map(k => ({ course: k, avg: Math.round(courseScores[k] / courseCounts[k]) }));
        const max = Math.max(...avgs.map(a => a.avg), 100);
        this.scoreBarItems = avgs.map((a, i) => ({
            key: a.course + i,
            label: a.course.length > 8 ? a.course.substring(0, 8) + '…' : a.course,
            val: a.avg,
            barStyle: `height:${Math.max(Math.round((a.avg / max) * 80), 4)}px;background:#6366f1;width:32px;border-radius:4px 4px 0 0;margin:0 auto;display:block;`
        }));
    }

    get totalStudents() { return this.students ? this.students.length : 0; }
    get totalCourses() { return this.courses ? this.courses.length : 0; }
    get totalGrades() { return this.grades ? this.grades.length : 0; }
    get activeStudents() { return this.students ? this.students.filter(s => s.Status__c === 'Active').length : 0; }
    get isActive() { return this.editRecord.Status__c === 'Active'; }
    get isInactive() { return this.editRecord.Status__c === 'Inactive'; }
    get isGraduated() { return this.editRecord.Status__c === 'Graduated'; }
    get isOnLeave() { return this.editRecord.Status__c === 'On Leave'; }
    get hasScoreData() { return this.scoreBarItems.length > 0; }
    get hasGradeData() { return this.grades.length > 0; }
    get hasStudentData() { return this.students.length > 0; }

    handleEdit(event) {
        const id = event.target.dataset.id;
        const type = event.target.dataset.type;
        this.currentType = type;
        this.errorMessage = '';
        if (type === 'student') { this.editRecord = { ...this.students.find(s => s.Id === id) }; this.modalTitle = 'Edit Student'; this.showStudentModal = true; }
        else if (type === 'course') { this.editRecord = { ...this.courses.find(c => c.Id === id) }; this.modalTitle = 'Edit Course'; this.showCourseModal = true; }
        else if (type === 'grade') { this.editRecord = { ...this.grades.find(g => g.Id === id) }; this.modalTitle = 'Edit Grade'; this.showGradeModal = true; }
    }

    handleNewStudent() { this.editRecord = { Status__c: 'Active' }; this.modalTitle = 'New Student'; this.currentType = 'student-new'; this.errorMessage = ''; this.showStudentModal = true; }
    handleNewCourse() { this.editRecord = {}; this.modalTitle = 'New Course'; this.currentType = 'course-new'; this.errorMessage = ''; this.showCourseModal = true; }
    handleNewGrade() { this.editRecord = {}; this.modalTitle = 'New Grade'; this.currentType = 'grade-new'; this.errorMessage = ''; this.showGradeModal = true; }

    handleFieldChange(event) {
        const field = event.target.dataset.field;
        let value = event.target.value;
        if (field === 'Credits__c' || field === 'Score__c') value = value !== '' ? parseFloat(value) : null;
        this.editRecord = { ...this.editRecord, [field]: value };
    }

    saveRecord() {
        this.errorMessage = '';
        const isNew = this.currentType.includes('new');
        const recordId = isNew ? null : this.editRecord.Id;
        let promise;
        if (this.currentType.includes('student')) {
            promise = saveStudent({ recordId, name: this.editRecord.Name || '', email: this.editRecord.Email__c || '', status: this.editRecord.Status__c || 'Active', enrollmentDate: this.editRecord.Enrollment_Date__c || '' });
        } else if (this.currentType.includes('course')) {
            promise = saveCourse({ recordId, name: this.editRecord.Name || '', department: this.editRecord.Department__c || '', credits: this.editRecord.Credits__c || null });
        } else {
            promise = saveGrade({ recordId, score: this.editRecord.Score__c || null, gradeLetter: this.editRecord.Grade_Letter__c || '', studentId: this.editRecord.Student__c || '', courseId: this.editRecord.Course__c || '' });
        }
        promise.then(() => { this.closeModal(); this.refreshAll(); })
               .catch(e => { this.errorMessage = (e.body && e.body.message) ? e.body.message : 'Save failed. Please try again.'; });
    }

    refreshAll() {
        refreshApex(this._studentsWire);
        refreshApex(this._coursesWire);
        refreshApex(this._gradesWire);
    }

    closeModal() {
        this.showStudentModal = false;
        this.showCourseModal = false;
        this.showGradeModal = false;
        this.editRecord = {};
        this.errorMessage = '';
    }
}