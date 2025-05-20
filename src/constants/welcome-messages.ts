export const variables = [
  '[First name]',
  '[Coordinator name]',
  '[Coach name]',
  '[Coach Date and Time]',
  '[Provider Date and Time]',
  '[Provider’s Zoom link]',
  '[Coach’s Zoom link]',
  '[Compound Medication]',
  '[Care]',
];
export const activeMember = `
<p>Hey [First name],</p>
<p> We are excited to have you in our [Care] program as well! We look forward to continuing your wellness journey with you. Please let me know if you need anything or have any questions.</p>
`;
export const activeMemberSync = `
<p>Hey [First name],</p>
<p> We are excited to have you in our [Care] program as well! We look forward to continuing your wellness journey with you. Please let me know if you need anything or have any questions.</p>
<p>Your scheduled video consultation is on [Provider Date and Time]: <a href="[Provider’s Zoom link]" target="_blank">[Provider’s Zoom link]</a>. In the consultation, your provider will walk you through your suggested treatment plan</p>
`;
export const syncVisit = `
<p>Hey [First name], welcome to Zealthy! I'm [Coordinator name], your dedicated care coordinator. My role is to support you and ensure you have all the resources you need. We're committed to providing you with the highest quality of care as we help guide you towards better health.</p>

<p>The next step is to have a visit with one of our outstanding providers. These highly skilled clinicians have been carefully vetted and trained to provide exceptional care. They will work with you to address your health concerns and develop a personalized plan. Here’s the link for your visit, which is currently scheduled for [Provider Date and Time]: [Provider’s Zoom link]</p>

<p>If you have any issues before, during, or after your visits, don’t hesitate to reach out to me so I can help. I am here to ensure that you feel informed, supported, and empowered while receiving care from us.</p>
`;

export const syncAndWeightLoss = `
<p>Welcome to Zealthy! I'm [Coordinator name], your dedicated care coordinator. My role is to support you on your healthcare journey and ensure you have all the resources you need. We're committed to providing you with the highest quality of care as we help guide you towards better health.</p>

<p>The next step is to have a visit with one of our outstanding providers. These highly skilled clinicians have been carefully vetted and trained to provide exceptional care. They will work with you to address your health concerns and develop a personalized plan. Here’s the link for your visit, which is currently scheduled for [Provider Date and Time]: [Provider’s Zoom link]</p>

<p>In the meantime, to expedite the prior authorization process in the event that your provider decides to prescribe weight loss medication, please go to the document upload page and add any results from laboratory work done within the past year. We will also need a picture of the front and back of your insurance card and/or pharmacy benefits card if applicable. In addition to that please let us know about any other methods of weight loss you have tried in the past including medications like metformin, exercise programs, coaching programs like weightwatchers, noom, etc. and if you have any receipts or invoices, please upload those as well. All of this information will help us make the best case possible on your behalf to your insurance company to get the medication covered.</p>

<p>You’ll also hold your first visit with your weight loss coach. Zealthy weight loss coaches are highly trained professionals who will provide guidance, support, and expertise as you work towards achieving your weight loss goals. During your 15 minute sessions every two weeks, they will work with you to develop a personalized plan, offer nutrition advice, and help you establish healthy lifestyle habits. Here’s the link to join for your first 1:1 weight loss coaching visit, which is currently scheduled for [Coach Date and Time]: [Coach’s Zoom link]</p>

<p>I will be working closely with your provider and weight loss coach to ensure seamless coordination of your appointments, treatment plans, and any necessary follow-up care. If you have any questions or concerns at any time with us at Zealthy please don't hesitate to reach out to me.</p>
`;

