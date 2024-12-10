// Visit View Add Card
export const visit_add_card_btn = [
    {
        body_container_id: 'clinical_group',
        cards: [
            {
                component: 'visitClinicalEvaluationCardView',
                title: 'Clinical Evaluation'
            },
            {
                component: 'visitAllergyCardView',
                title: 'Allergy'
            },
            {
                component: 'visitPlanForNextVisitCardView',
                title: 'Plan for Next Visit'
            },
            {
                component: 'visitFinalDiagnosisCardView',
                title: 'Final Diagnosis'
            },
            
        ],
    },
    {
        body_container_id: 'diagnosis_group',
        cards: [
            {
                component: 'visitRadiologyExamCardView',
                title: 'Radiology Exam'
            },
            {
                component: 'visitLabExamCardView',
                title: 'Laboratory Test'
            },
        ],
    },
    {
        body_container_id: 'treatment_group',
        cards: [
            {
                component: 'visitPrescriptionsCardView',
                title: 'Prescriptions'
            },
            {
                component: 'visitProceduresCardView',
                title: 'Procedures'
            },
            {
                component: 'visitVaccineCardView',
                title: 'Vaccine'
            },
            {
                component: 'visitImplantableDevicesCardView',
                title: 'Implantable Devices'
            },
        ],
    },
];


