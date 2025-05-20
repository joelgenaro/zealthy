export const STATE_QUERY = `
  *, 
  state_cash_payer(
    accept_treat_me_now
  ), 
  state_clinician(
    *, 
    clinician(
      id, 
      accept_treat_me_now
    )
  )
`;

export const STATE_PAYER_QUERY = `
  *, 
  state_payer(
    *, 
    state_payer_clinician(
      *,
      clinician(
        id,
        accept_treat_me_now
      )
    )
  )
`;
