const VoiceResponse = require('twilio').twiml.VoiceResponse;
export const response = new VoiceResponse();
response.pause({ length: 3 });
response.say(
  'This is Zealthy calling. You need to answer some questions in your Zealthy portal in order to get your Rx renewed. You can log in on app.gezealthy.com to answer these questions and get your renewal.'
);

response.pause({ length: 3 });
response.hangup();

export const prescriptionRenewalReminderVm = response;