export const syncAndMentalHealth = `
<p>Hey [First name], welcome to Zealthy! I’m [Coordinator name] and I’ll be your care coordinator.  I will be your dedicated point of contact, ensuring that you have all the support and resources you need. My goal is to ensure that you receive the highest quality of care and get the most out of your time with us.</p>

<p>The next step is to have a visit with one of our outstanding providers. These highly skilled clinicians have been carefully vetted and trained to provide exceptional care. They will work with you to address your health concerns and develop a personalized plan. Here’s the link for your visit, which is currently scheduled for [Provider Date and Time]: [Provider’s Zoom link]</p>

<p>You’ll also hold your first visit with your mental health coach. Zealthy mental health coaches have specialized training to provide guidance and support, helping you develop effective coping strategies and enhance your overall well-being. Here’s the link to join for your first 1:1 mental health coaching visit, which is currently scheduled for [Coach Date and Time]: [Coach’s Zoom link]. You will continue to meet with your mental health coach every month for 45 minutes to support you in your mental wellbeing.</p> 

<p>I will be working closely with your provider and mental health coach to ensure seamless coordination of your appointments, treatment plans, and any necessary follow-up care. If you have any questions or concerns leading up to or after your visit, please don't hesitate to reach out to me.</p>
`;

export const asyncMentalHealthOnly = `
<p>Hey [First name], welcome to Zealthy! I'm [Coordinator name], your Zealthy coordinator. My role is to support you and ensure you have all the resources you need as you work through your mental health journey.</p>

<p>We’re here to help you with your psychiatric care. One of our outstanding Zealthy psychiatric providers will be carefully reviewing your medical information and will be in touch with you shortly about next steps. You should hear back within 1-2 business days.</p>

<p>If your prescription request is approved, it will automatically be shipped to your home.</p>

<p>In the meantime, you can reach out to me for anything you need.</p>
`;

export const syncPersonalizedPsychiatry = `
<p>Hey [First name], welcome to Zealthy!</p>

<p>I’m [Coordinator name] and I’ll be your lead care coordinator. You care coordination team is here to support you and ensure you have all the resources you need as you work through your mental health journey.</p>

<p>We’re here to help you with your psychiatric care, including video visits with your provider which include diagnosis of any challenges you’ve been facing, messaging with me and the rest of your care team, and at-home medication delivery.</p>

<p>The next step is to have a psychiatric visit with one of our outstanding providers. These highly skilled clinicians have been carefully vetted and trained to provide exceptional psychiatric care. They will work with you to address your mental health concerns and develop a personalized plan, which may include medication. Here’s the link for your visit, which is currently scheduled for [Provider Date and Time]: <a href="[Provider’s Zoom link]" target:"_blank">[Provider’s Zoom link]</a></p>

<p>If you have any issues before, during, or after your visits, don’t hesitate to reach out to us so we can help. We’re here to ensure that you feel informed, supported, and empowered while working towards the best version of yourself.</p>
`;

export const asyncVisit = `
<p>Hey [First name], welcome to Zealthy!</p>

<p>I'm [Coordinator name], your lead Zealthy coordinator. Your coordination team is here to ensure that you receive the highest quality of care with us.</p>

<p>One of our Zealthy providers will be carefully reviewing your medical information and will be in touch with you shortly about next steps. You should hear back within 1-2 business days.</p>

<p>If your prescription request is approved, it will automatically be shipped to your home.</p>

<p>In the meantime, you can reach out to me for anything you need.</p>
`;

export const asyncPrep = `
<p>Hey [First name], welcome to Zealthy!</p>

<p>I'm [Coordinator name], your lead Zealthy coordinator. Your coordination team is here to ensure that you receive the highest quality of care with us.</p>

<p>A medical provider will review your request and determine your eligibility shortly.</p>

<p>In the meantime, you can reach out to me here for anything you need.</p>
`;

export const asyncPrepWithTestingKit = `
<p>Hey [First name], welcome to Zealthy!</p>

<p>I'm [Coordinator name], your lead Zealthy coordinator. Your coordination team is here to ensure that you receive the highest quality of care with us.</p>

<p>Your testing kit will be delivered to your address and you’ll be able to track your testing kit within your Zealthy portal on the home page. Once your lab is completed your provider will be able to review your labs and intake to determine if you’re eligible for PrEP.</p>

<p>In the meantime, you can reach out to me here for anything you need.</p>
`;

