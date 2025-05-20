const VoiceResponse = require('twilio').twiml.VoiceResponse;

const getReminderOne = () => {
  const response = new VoiceResponse();

  const gather = response.gather({
    numDigits: 1,
    action: 'https://app.getzealthy.com/api/twilio/redirect-call',
    method: 'POST',
  });
  gather.play(
    'https://api.getzealthy.com/storage/v1/object/public/automated_calls/provider%2024%20hour.mp3'
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
    'https://api.getzealthy.com/storage/v1/object/public/automated_calls/provider%208%20hour.mp3'
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
    'https://api.getzealthy.com/storage/v1/object/public/automated_calls/provider%204%20hour.mp3'
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
    'https://api.getzealthy.com/storage/v1/object/public/automated_calls/provider%2015%20minute.mp3'
  );
  response.pause({ length: 3 });
  response.hangup();
  return response;
};

export const providerAppointmentReminderOne = getReminderOne();
export const providerAppointmentReminderTwo = getReminderTwo();
export const providerAppointmentReminderThree = getReminderThree();
export const providerAppointmentReminderFour = getReminderFour();
