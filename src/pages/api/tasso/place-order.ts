import type { NextApiRequest, NextApiResponse } from 'next';
import { createAuthToken } from './createToken';
import axios from 'axios';
import { getServiceSupabase } from '@/utils/supabase';
import { Endpoints } from '@/types/endpoints';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default async function tassoPlaceOrderHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { patient, patientAddress, patientAge, prescriptionRequest, userId } =
      req.body;
    const supabase = getServiceSupabase();

    if (!userId) {
      return res.status(401).json({ error: 'Missing auth token' });
    }

    const isTestAccount = 
      patient?.profiles?.email?.includes('getzealthy') ||
        patient?.profiles?.first_name?.toUpperCase().includes('TEST') ||
        patient?.profiles?.last_name?.toUpperCase().includes('TEST');

    if (isTestAccount) {
      console.log(
        'TEST ACCOUNT DETECTED - Simulating Tasso order without API call'
      );

      const fakeOrderId = `TEST-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      const { data: insertLab, error } = await supabase
        .from('lab_order')
        .insert({
          tasso_order_id: fakeOrderId,
          patient_id: patient?.id,
          status: 'TEST_ACCOUNT_ORDER',
          panel_id: patientAge <= 40 ? 'T186' : 'Y319',
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error inserting test Tasso lab order:', error);
        return res.status(400).json({ error: error.message });
      }

      console.log('Inserted test lab_order record:', insertLab);
      return res.status(200).json({
        message: 'Test account detected. Simulated order placed successfully',
        testOrderId: fakeOrderId,
      });
    }

    const accessToken = await createAuthToken();

    const correctProjectId =
      patientAge <= 40
        ? '02b9f210-621a-42aa-94b4-69c8cef2e55c'
        : '704abead-fdab-4df8-8c4b-40ee3bd955ca';

    const panelId = patientAge <= 40 ? 'T186' : 'Y319';

    // 1) Create the Tasso patient record
    const patientData = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      url: `${process.env.TASSO_ENVIRONMENT}/patients`,
      data: {
        projectId: correctProjectId,
        subjectId: patient?.id?.toString(),
        firstName: patient?.profiles?.first_name,
        lastName: patient?.profiles?.last_name,
        shippingAddress: {
          address1: patientAddress?.address_line_1,
          address2: patientAddress?.address_line_2 || '',
          city: patientAddress?.city,
          district1: patientAddress?.state,
          postalCode: patientAddress?.zip_code,
          country: 'US',
        },
        gender: 'cisMale',
        assignedSex: patient.profiles?.gender,
        dateOfBirth: patient?.profiles?.birth_date,
      },
    };

    const tassoPatientResponse = await axios(patientData);
    console.log('TASSO PATIENT', tassoPatientResponse.data);

    // 2) Create the Tasso order for the new patient
    const orderData = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      url: `${process.env.TASSO_ENVIRONMENT}/orders`,
      data: {
        patientId: tassoPatientResponse.data.results.id,
        provider: {
          npi: {
            id: '1841216629',
            firstName: 'Risheet',
            lastName: 'Patel',
          },
        },
      },
    };

    console.log('TASSO ORDER PAYLOAD:', orderData);
    const tassoOrderResponse = await axios(orderData);
    console.log('TASSO ORDER RESPONSE', tassoOrderResponse.data);

    // 3) If the Tasso order is successful, store it in your lab_order table
    if (tassoOrderResponse?.data?.results?.orderId) {
      const { data: insertLab, error } = await supabase
        .from('lab_order')
        .insert({
          tasso_order_id: tassoOrderResponse.data.results.orderId,
          patient_id: patient?.id,
          status: 'ORDERED',
          panel_id: panelId,
        })
        .select()
        .maybeSingle();

      // 4) Create a task for the coordinator to check the Tasso portal
      const { data: insertedTask, error: taskError } = await supabase
        .from('task_queue')
        .insert({
          patient_id: patient?.id,
          task_type: 'ENCLOMIPHENE_LAB_REQUEST',
          queue_type: 'Coordinator (Enclomiphene Labs)',
          note: `Check the Tasso Portal to ensure the lab kit has been ordered and is appearing in Tasso. Update the patient on the progress of the lab kit at each stage (Ordered, Preparing shipment, Shipped, Tracking number, Delivered). Use the following link to access the Tasso Portal: <a href="https://portal.tassocare.com/projects" target="_blank">Tasso Portal</a>.`,
          visible: true,
        })
        .select()
        .maybeSingle();

      // 5) Create prescription request
      if (prescriptionRequest) {
        const request = await supabase
          .from('prescription_request')
          .insert(prescriptionRequest)
          .select()
          .then(({ data }) => data);

        // 6) Submit questionnaire responses
        const resp = await axios.post(
          `${baseUrl}/api/${Endpoints.SUBMIT_RESPONSES}`,
          {
            user_id: userId,
          }
        );

        if (resp.status !== 200) {
          console.error('Error submitting questionnaire responses:', resp.data);
        }
      }

      if (error) {
        console.error('Error inserting Tasso lab order:', error);
        return res.status(400).json({ error: error.message });
      }

      console.log('Inserted lab_order record:', insertLab);
      return res.status(200).json({ message: 'Order placed successfully' });
    } else {
      return res.status(400).json({
        error: 'Tasso order was unsuccessful',
        details: tassoOrderResponse.data,
      });
    }
  } catch (err: any) {
    console.error('Error in Tasso placeOrderHandler:', err);
    return res.status(500).json({
      error: 'Internal server error placing Tasso order',
      details: err?.message || err,
    });
  }
}