export const compoundBundleOnly = `
  <p>Hey [First name], welcome to Zealthy!</p>

  <p>I’m [Coordinator name] and I’ll be your lead coordinator. Your coordination team will be your primary point of contact, ensuring that you have all the support and resources you need.</p>

  <p>Your Zealthy provider will be carefully reviewing your medical information and will be in touch with you shortly about your prescription request and the best next steps for you to achieve lasting weight loss. Typically, you’ll hear from your provider within 1-2 business days via message here and, if prescribed, your first month’s supply of [Compound Medication] will be shipped directly to you with instructions on how to get started.</p>

  <p>If you have any questions or concerns as you wait for your provider to review your responses and create your treatment plan, let me know.</p>
  `;

export const weightLossOralCompound = `
  <p>Hey [First name], welcome to Zealthy!</p>

  <p>I’m [Coordinator name] and I’ll be your lead coordinator. Your coordination team will be your primary point of contact, ensuring that you have all the support and resources you need.</p>

  <p>Your Zealthy provider will be carefully reviewing your medical information and will be in touch with you shortly about your prescription request for oral semaglutide. Typically, you’ll hear from your provider within 1-2 business days via message here and they should be able to walk you through your suggested treatment plan. If your request is approved, you will receive oral semaglutide shipped to your home monthly (or if you chose the quarterly plan, quarterly).</p>

  <p>Your weight loss coach is also here on this chain. Zealthy weight loss coaches are professionals who will provide guidance, support, and expertise as you work towards achieving your weight loss goals. Your coach will work with you to develop a personalized plan, offer nutrition advice, and help you establish healthy lifestyle habits.</p>

  <p>If you have any questions for the Zealthy team, make sure to remind them that you’re on the oral semaglutide bundled plan, which includes your medication.</p>
`;

export const weightLossOnly = `
<p>Hey [First name], welcome to Zealthy!</p> 

<p>I’m [Coordinator name] and I’ll be your lead coordinator. Your coordination team will be your primary point of contact, ensuring that you have all the support and resources you need.</p>

<p>Your Zealthy provider will be carefully reviewing your medical information and will be in touch with you shortly about your prescription request and the best next steps for you to achieve lasting weight loss. Typically, you’ll hear from your provider within 1-2 business days via message here and they should be able to walk you through your suggested treatment plan, including GLP-1 medication if medically appropriate, and next steps.</p>

<p>Your weight loss coach is also here on this chain. Zealthy weight loss coaches are professionals who will provide guidance, support, and expertise as you work towards achieving your weight loss goals. Your coach will work with you to develop a personalized plan, offer nutrition advice, and help you establish healthy lifestyle habits.</p>

<p>If you have any questions or concerns as you wait for your provider to review your responses and determine a treatment plan, let us know.</p>
`;

export const weightLossOnlyNoCompound = `
<p>Hey [First name], welcome to Zealthy!</p> 

<p>I’m [Coordinator name] and I’ll be your lead coordinator. Your coordination team will be your primary point of contact, ensuring that you have all the support and resources you need.</p>

<p>Your Zealthy provider will be carefully reviewing your medical information and will be in touch with you shortly about your prescription request and the best next steps for you to achieve lasting weight loss. Typically, you’ll hear from your provider within 1-2 business days via message here and they should be able to walk you through your suggested treatment plan, including GLP-1 medication if medically appropriate, and next steps.</p>

<p>In case you haven’t already, submit your request to order semaglutide, the main active ingredient in Wegovy and Ozempic, or tirzepatide, the main active ingredient in Mounjaro. You will only pay if your provider prescribes the medication and it is shipped to your home. Here is the link to order: <a href="https://app.getzealthy.com/patient-portal/weight-loss-treatment/compound" target="_blank">https://app.getzealthy.com/patient-portal/weight-loss-treatment/compound</a></p>

<p>Your weight loss coach is also here on this chain. Zealthy weight loss coaches are professionals who will provide guidance, support, and expertise as you work towards achieving your weight loss goals. Your coach will work with you to develop a personalized plan, offer nutrition advice, and help you establish healthy lifestyle habits.</p>

<p>If you have any questions or concerns as you wait for your provider to review your responses and determine a treatment plan, let us know.</p>
`;

