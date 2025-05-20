const VoiceResponse = require('twilio').twiml.VoiceResponse;

const getReminderOne = () => {
  const response = new VoiceResponse();

  const gather = response.gather({
    numDigits: 1,
    action: 'https://app.getzealthy.com/api/twilio/redirect-call',
    method: 'POST',
  });
  gather.play(
    'https://api.getzealthy.com/storage/v1/object/public/automated_calls/patient%2024%20hour.mp3'
  );
  response.pause({ length: 3 });
  response.hangup();
  return response;
};

const getReminderTwo = () => {
  const response = new VoiceResponse();

  const gather = response.gather({
    numDigits: 1,
    action: 'https://app.getzealthy.com/api/twilio/redirect-call',
    method: 'POST',
  });
  gather.play(
    'https://api.getzealthy.com/storage/v1/object/public/automated_calls/patient%208%20hour.mp3'
  );
  response.pause({ length: 3 });
  response.hangup();
  return response;
};

const getReminderThree = () => {
  const response = new VoiceResponse();

  const gather = response.gather({
    numDigits: 1,
    action: 'https://app.getzealthy.com/api/twilio/redirect-call',
    method: 'POST',
  });
  gather.play(
    'https://api.getzealthy.com/storage/v1/object/public/automated_calls/patient%204%20hours.mp3'
  );
  response.pause({ length: 3 });
  response.hangup();
  return response;
};

const getReminderFour = () => {
  const response = new VoiceResponse();

  const gather = response.gather({
    numDigits: 1,
    action: 'https://app.getzealthy.com/api/twilio/redirect-call',
    method: 'POST',
  });
  gather.play(
    'https://api.getzealthy.com/storage/v1/object/public/automated_calls/patient%2015%20minutes.mp3'
  );
  response.pause({ length: 3 });
  response.hangup();
  return response;
};

export const patientAppointmentReminderOne = getReminderOne();
export const patientAppointmentReminderTwo = getReminderTwo();
export const patientAppointmentReminderThree = getReminderThree();
export const patientAppointmentReminderFour = getReminderFour();
