declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    panel: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    grey: true;
  }
}

declare module '@supabase/supabase-js' {
  interface User {
    session_id: string;
  }
}

export interface Provider {
  honorific: string;
  firstName: string;
  lastName: string;
  specialties: string;
}

export interface ListItem {
  title: string;
  body: string;
}