export const weightLossOnlyPlusVisit = `
<p>Hey [First name], welcome to Zealthy!</p> 

<p>I’m [Coordinator name] and I’ll be your lead coordinator. Your coordination team will be your primary point of contact, ensuring that you have all the support and resources you need.</p>

<p>Your Zealthy provider will be carefully reviewing your medical information and will reach out to you if they need any additional information before your scheduled video consultation on [Provider Date and Time]. In the consultation, your provider will walk you through your suggested treatment plan, including GLP-1 medication if medically appropriate, and next steps.</p>

<p>Your weight loss coach is also here on this chain. Zealthy weight loss coaches are professionals who will provide guidance, support, and expertise as you work towards achieving your weight loss goals. Your coach will work with you to develop a personalized plan, offer nutrition advice, and help you establish healthy lifestyle habits.</p>

<p>If you have any questions or concerns as you wait for your provider to review your responses and determine a treatment plan, let us know.</p>
`;

export const weightLossAccessOnly = `
<p>Hey [First name], welcome to Zealthy! I’m [Coordinator name] and I’ll be your care coordinator.  I will be your dedicated point of contact, ensuring that you have all the support and resources you need. My goal is to ensure that you receive the highest quality of care and are able to achieve lasting weight loss with us.</p>

<p>The next step is to attend your visit with your Zealthy provider, which is not included in your Zealthy Weight Loss Access Membership plan. Since we accept Medicare in your state, your upcoming visit with your provider should be covered by Medicare. Here’s the link for your visit, which is currently scheduled for [Provider Date and Time]: [Provider’s Zoom link]</p>

<p>Note that your Medicare insurance plan may not cover GLP-1 medications, so you may need to pay out of pocket for your medication if deemed medically appropriate and prescribed. In this case, we can provide affordable out of pocket options for semaglutide, the active ingredient in Ozempic, and tirzepatide, the active ingredient in Mounjaro.</p>

<p>Your weight loss coach, [Coach name], is also here on this chain. Zealthy weight loss coaches are professionals who will provide guidance, support, and expertise as you work towards achieving your weight loss goals. Your coach will work with you to develop a personalized plan, offer nutrition advice, and help you establish healthy lifestyle habits. Note that our weight loss coaches are not licensed dieticians and thus cannot be covered by Medicare.</p>

<p>As a reminder, your Zealthy Weight Loss Access Membership does not include any medical services or anything that would be covered by your Medicare insurance plan. Your Medicare insurance plan will cover your medical visits, which are not covered under your membership.</p>

<p>If you have any questions or concerns leading up to or after your initial visit with your provider, please don't hesitate to reach out to me.</p>
`;

export const skinCareOnly = `
<p>Hey [First name], welcome to Zealthy! I’m [Coordinator name] and I’ll be your care coordinator.  I will be your dedicated point of contact, ensuring that you have all the support and resources you need. My goal is to ensure that you receive the highest quality of care and have a positive journey to better health with us. One of our highly trained Zealthy providers will be carefully reviewing your medical information and will be in touch with you shortly.</p>

<p>Within the next 2 business days, a Zealthy provider will review the information you’ve submitted and, if clinically appropriate, create a prescription skincare treatment plan for you. This treatment will be delivered straight to your door.</p>

<p>If you have any questions or concerns leading up to or after your visit, please don't hesitate to reach out to me.</p>
`;

export const instantVisit = `
<p>Hey [First name], welcome to Zealthy! I’m [Coordinator name] and I’ll be your care coordinator.  I will be your dedicated point of contact, ensuring that you have all the support and resources you need. My goal is to ensure that you receive the highest quality of care and have a positive journey to better health with us. If they haven’t already, your provider will be sending you a summary of today’s visit shortly. In the meantime, I am here to help you with any questions you may have.</p>

<p>I will be working closely with your provider to ensure seamless coordination of your appointments and any necessary follow-up care. If you have any questions or concerns leading up to or after your visit, please don't hesitate to reach out to me.</p>

<p>Once again, welcome to Zealthy. We look forward to partnering with you to achieve your health goals and provide you with exceptional care.</p>
`;

