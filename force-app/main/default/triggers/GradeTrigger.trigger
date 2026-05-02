trigger GradeTrigger on Grade__c (before insert, before update) {
    Set<Id> studentIds = new Set<Id>();
    for (Grade__c g : Trigger.new) {
        if (g.Student__c != null) {
            studentIds.add(g.Student__c);
        }
    }

    Map<Id, Student__c> studentsMap = new Map<Id, Student__c>(
        [SELECT Id, Status__c, Name FROM Student__c WHERE Id IN :studentIds]
    );

    for (Grade__c g : Trigger.new) {
        if (g.Student__c != null) {
            Student__c student = studentsMap.get(g.Student__c);
            if (student != null && student.Status__c == 'Inactive') {
                g.addError('Cannot assign a grade to an Inactive student (' + student.Name + '). Please activate the student first.');
            }
        }
    }
}
