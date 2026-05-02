public with sharing class StudentDashboardController {

    @AuraEnabled(cacheable=true)
    public static List<Student__c> getStudents() {
        return [SELECT Id, Name, Email__c, Status__c, Enrollment_Date__c FROM Student__c ORDER BY Name LIMIT 200];
    }

    @AuraEnabled(cacheable=true)
    public static List<Course__c> getCourses() {
        return [SELECT Id, Name, Department__c, Credits__c FROM Course__c ORDER BY Name LIMIT 200];
    }

    @AuraEnabled(cacheable=true)
    public static List<Grade__c> getGrades() {
        return [SELECT Id, Name, Score__c, Grade_Letter__c, Student__r.Name, Course__r.Name FROM Grade__c ORDER BY Name LIMIT 200];
    }

    @AuraEnabled
    public static void saveStudent(String recordId, String name, String email, String status, String enrollmentDate) {
        Student__c s = recordId != null ? new Student__c(Id = recordId) : new Student__c();
        s.Name = name;
        s.Email__c = email;
        s.Status__c = status;
        if (enrollmentDate != null && enrollmentDate != '') {
            s.Enrollment_Date__c = Date.valueOf(enrollmentDate);
        }
        upsert s;
    }

    @AuraEnabled
    public static void saveCourse(String recordId, String name, String department, Decimal credits) {
        Course__c c = recordId != null ? new Course__c(Id = recordId) : new Course__c();
        c.Name = name;
        c.Department__c = department;
        c.Credits__c = credits;
        upsert c;
    }

    @AuraEnabled
    public static void saveGrade(String recordId, Decimal score, String gradeLetter, String studentId, String courseId) {
        Grade__c g = recordId != null ? new Grade__c(Id = recordId) : new Grade__c();
        g.Score__c = score;
        if (gradeLetter != null && gradeLetter != '') g.Grade_Letter__c = gradeLetter;
        if (studentId != null && studentId != '') g.Student__c = studentId;
        if (courseId != null && courseId != '') g.Course__c = courseId;
        upsert g;
    }
}