export const instantVisitWeightLoss = `
<p>Hey [First name], welcome to Zealthy! I’m [Coordinator name] and I’ll be your care coordinator.  I will be your dedicated point of contact, ensuring that you have all the support and resources you need. My goal is to ensure that you receive the highest quality of care and have a positive journey to better health with us. If they haven’t already, your provider will be sending you a summary of today’s visit shortly. In the meantime, I am here to help you with any questions you may have.</p>

<p>In the meantime, to expedite the prior authorization process in the event that your provider decides to prescribe weight loss medication, please go to the document upload page and add any results from laboratory work done within the past year. We will also need a picture of the front and back of your insurance card and/or pharmacy benefits card if applicable. In addition to that please let us know about any other methods of weight loss you have tried in the past including medications like metformin, exercise programs, coaching programs like weightwatchers, noom, etc. and if you have any receipts or invoices, please upload those as well. All of this information will help us make the best case possible on your behalf to your insurance company to get the medication covered.</p>

<p>You’ll also hold your first visit with your weight loss coach. Zealthy weight loss coaches are highly trained professionals who will provide guidance, support, and expertise as you work towards achieving your weight loss goals. During your 15 minute sessions every two weeks, they will work with you to develop a personalized plan, offer nutrition advice, and help you establish healthy lifestyle habits. Here’s the link to join for your first 1:1 weight loss coaching visit, which is currently scheduled for [Coach Date and Time]: [Coach’s Zoom link]</p>

<p>I will be working closely with your provider and coach to ensure seamless coordination of your appointments and any necessary follow-up care. If you have any questions or concerns leading up to or after your visit, please don't hesitate to reach out to me.</p>
`;

export const instantVisitMentalHealth = `
<p>Hey [First name], welcome to Zealthy! I’m [Coordinator name] and I’ll be your care coordinator.  I will be your dedicated point of contact, ensuring that you have all the support and resources you need. My goal is to ensure that you receive the highest quality of care and have a positive journey to better health with us. If they haven’t already, your provider will be sending you a summary of today’s visit shortly. In the meantime, I am here to help you with any questions you may have.</p>

<p>You’ll also hold your first visit with your mental health coach. Zealthy mental health coaches have specialized training to provide guidance and support, helping you develop effective coping strategies and enhance your overall well-being. Here’s the link to join for your first 1:1 mental health coaching visit, which is currently scheduled for [Coach Date and Time]: [Coach’s Zoom link]. You will continue to meet with your mental health coach every month for 45 minutes to support you in your mental wellbeing.</p>

<p>I will be working closely with your provider and coach to ensure seamless coordination of your appointments, treatment plans, and any necessary follow-up care. If you have any questions or concerns at any time please don't hesitate to reach out to me.</p>

<p>Once again, welcome to Zealthy. We look forward to partnering with you to achieve your health goals and provide you with exceptional care.</p>
`;

export const enclomipheneTestLabPurchasedOnly = `
<p>Hey [First name], welcome to Zealthy!</p>

<p>I'm [Coordinator name], your lead Zealthy coordinator. Your coordination team is here to ensure that you receive the highest quality of care with us.</p>

<p>We will be sending you a lab kit in the mail to the address in your profile within the next 1-2 days and you will be able to see updates on the home page of your portal.</p>

<p>Make sure to follow the instructions inside the box and scan the QR code on the flyer to schedule your test to be picked up to get your results.</p>

<p>Once we receive your lab results, your provider will update you through the portal and if clinically appropriate your medication will be automatically shipped to your home.</p>

<p>In the meantime, you can reach out to me here for anything you need.</p>
`;

export const enclomipheneUploadOwnTestLabOnly = `
<p>Hey [First name], welcome to Zealthy!</p>

<p>I'm [Coordinator name], your lead Zealthy coordinator. Your coordination team is here to ensure that you receive the highest quality of care with us.</p>

<p>Your Lab results will be reviewed by a provider within the next 1-2 business days. If your prescription request is approved, your provider will update you through the portal and the order will automatically be shipped to your home.</p>

<p>In the meantime, you can reach out to me here for anything you need.</p>
`;

export const weightLossFreeConsult = `
<p>Hey [First name], welcome to Zealthy!</p>

<p>I'm [Coordinator name], your lead Zealthy coordinator. Your coordination team is here to ensure that you receive the highest quality of care with us.</p>

<p>You can reach out to me for anything you need.</p>
`;
