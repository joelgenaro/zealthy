export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ab_campaign_metric: {
        Row: {
          campaign_key: string | null;
          created_at: string;
          id: number;
          metric_name: string | null;
          profile_id: string | null;
        };
        Insert: {
          campaign_key?: string | null;
          created_at?: string;
          id?: number;
          metric_name?: string | null;
          profile_id?: string | null;
        };
        Update: {
          campaign_key?: string | null;
          created_at?: string;
          id?: number;
          metric_name?: string | null;
          profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'public_ab_campaign_metric_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      ab_campaign_user: {
        Row: {
          campaign_key: string | null;
          created_at: string;
          id: number;
          profile_id: string | null;
          variation_name: string | null;
        };
        Insert: {
          campaign_key?: string | null;
          created_at?: string;
          id?: number;
          profile_id?: string | null;
          variation_name?: string | null;
        };
        Update: {
          campaign_key?: string | null;
          created_at?: string;
          id?: number;
          profile_id?: string | null;
          variation_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'public_ab_campaign_user_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      ab_zealthy_campaign: {
        Row: {
          campaign_key: string;
          created_at: string | null;
          id: string;
          is_in_dev: boolean | null;
          is_in_prod: boolean | null;
          status: string;
          title: string | null;
          traffic_split_percentage: number | null;
        };
        Insert: {
          campaign_key: string;
          created_at?: string | null;
          id?: string;
          is_in_dev?: boolean | null;
          is_in_prod?: boolean | null;
          status?: string;
          title?: string | null;
          traffic_split_percentage?: number | null;
        };
        Update: {
          campaign_key?: string;
          created_at?: string | null;
          id?: string;
          is_in_dev?: boolean | null;
          is_in_prod?: boolean | null;
          status?: string;
          title?: string | null;
          traffic_split_percentage?: number | null;
        };
        Relationships: [];
      };
      ab_zealthy_metric: {
        Row: {
          campaign_key: string;
          created_at: string | null;
          id: string;
          metric_name: string;
        };
        Insert: {
          campaign_key: string;
          created_at?: string | null;
          id?: string;
          metric_name: string;
        };
        Update: {
          campaign_key?: string;
          created_at?: string | null;
          id?: string;
          metric_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ab_zealthy_metric_campaign_key_fkey';
            columns: ['campaign_key'];
            isOneToOne: false;
            referencedRelation: 'ab_zealthy_campaign';
            referencedColumns: ['campaign_key'];
          }
        ];
      };
      ab_zealthy_user_metric: {
        Row: {
          campaign_key: string;
          created_at: string | null;
          id: string;
          metric_name: string;
          profile_id: string;
        };
        Insert: {
          campaign_key: string;
          created_at?: string | null;
          id?: string;
          metric_name: string;
          profile_id: string;
        };
        Update: {
          campaign_key?: string;
          created_at?: string | null;
          id?: string;
          metric_name?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ab_zealthy_user_metric_campaign_key_fkey';
            columns: ['campaign_key'];
            isOneToOne: false;
            referencedRelation: 'ab_zealthy_campaign';
            referencedColumns: ['campaign_key'];
          }
        ];
      };
      ab_zealthy_user_variation: {
        Row: {
          campaign_key: string;
          created_at: string | null;
          id: string;
          profile_id: string;
          variation_name: string;
        };
        Insert: {
          campaign_key: string;
          created_at?: string | null;
          id?: string;
          profile_id: string;
          variation_name: string;
        };
        Update: {
          campaign_key?: string;
          created_at?: string | null;
          id?: string;
          profile_id?: string;
          variation_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ab_zealthy_user_variation_campaign_key_fkey';
            columns: ['campaign_key'];
            isOneToOne: false;
            referencedRelation: 'ab_zealthy_campaign';
            referencedColumns: ['campaign_key'];
          }
        ];
      };
      ab_zealthy_variation: {
        Row: {
          campaign_key: string;
          created_at: string | null;
          id: string;
          variation_name: string;
        };
        Insert: {
          campaign_key: string;
          created_at?: string | null;
          id?: string;
          variation_name: string;
        };
        Update: {
          campaign_key?: string;
          created_at?: string | null;
          id?: string;
          variation_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ab_zealthy_variation_campaign_key_fkey';
            columns: ['campaign_key'];
            isOneToOne: false;
            referencedRelation: 'ab_zealthy_campaign';
            referencedColumns: ['campaign_key'];
          }
        ];
      };
      address: {
        Row: {
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          created_at: string | null;
          patient_id: number;
          state: string;
          updated_address: boolean;
          updated_address_at: string | null;
          updated_at: string | null;
          verified_address: boolean;
          zip_code: string;
        };
        Insert: {
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          created_at?: string | null;
          patient_id: number;
          state: string;
          updated_address?: boolean;
          updated_address_at?: string | null;
          updated_at?: string | null;
          verified_address?: boolean;
          zip_code: string;
        };
        Update: {
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          created_at?: string | null;
          patient_id?: number;
          state?: string;
          updated_address?: boolean;
          updated_address_at?: string | null;
          updated_at?: string | null;
          verified_address?: boolean;
          zip_code?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'address_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: true;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'address_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: true;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      ai_fine_tuning: {
        Row: {
          created_at: string;
          edition: string | null;
          fine_tuned_at: string | null;
          generation: string | null;
          id: number;
          prompt: string | null;
          system_prompt: string | null;
        };
        Insert: {
          created_at?: string;
          edition?: string | null;
          fine_tuned_at?: string | null;
          generation?: string | null;
          id?: number;
          prompt?: string | null;
          system_prompt?: string | null;
        };
        Update: {
          created_at?: string;
          edition?: string | null;
          fine_tuned_at?: string | null;
          generation?: string | null;
          id?: number;
          prompt?: string | null;
          system_prompt?: string | null;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          images: string[] | null;
          is_deleted: boolean;
          is_draft: boolean;
          title: string | null;
          user_type: string[] | null;
          videos: string[] | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          images?: string[] | null;
          is_deleted?: boolean;
          is_draft?: boolean;
          title?: string | null;
          user_type?: string[] | null;
          videos?: string[] | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          images?: string[] | null;
          is_deleted?: boolean;
          is_draft?: boolean;
          title?: string | null;
          user_type?: string[] | null;
          videos?: string[] | null;
        };
        Relationships: [];
      };
      announcements_clinician: {
        Row: {
          announcement_id: number;
          clinician_id: number;
          completed_at: string | null;
          id: number;
        };
        Insert: {
          announcement_id: number;
          clinician_id: number;
          completed_at?: string | null;
          id?: number;
        };
        Update: {
          announcement_id?: number;
          clinician_id?: number;
          completed_at?: string | null;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'announcements_clinician_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_announcements_clinician_announcement_id_fkey';
            columns: ['announcement_id'];
            isOneToOne: false;
            referencedRelation: 'announcements';
            referencedColumns: ['id'];
          }
        ];
      };
      appointment: {
        Row: {
          appointment_type: Database['public']['Enums']['appointment_type'];
          calendarId: string | null;
          cancelation_reason: string | null;
          canceled_at: string | null;
          canvas_appointment_id: string | null;
          care: string | null;
          clinician_id: number | null;
          created_at: string | null;
          daily_room: string | null;
          description: string | null;
          duration: number;
          eligible: boolean | null;
          encounter_type: Database['public']['Enums']['encounter_type'];
          ends_at: string | null;
          feedback: Json | null;
          id: number;
          last_automated_call: string | null;
          location: string;
          onsched_appointment_id: string | null;
          paid: boolean | null;
          patient_id: number;
          patient_joined_at: string | null;
          patient_left_at: string | null;
          payer_name: string | null;
          provider_joined_at: string | null;
          provider_left_at: string | null;
          queue_id: number | null;
          starts_at: string | null;
          status: Database['public']['Enums']['appointment_status'];
          updated_at: string | null;
          visit_type: Database['public']['Enums']['visit_type'] | null;
        };
        Insert: {
          appointment_type: Database['public']['Enums']['appointment_type'];
          calendarId?: string | null;
          cancelation_reason?: string | null;
          canceled_at?: string | null;
          canvas_appointment_id?: string | null;
          care?: string | null;
          clinician_id?: number | null;
          created_at?: string | null;
          daily_room?: string | null;
          description?: string | null;
          duration: number;
          eligible?: boolean | null;
          encounter_type?: Database['public']['Enums']['encounter_type'];
          ends_at?: string | null;
          feedback?: Json | null;
          id?: number;
          last_automated_call?: string | null;
          location: string;
          onsched_appointment_id?: string | null;
          paid?: boolean | null;
          patient_id: number;
          patient_joined_at?: string | null;
          patient_left_at?: string | null;
          payer_name?: string | null;
          provider_joined_at?: string | null;
          provider_left_at?: string | null;
          queue_id?: number | null;
          starts_at?: string | null;
          status?: Database['public']['Enums']['appointment_status'];
          updated_at?: string | null;
          visit_type?: Database['public']['Enums']['visit_type'] | null;
        };
        Update: {
          appointment_type?: Database['public']['Enums']['appointment_type'];
          calendarId?: string | null;
          cancelation_reason?: string | null;
          canceled_at?: string | null;
          canvas_appointment_id?: string | null;
          care?: string | null;
          clinician_id?: number | null;
          created_at?: string | null;
          daily_room?: string | null;
          description?: string | null;
          duration?: number;
          eligible?: boolean | null;
          encounter_type?: Database['public']['Enums']['encounter_type'];
          ends_at?: string | null;
          feedback?: Json | null;
          id?: number;
          last_automated_call?: string | null;
          location?: string;
          onsched_appointment_id?: string | null;
          paid?: boolean | null;
          patient_id?: number;
          patient_joined_at?: string | null;
          patient_left_at?: string | null;
          payer_name?: string | null;
          provider_joined_at?: string | null;
          provider_left_at?: string | null;
          queue_id?: number | null;
          starts_at?: string | null;
          status?: Database['public']['Enums']['appointment_status'];
          updated_at?: string | null;
          visit_type?: Database['public']['Enums']['visit_type'] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'appointment_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'appointment_duration_fkey';
            columns: ['duration'];
            isOneToOne: false;
            referencedRelation: 'encounter_duration';
            referencedColumns: ['duration'];
          },
          {
            foreignKeyName: 'appointment_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'appointment_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'public_appointment_queue_id_fkey';
            columns: ['queue_id'];
            isOneToOne: false;
            referencedRelation: 'task_queue';
            referencedColumns: ['id'];
          }
        ];
      };
      audit: {
        Row: {
          completed_at: string | null;
          created_at: string;
          id: number;
          is_chart_review: boolean;
          is_patient: boolean;
          patient_note: string | null;
          review_score: number | null;
          reviewee_id: string | null;
          reviewer_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          completed_at?: string | null;
          created_at: string;
          id?: number;
          is_chart_review?: boolean;
          is_patient?: boolean;
          patient_note?: string | null;
          review_score?: number | null;
          reviewee_id?: string | null;
          reviewer_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          id?: number;
          is_chart_review?: boolean;
          is_patient?: boolean;
          patient_note?: string | null;
          review_score?: number | null;
          reviewee_id?: string | null;
          reviewer_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_reviewee_id_fkey';
            columns: ['reviewee_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'audit_reviewer_id_fkey';
            columns: ['reviewer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      audit_items: {
        Row: {
          audit_id: number | null;
          coach_score: number | null;
          coordinator_score: number | null;
          created_at: string;
          id: number;
          provider_clinical_rationale: number | null;
          provider_operational_score: number | null;
          review_note: string | null;
          reviewed_at: string | null;
          task_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          audit_id?: number | null;
          coach_score?: number | null;
          coordinator_score?: number | null;
          created_at?: string;
          id?: number;
          provider_clinical_rationale?: number | null;
          provider_operational_score?: number | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          task_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          audit_id?: number | null;
          coach_score?: number | null;
          coordinator_score?: number | null;
          created_at?: string;
          id?: number;
          provider_clinical_rationale?: number | null;
          provider_operational_score?: number | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          task_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_items_audit_id_fkey';
            columns: ['audit_id'];
            isOneToOne: false;
            referencedRelation: 'audit';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'audit_items_task_id_fkey';
            columns: ['task_id'];
            isOneToOne: false;
            referencedRelation: 'task_queue';
            referencedColumns: ['id'];
          }
        ];
      };
      bug_report: {
        Row: {
          action_taken: string | null;
          bug_description: string | null;
          bug_type: string | null;
          comment: string | null;
          created_at: string;
          how_description: string | null;
          id: number;
          patient_link: string | null;
          reporter_id: number | null;
          screen_recording: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          action_taken?: string | null;
          bug_description?: string | null;
          bug_type?: string | null;
          comment?: string | null;
          created_at?: string;
          how_description?: string | null;
          id?: number;
          patient_link?: string | null;
          reporter_id?: number | null;
          screen_recording?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          action_taken?: string | null;
          bug_description?: string | null;
          bug_type?: string | null;
          comment?: string | null;
          created_at?: string;
          how_description?: string | null;
          id?: number;
          patient_link?: string | null;
          reporter_id?: number | null;
          screen_recording?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'public_bug_report_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_bug_report_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      clinic_favorites: {
        Row: {
          active: boolean;
          created_at: string | null;
          DaysSupply: number | null;
          DispensableDrugId: number | null;
          dispense: number | null;
          DispenseUnitTypeID: number | null;
          DosageText: string | null;
          EmpowerDesignatorID: string | null;
          GoGoMedsNDC: string | null;
          id: number;
          MedDisplayName: string | null;
          MedFullName: string | null;
          medication_quantity_id: number | null;
          MedStrengthString: string | null;
          method: string | null;
          NDC: string | null;
          NoSubstitutions: number | null;
          Notes: string | null;
          pharmacy_price: number | null;
          PharmacyID: number | null;
          price: number | null;
          Refills: number | null;
          Title: string | null;
          type: Database['public']['Enums']['medication_type'] | null;
        };
        Insert: {
          active?: boolean;
          created_at?: string | null;
          DaysSupply?: number | null;
          DispensableDrugId?: number | null;
          dispense?: number | null;
          DispenseUnitTypeID?: number | null;
          DosageText?: string | null;
          EmpowerDesignatorID?: string | null;
          GoGoMedsNDC?: string | null;
          id?: number;
          MedDisplayName?: string | null;
          MedFullName?: string | null;
          medication_quantity_id?: number | null;
          MedStrengthString?: string | null;
          method?: string | null;
          NDC?: string | null;
          NoSubstitutions?: number | null;
          Notes?: string | null;
          pharmacy_price?: number | null;
          PharmacyID?: number | null;
          price?: number | null;
          Refills?: number | null;
          Title?: string | null;
          type?: Database['public']['Enums']['medication_type'] | null;
        };
        Update: {
          active?: boolean;
          created_at?: string | null;
          DaysSupply?: number | null;
          DispensableDrugId?: number | null;
          dispense?: number | null;
          DispenseUnitTypeID?: number | null;
          DosageText?: string | null;
          EmpowerDesignatorID?: string | null;
          GoGoMedsNDC?: string | null;
          id?: number;
          MedDisplayName?: string | null;
          MedFullName?: string | null;
          medication_quantity_id?: number | null;
          MedStrengthString?: string | null;
          method?: string | null;
          NDC?: string | null;
          NoSubstitutions?: number | null;
          Notes?: string | null;
          pharmacy_price?: number | null;
          PharmacyID?: number | null;
          price?: number | null;
          Refills?: number | null;
          Title?: string | null;
          type?: Database['public']['Enums']['medication_type'] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'public_clinic_favorites_medication_quantity_id_fkey';
            columns: ['medication_quantity_id'];
            isOneToOne: false;
            referencedRelation: 'medication_quantity';
            referencedColumns: ['id'];
          }
        ];
      };
      clinician: {
        Row: {
          accept_treat_me_now: boolean;
          accepts_bmi_under_27: boolean;
          accepts_bmi_under_30: boolean;
          average_score: number | null;
          bio: string | null;
          calendly_link: string | null;
          canvas_practitioner_id: string | null;
          created_at: string | null;
          daily_room: string | null;
          dosespot_confirmed: boolean | null;
          dosespot_coordinator_id: number | null;
          dosespot_idp_completed: boolean | null;
          dosespot_notifications_count: number | null;
          dosespot_provider_id: number | null;
          enable_bmi_toggle: boolean;
          free_consult_eligible: boolean;
          id: number;
          is_available_to_live_chat: boolean;
          is_online: boolean;
          last_seen_at: string | null;
          npi_key: string | null;
          patient_average: number;
          profile_id: string;
          queue_ban_until: string | null;
          spanish_speaker: boolean;
          specialties: string | null;
          status: Database['public']['Enums']['provider_status'];
          supervisor: number | null;
          type: Database['public']['Enums']['provider_type'][];
          updated_at: string | null;
          zendesk_id: string | null;
          zoom_link: string | null;
        };
        Insert: {
          accept_treat_me_now?: boolean;
          accepts_bmi_under_27?: boolean;
          accepts_bmi_under_30?: boolean;
          average_score?: number | null;
          bio?: string | null;
          calendly_link?: string | null;
          canvas_practitioner_id?: string | null;
          created_at?: string | null;
          daily_room?: string | null;
          dosespot_confirmed?: boolean | null;
          dosespot_coordinator_id?: number | null;
          dosespot_idp_completed?: boolean | null;
          dosespot_notifications_count?: number | null;
          dosespot_provider_id?: number | null;
          enable_bmi_toggle?: boolean;
          free_consult_eligible?: boolean;
          id?: number;
          is_available_to_live_chat?: boolean;
          is_online?: boolean;
          last_seen_at?: string | null;
          npi_key?: string | null;
          patient_average?: number;
          profile_id: string;
          queue_ban_until?: string | null;
          spanish_speaker?: boolean;
          specialties?: string | null;
          status?: Database['public']['Enums']['provider_status'];
          supervisor?: number | null;
          type: Database['public']['Enums']['provider_type'][];
          updated_at?: string | null;
          zendesk_id?: string | null;
          zoom_link?: string | null;
        };
        Update: {
          accept_treat_me_now?: boolean;
          accepts_bmi_under_27?: boolean;
          accepts_bmi_under_30?: boolean;
          average_score?: number | null;
          bio?: string | null;
          calendly_link?: string | null;
          canvas_practitioner_id?: string | null;
          created_at?: string | null;
          daily_room?: string | null;
          dosespot_confirmed?: boolean | null;
          dosespot_coordinator_id?: number | null;
          dosespot_idp_completed?: boolean | null;
          dosespot_notifications_count?: number | null;
          dosespot_provider_id?: number | null;
          enable_bmi_toggle?: boolean;
          free_consult_eligible?: boolean;
          id?: number;
          is_available_to_live_chat?: boolean;
          is_online?: boolean;
          last_seen_at?: string | null;
          npi_key?: string | null;
          patient_average?: number;
          profile_id?: string;
          queue_ban_until?: string | null;
          spanish_speaker?: boolean;
          specialties?: string | null;
          status?: Database['public']['Enums']['provider_status'];
          supervisor?: number | null;
          type?: Database['public']['Enums']['provider_type'][];
          updated_at?: string | null;
          zendesk_id?: string | null;
          zoom_link?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'clinician_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'clinician_supervisor_fkey';
            columns: ['supervisor'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          }
        ];
      };
      clinician_blocked_hours: {
        Row: {
          block_id: string | null;
          clinician_id: number | null;
          created_at: string;
          date: string | null;
          end_time: number | null;
          id: number;
          reason: string | null;
          start_time: number | null;
        };
        Insert: {
          block_id?: string | null;
          clinician_id?: number | null;
          created_at?: string;
          date?: string | null;
          end_time?: number | null;
          id?: number;
          reason?: string | null;
          start_time?: number | null;
        };
        Update: {
          block_id?: string | null;
          clinician_id?: number | null;
          created_at?: string;
          date?: string | null;
          end_time?: number | null;
          id?: number;
          reason?: string | null;
          start_time?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'clinician_blocked_hours_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          }
        ];
      };
      clinician_compliance: {
        Row: {
          concern: string;
          created_at: string;
          id: number;
        };
        Insert: {
          concern?: string;
          created_at?: string;
          id?: number;
        };
        Update: {
          concern?: string;
          created_at?: string;
          id?: number;
        };
        Relationships: [];
      };
      clinician_decision: {
        Row: {
          clinician_id: number | null;
          created_at: string;
          decision_made: string | null;
          id: number;
          patient_id: number | null;
          prior_auth_id: number | null;
          value: number | null;
        };
        Insert: {
          clinician_id?: number | null;
          created_at?: string;
          decision_made?: string | null;
          id?: number;
          patient_id?: number | null;
          prior_auth_id?: number | null;
          value?: number | null;
        };
        Update: {
          clinician_id?: number | null;
          created_at?: string;
          decision_made?: string | null;
          id?: number;
          patient_id?: number | null;
          prior_auth_id?: number | null;
          value?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'clinician_decision_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'clinician_decision_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'clinician_decision_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'clinician_decision_prior_auth_id_fkey';
            columns: ['prior_auth_id'];
            isOneToOne: false;
            referencedRelation: 'prior_auth';
            referencedColumns: ['id'];
          }
        ];
      };
      clinician_macro: {
        Row: {
          active: boolean;
          category: string | null;
          contains_phi: boolean;
          created_at: string;
          id: number;
          is_common_provider_link: boolean;
          name: string | null;
          popup_text: string | null;
          require_popup: boolean | null;
          subscription: string[] | null;
          template: string | null;
          what_to_update: string | null;
          when_to_send: string | null;
        };
        Insert: {
          active?: boolean;
          category?: string | null;
          contains_phi?: boolean;
          created_at?: string;
          id?: number;
          is_common_provider_link?: boolean;
          name?: string | null;
          popup_text?: string | null;
          require_popup?: boolean | null;
          subscription?: string[] | null;
          template?: string | null;
          what_to_update?: string | null;
          when_to_send?: string | null;
        };
        Update: {
          active?: boolean;
          category?: string | null;
          contains_phi?: boolean;
          created_at?: string;
          id?: number;
          is_common_provider_link?: boolean;
          name?: string | null;
          popup_text?: string | null;
          require_popup?: boolean | null;
          subscription?: string[] | null;
          template?: string | null;
          what_to_update?: string | null;
          when_to_send?: string | null;
        };
        Relationships: [];
      };
      clinician_macro_logic: {
        Row: {
          action: string[] | null;
          created_at: string;
          id: number;
          macro_id: number | null;
          medication_name: string | null;
          onboarding_status: string[] | null;
          payment_status: string[] | null;
          pharmacy: string | null;
          prescription_type: string[] | null;
          rx_duration: string[] | null;
          subscription_status: string[] | null;
          subscription_type: string[] | null;
          user: string[] | null;
        };
        Insert: {
          action?: string[] | null;
          created_at?: string;
          id?: number;
          macro_id?: number | null;
          medication_name?: string | null;
          onboarding_status?: string[] | null;
          payment_status?: string[] | null;
          pharmacy?: string | null;
          prescription_type?: string[] | null;
          rx_duration?: string[] | null;
          subscription_status?: string[] | null;
          subscription_type?: string[] | null;
          user?: string[] | null;
        };
        Update: {
          action?: string[] | null;
          created_at?: string;
          id?: number;
          macro_id?: number | null;
          medication_name?: string | null;
          onboarding_status?: string[] | null;
          payment_status?: string[] | null;
          pharmacy?: string | null;
          prescription_type?: string[] | null;
          rx_duration?: string[] | null;
          subscription_status?: string[] | null;
          subscription_type?: string[] | null;
          user?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'clinician_macro_logic_macro_id_fkey';
            columns: ['macro_id'];
            isOneToOne: false;
            referencedRelation: 'clinician_macro';
            referencedColumns: ['id'];
          }
        ];
      };
      clinician_note: {
        Row: {
          amended: boolean | null;
          clinician_id: number | null;
          created_at: string;
          id: number;
          note: string | null;
          note_id: string | null;
          patient_id: number | null;
          signed: boolean | null;
          type: Database['public']['Enums']['clinician_note_type'];
          updated_at: string | null;
          version: number | null;
        };
        Insert: {
          amended?: boolean | null;
          clinician_id?: number | null;
          created_at?: string;
          id?: number;
          note?: string | null;
          note_id?: string | null;
          patient_id?: number | null;
          signed?: boolean | null;
          type?: Database['public']['Enums']['clinician_note_type'];
          updated_at?: string | null;
          version?: number | null;
        };
        Update: {
          amended?: boolean | null;
          clinician_id?: number | null;
          created_at?: string;
          id?: number;
          note?: string | null;
          note_id?: string | null;
          patient_id?: number | null;
          signed?: boolean | null;
          type?: Database['public']['Enums']['clinician_note_type'];
          updated_at?: string | null;
          version?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'clinician_note_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'clinician_note_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'clinician_note_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      clinician_nurse_order: {
        Row: {
          amended: boolean | null;
          clinician_id: number | null;
          created_at: string;
          id: number;
          note: string | null;
          note_id: string | null;
          patient_id: number | null;
          prescription_request_id: number | null;
          queue_id: number | null;
          signed: boolean | null;
          updated_at: string | null;
          version: number | null;
        };
        Insert: {
          amended?: boolean | null;
          clinician_id?: number | null;
          created_at?: string;
          id?: number;
          note?: string | null;
          note_id?: string | null;
          patient_id?: number | null;
          prescription_request_id?: number | null;
          queue_id?: number | null;
          signed?: boolean | null;
          updated_at?: string | null;
          version?: number | null;
        };
        Update: {
          amended?: boolean | null;
          clinician_id?: number | null;
          created_at?: string;
          id?: number;
          note?: string | null;
          note_id?: string | null;
          patient_id?: number | null;
          prescription_request_id?: number | null;
          queue_id?: number | null;
          signed?: boolean | null;
          updated_at?: string | null;
          version?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'public_clinician_nurse_order_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_clinician_nurse_order_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_clinician_nurse_order_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'public_clinician_nurse_order_prescription_request_id_fkey';
            columns: ['prescription_request_id'];
            isOneToOne: false;
            referencedRelation: 'prescription_request';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_clinician_nurse_order_queue_id_fkey';
            columns: ['queue_id'];
            isOneToOne: false;
            referencedRelation: 'task_queue';
            referencedColumns: ['id'];
          }
        ];
      };
      clinician_open_hours: {
        Row: {
          active: boolean | null;
          clinician_id: number;
          created_at: string;
          day: string;
          end: string | null;
          id: number;
          start: string | null;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          clinician_id: number;
          created_at?: string;
          day: string;
          end?: string | null;
          id?: number;
          start?: string | null;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          clinician_id?: number;
          created_at?: string;
          day?: string;
          end?: string | null;
          id?: number;
          start?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'public_clinician_open_hours_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          }
        ];
      };
      compound_matrix: {
        Row: {
          active: boolean | null;
          bundled_prescribe_macro: number | null;
          charge: boolean | null;
          created_at: string;
          current_month: number | null;
          dosage_instructions: string[] | null;
          dose: string | null;
          dose_spanish: string | null;
          duration_in_days: number | null;
          id: number;
          laymans_instructions: string | null;
          laymans_instructions_spanish: string | null;
          number_of_vials: number | null;
          pharmacy: string | null;
          pharmacy_price: number | null;
          price: number;
          shipment_breakdown: Json[] | null;
          states: string[] | null;
          subscription_plan: string | null;
          unbundled_prescribe_macro: number | null;
          updated_at: string | null;
          vial_label: string | null;
          vial_label_spanish: string | null;
          vial_size: string | null;
        };
        Insert: {
          active?: boolean | null;
          bundled_prescribe_macro?: number | null;
          charge?: boolean | null;
          created_at?: string;
          current_month?: number | null;
          dosage_instructions?: string[] | null;
          dose?: string | null;
          dose_spanish?: string | null;
          duration_in_days?: number | null;
          id?: number;
          laymans_instructions?: string | null;
          laymans_instructions_spanish?: string | null;
          number_of_vials?: number | null;
          pharmacy?: string | null;
          pharmacy_price?: number | null;
          price: number;
          shipment_breakdown?: Json[] | null;
          states?: string[] | null;
          subscription_plan?: string | null;
          unbundled_prescribe_macro?: number | null;
          updated_at?: string | null;
          vial_label?: string | null;
          vial_label_spanish?: string | null;
          vial_size?: string | null;
        };
        Update: {
          active?: boolean | null;
          bundled_prescribe_macro?: number | null;
          charge?: boolean | null;
          created_at?: string;
          current_month?: number | null;
          dosage_instructions?: string[] | null;
          dose?: string | null;
          dose_spanish?: string | null;
          duration_in_days?: number | null;
          id?: number;
          laymans_instructions?: string | null;
          laymans_instructions_spanish?: string | null;
          number_of_vials?: number | null;
          pharmacy?: string | null;
          pharmacy_price?: number | null;
          price?: number;
          shipment_breakdown?: Json[] | null;
          states?: string[] | null;
          subscription_plan?: string | null;
          unbundled_prescribe_macro?: number | null;
          updated_at?: string | null;
          vial_label?: string | null;
          vial_label_spanish?: string | null;
          vial_size?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'compound_matrix_bundled_prescribe_macro_fkey';
            columns: ['bundled_prescribe_macro'];
            isOneToOne: false;
            referencedRelation: 'clinician_macro';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'compound_matrix_unbundled_prescribe_macro_fkey';
            columns: ['unbundled_prescribe_macro'];
            isOneToOne: false;
            referencedRelation: 'clinician_macro';
            referencedColumns: ['id'];
          }
        ];
      };
      compound_medication: {
        Row: {
          ca_nv_id: string | null;
          created_at: string;
          dosage_instructions: string[] | null;
          duration_in_days: number | null;
          id: number;
          medication_id: string | null;
          name: string | null;
          order_name: string | null;
          pharmacy: string | null;
          updated_at: string | null;
        };
        Insert: {
          ca_nv_id?: string | null;
          created_at?: string;
          dosage_instructions?: string[] | null;
          duration_in_days?: number | null;
          id?: number;
          medication_id?: string | null;
          name?: string | null;
          order_name?: string | null;
          pharmacy?: string | null;
          updated_at?: string | null;
        };
        Update: {
          ca_nv_id?: string | null;
          created_at?: string;
          dosage_instructions?: string[] | null;
          duration_in_days?: number | null;
          id?: number;
          medication_id?: string | null;
          name?: string | null;
          order_name?: string | null;
          pharmacy?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      compound_option: {
        Row: {
          created_at: string;
          id: number;
          medication_id: number | null;
          pharmacy_dosage_instructions: string | null;
          shipment_num: number;
          total_vial_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          medication_id?: number | null;
          pharmacy_dosage_instructions?: string | null;
          shipment_num?: number;
          total_vial_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          medication_id?: number | null;
          pharmacy_dosage_instructions?: string | null;
          shipment_num?: number;
          total_vial_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'compound_option_medication_id_fkey';
            columns: ['medication_id'];
            isOneToOne: false;
            referencedRelation: 'compound_medication';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'compound_option_total_vial_id_fkey';
            columns: ['total_vial_id'];
            isOneToOne: false;
            referencedRelation: 'compound_matrix';
            referencedColumns: ['id'];
          }
        ];
      };
      coupon_code: {
        Row: {
          active: boolean | null;
          code: string;
          created_at: string;
          name: string | null;
          source: Database['public']['Enums']['coupon_source_type'] | null;
          unit: Database['public']['Enums']['coupon_unit_type'] | null;
          value: number | null;
        };
        Insert: {
          active?: boolean | null;
          code: string;
          created_at?: string;
          name?: string | null;
          source?: Database['public']['Enums']['coupon_source_type'] | null;
          unit?: Database['public']['Enums']['coupon_unit_type'] | null;
          value?: number | null;
        };
        Update: {
          active?: boolean | null;
          code?: string;
          created_at?: string;
          name?: string | null;
          source?: Database['public']['Enums']['coupon_source_type'] | null;
          unit?: Database['public']['Enums']['coupon_unit_type'] | null;
          value?: number | null;
        };
        Relationships: [];
      };
      coupon_code_redeem: {
        Row: {
          code: string;
          created_at: string;
          id: number;
          profile_id: string;
          redeemed: boolean | null;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: number;
          profile_id: string;
          redeemed?: boolean | null;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: number;
          profile_id?: string;
          redeemed?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'coupon_code_redeem_code_fkey';
            columns: ['code'];
            isOneToOne: false;
            referencedRelation: 'coupon_code';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'coupon_code_redeem_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      coupon_subscription: {
        Row: {
          coupon_id: string;
          created_at: string | null;
          subscription_id: number;
        };
        Insert: {
          coupon_id: string;
          created_at?: string | null;
          subscription_id: number;
        };
        Update: {
          coupon_id?: string;
          created_at?: string | null;
          subscription_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'coupon_subscription_coupon_id_fkey';
            columns: ['coupon_id'];
            isOneToOne: false;
            referencedRelation: 'coupon_code';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'fk_subscription';
            columns: ['subscription_id'];
            isOneToOne: false;
            referencedRelation: 'subscription';
            referencedColumns: ['id'];
          }
        ];
      };
      dosage: {
        Row: {
          created_at: string | null;
          dosage: string;
          id: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          dosage: string;
          id?: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          dosage?: string;
          id?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      dunned_invoices: {
        Row: {
          amount: number | null;
          dunned_at: string;
          patient_id: number | null;
          reference_id: string;
        };
        Insert: {
          amount?: number | null;
          dunned_at?: string;
          patient_id?: number | null;
          reference_id: string;
        };
        Update: {
          amount?: number | null;
          dunned_at?: string;
          patient_id?: number | null;
          reference_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'dunned_invoices_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'dunned_invoices_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'dunned_invoices_reference_id_fkey';
            columns: ['reference_id'];
            isOneToOne: true;
            referencedRelation: 'invoice';
            referencedColumns: ['reference_id'];
          },
          {
            foreignKeyName: 'dunned_invoices_reference_id_fkey';
            columns: ['reference_id'];
            isOneToOne: true;
            referencedRelation: 'invoice_with_emails';
            referencedColumns: ['reference_id'];
          }
        ];
      };
      dunning_history: {
        Row: {
          created_at: string;
          date: string | null;
          first: string | null;
          id: number;
          last: string | null;
          total_dunned: number | null;
          type: string | null;
        };
        Insert: {
          created_at?: string;
          date?: string | null;
          first?: string | null;
          id?: number;
          last?: string | null;
          total_dunned?: number | null;
          type?: string | null;
        };
        Update: {
          created_at?: string;
          date?: string | null;
          first?: string | null;
          id?: number;
          last?: string | null;
          total_dunned?: number | null;
          type?: string | null;
        };
        Relationships: [];
      };
      encounter: {
        Row: {
          clinician: string | null;
          clinician_joined_at: string | null;
          clinician_left_at: string | null;
          ended_at: string | null;
          meeting_id: string | null;
          patient: string | null;
          patient_joined_at: string | null;
          patient_left_at: string | null;
          room_id: string;
          started_at: string | null;
        };
        Insert: {
          clinician?: string | null;
          clinician_joined_at?: string | null;
          clinician_left_at?: string | null;
          ended_at?: string | null;
          meeting_id?: string | null;
          patient?: string | null;
          patient_joined_at?: string | null;
          patient_left_at?: string | null;
          room_id: string;
          started_at?: string | null;
        };
        Update: {
          clinician?: string | null;
          clinician_joined_at?: string | null;
          clinician_left_at?: string | null;
          ended_at?: string | null;
          meeting_id?: string | null;
          patient?: string | null;
          patient_joined_at?: string | null;
          patient_left_at?: string | null;
          room_id?: string;
          started_at?: string | null;
        };
        Relationships: [];
      };
      encounter_duration: {
        Row: {
          created_at: string | null;
          duration: number;
          id: number;
          price: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          duration: number;
          id?: number;
          price: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          duration?: number;
          id?: number;
          price?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      faxes: {
        Row: {
          category: string | null;
          code: number | null;
          created_at: string;
          direction: string | null;
          fax_call_end: number | null;
          fax_call_length: number | null;
          fax_call_start: number | null;
          fax_status: string | null;
          fax_total_pages: number | null;
          fax_transferred_pages: number | null;
          from_number: string | null;
          id: number;
          internal_status: string | null;
          job_id: number | null;
          message: string | null;
          patient_id: number | null;
          success: boolean | null;
          to_number: string | null;
          transaction_id: number | null;
          uploaded_fax: string | null;
          visible: boolean;
        };
        Insert: {
          category?: string | null;
          code?: number | null;
          created_at?: string;
          direction?: string | null;
          fax_call_end?: number | null;
          fax_call_length?: number | null;
          fax_call_start?: number | null;
          fax_status?: string | null;
          fax_total_pages?: number | null;
          fax_transferred_pages?: number | null;
          from_number?: string | null;
          id?: number;
          internal_status?: string | null;
          job_id?: number | null;
          message?: string | null;
          patient_id?: number | null;
          success?: boolean | null;
          to_number?: string | null;
          transaction_id?: number | null;
          uploaded_fax?: string | null;
          visible?: boolean;
        };
        Update: {
          category?: string | null;
          code?: number | null;
          created_at?: string;
          direction?: string | null;
          fax_call_end?: number | null;
          fax_call_length?: number | null;
          fax_call_start?: number | null;
          fax_status?: string | null;
          fax_total_pages?: number | null;
          fax_transferred_pages?: number | null;
          from_number?: string | null;
          id?: number;
          internal_status?: string | null;
          job_id?: number | null;
          message?: string | null;
          patient_id?: number | null;
          success?: boolean | null;
          to_number?: string | null;
          transaction_id?: number | null;
          uploaded_fax?: string | null;
          visible?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'faxes_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'faxes_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      feature_flags: {
        Row: {
          created_at: string;
          flags: Json | null;
          profile_id: string;
        };
        Insert: {
          created_at?: string;
          flags?: Json | null;
          profile_id?: string;
        };
        Update: {
          created_at?: string;
          flags?: Json | null;
          profile_id?: string;
        };
        Relationships: [];
      };
      global: {
        Row: {
          key: string;
          value: string | null;
        };
        Insert: {
          key: string;
          value?: string | null;
        };
        Update: {
          key?: string;
          value?: string | null;
        };
        Relationships: [];
      };
      insurance_policy: {
        Row: {
          canvas_coverage_id: string | null;
          created_at: string | null;
          id: number;
          is_dependent: boolean;
          member_id: string;
          member_obligation: number | null;
          out_of_network: boolean | null;
          patient_id: number;
          payer_id: number;
          plan_name: string | null;
          plan_status: string | null;
          plan_type: string | null;
          policy_type: Database['public']['Enums']['insurance_policy_type'];
          policyholder_first_name: string;
          policyholder_last_name: string;
          updated_at: string | null;
        };
        Insert: {
          canvas_coverage_id?: string | null;
          created_at?: string | null;
          id?: number;
          is_dependent: boolean;
          member_id: string;
          member_obligation?: number | null;
          out_of_network?: boolean | null;
          patient_id: number;
          payer_id: number;
          plan_name?: string | null;
          plan_status?: string | null;
          plan_type?: string | null;
          policy_type?: Database['public']['Enums']['insurance_policy_type'];
          policyholder_first_name: string;
          policyholder_last_name: string;
          updated_at?: string | null;
        };
        Update: {
          canvas_coverage_id?: string | null;
          created_at?: string | null;
          id?: number;
          is_dependent?: boolean;
          member_id?: string;
          member_obligation?: number | null;
          out_of_network?: boolean | null;
          patient_id?: number;
          payer_id?: number;
          plan_name?: string | null;
          plan_status?: string | null;
          plan_type?: string | null;
          policy_type?: Database['public']['Enums']['insurance_policy_type'];
          policyholder_first_name?: string;
          policyholder_last_name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'insurance_policy_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'insurance_policy_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'insurance_policy_payer_id_fkey';
            columns: ['payer_id'];
            isOneToOne: false;
            referencedRelation: 'payer';
            referencedColumns: ['id'];
          }
        ];
      };
      internal_note: {
        Row: {
          clinician_id: number | null;
          created_at: string;
          id: number;
          note: string | null;
          note_id: string | null;
          patient_id: number | null;
        };
        Insert: {
          clinician_id?: number | null;
          created_at?: string;
          id?: number;
          note?: string | null;
          note_id?: string | null;
          patient_id?: number | null;
        };
        Update: {
          clinician_id?: number | null;
          created_at?: string;
          id?: number;
          note?: string | null;
          note_id?: string | null;
          patient_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'internal_note_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_internal_note_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_internal_note_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      invoice: {
        Row: {
          amount_due: number | null;
          amount_paid: number;
          amount_refunded: number | null;
          attempted_count: number;
          auto_advance: boolean;
          billing_reason: string | null;
          cancellation_screenshot: string | null;
          care: string | null;
          charge: string | null;
          collection_method: string;
          created_at: string;
          description: string | null;
          from_payment_intent: string | null;
          is_refunded: boolean | null;
          last_zealthy_attempt: string | null;
          next_payment_attempt: string | null;
          patient_id: number;
          product: string | null;
          reason_for_refund: string | null;
          reason_for_refund_img: string | null;
          reference_id: string;
          refunded_at: string | null;
          refunded_by: string | null;
          status: string;
          subscription: string | null;
          uncaptured_payment_intent_id: string | null;
          updated_at: string | null;
          zealthy_attempts: number;
        };
        Insert: {
          amount_due?: number | null;
          amount_paid: number;
          amount_refunded?: number | null;
          attempted_count: number;
          auto_advance: boolean;
          billing_reason?: string | null;
          cancellation_screenshot?: string | null;
          care?: string | null;
          charge?: string | null;
          collection_method: string;
          created_at?: string;
          description?: string | null;
          from_payment_intent?: string | null;
          is_refunded?: boolean | null;
          last_zealthy_attempt?: string | null;
          next_payment_attempt?: string | null;
          patient_id: number;
          product?: string | null;
          reason_for_refund?: string | null;
          reason_for_refund_img?: string | null;
          reference_id: string;
          refunded_at?: string | null;
          refunded_by?: string | null;
          status: string;
          subscription?: string | null;
          uncaptured_payment_intent_id?: string | null;
          updated_at?: string | null;
          zealthy_attempts?: number;
        };
        Update: {
          amount_due?: number | null;
          amount_paid?: number;
          amount_refunded?: number | null;
          attempted_count?: number;
          auto_advance?: boolean;
          billing_reason?: string | null;
          cancellation_screenshot?: string | null;
          care?: string | null;
          charge?: string | null;
          collection_method?: string;
          created_at?: string;
          description?: string | null;
          from_payment_intent?: string | null;
          is_refunded?: boolean | null;
          last_zealthy_attempt?: string | null;
          next_payment_attempt?: string | null;
          patient_id?: number;
          product?: string | null;
          reason_for_refund?: string | null;
          reason_for_refund_img?: string | null;
          reference_id?: string;
          refunded_at?: string | null;
          refunded_by?: string | null;
          status?: string;
          subscription?: string | null;
          uncaptured_payment_intent_id?: string | null;
          updated_at?: string | null;
          zealthy_attempts?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'invoice_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoice_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'public_invoice_refunded_by_fkey';
            columns: ['refunded_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      lab_order: {
        Row: {
          canvas_lab_order_id: string | null;
          clinician_id: number | null;
          created_at: string | null;
          date_delivered: string | null;
          date_shipped: string | null;
          error_details: string | null;
          errored: boolean;
          fasting: boolean | null;
          id: number;
          panel_id: string | null;
          patient_id: number | null;
          status: string | null;
          tasso_order_id: string | null;
          tasso_tracking_number: string | null;
          tracking_url: string | null;
          updated_at: string | null;
        };
        Insert: {
          canvas_lab_order_id?: string | null;
          clinician_id?: number | null;
          created_at?: string | null;
          date_delivered?: string | null;
          date_shipped?: string | null;
          error_details?: string | null;
          errored?: boolean;
          fasting?: boolean | null;
          id?: number;
          panel_id?: string | null;
          patient_id?: number | null;
          status?: string | null;
          tasso_order_id?: string | null;
          tasso_tracking_number?: string | null;
          tracking_url?: string | null;
          updated_at?: string | null;
        };
        Update: {
          canvas_lab_order_id?: string | null;
          clinician_id?: number | null;
          created_at?: string | null;
          date_delivered?: string | null;
          date_shipped?: string | null;
          error_details?: string | null;
          errored?: boolean;
          fasting?: boolean | null;
          id?: number;
          panel_id?: string | null;
          patient_id?: number | null;
          status?: string | null;
          tasso_order_id?: string | null;
          tasso_tracking_number?: string | null;
          tracking_url?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lab_order_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lab_order_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lab_order_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      medical_history: {
        Row: {
          allergies: string | null;
          created_at: string | null;
          current_medications: string | null;
          medical_conditions: string | null;
          patient_id: number;
        };
        Insert: {
          allergies?: string | null;
          created_at?: string | null;
          current_medications?: string | null;
          medical_conditions?: string | null;
          patient_id: number;
        };
        Update: {
          allergies?: string | null;
          created_at?: string | null;
          current_medications?: string | null;
          medical_conditions?: string | null;
          patient_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'medical_history_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: true;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'medical_history_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: true;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      medicare_agreement: {
        Row: {
          agreement: string | null;
          clinician_id: number | null;
          created_at: string;
          id: number;
          patient_date_signed: string | null;
          patient_id: number | null;
          patient_signature: string | null;
          zealthy_date_signed: string | null;
          zealthy_signature: string | null;
        };
        Insert: {
          agreement?: string | null;
          clinician_id?: number | null;
          created_at?: string;
          id?: number;
          patient_date_signed?: string | null;
          patient_id?: number | null;
          patient_signature?: string | null;
          zealthy_date_signed?: string | null;
          zealthy_signature?: string | null;
        };
        Update: {
          agreement?: string | null;
          clinician_id?: number | null;
          created_at?: string;
          id?: number;
          patient_date_signed?: string | null;
          patient_id?: number | null;
          patient_signature?: string | null;
          zealthy_date_signed?: string | null;
          zealthy_signature?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'medicare_agreement_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'medicare_agreement_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'medicare_agreement_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      medication: {
        Row: {
          created_at: string | null;
          display_name: string | null;
          id: number;
          name: string;
          type: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          display_name?: string | null;
          id?: number;
          name: string;
          type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          display_name?: string | null;
          id?: number;
          name?: string;
          type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      medication_dosage: {
        Row: {
          active: boolean;
          aps_drug_id: number | null;
          created_at: string | null;
          designator_id: string | null;
          dosage_id: number;
          dosespot_ndc: string | null;
          id: number;
          medication_id: number;
          national_drug_code: string | null;
          next_highest_dosage: number | null;
          updated_at: string | null;
        };
        Insert: {
          active: boolean;
          aps_drug_id?: number | null;
          created_at?: string | null;
          designator_id?: string | null;
          dosage_id: number;
          dosespot_ndc?: string | null;
          id?: number;
          medication_id: number;
          national_drug_code?: string | null;
          next_highest_dosage?: number | null;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean;
          aps_drug_id?: number | null;
          created_at?: string | null;
          designator_id?: string | null;
          dosage_id?: number;
          dosespot_ndc?: string | null;
          id?: number;
          medication_id?: number;
          national_drug_code?: string | null;
          next_highest_dosage?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'medication_dosage_dosage_id_fkey';
            columns: ['dosage_id'];
            isOneToOne: false;
            referencedRelation: 'dosage';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'medication_dosage_medication_id_fkey';
            columns: ['medication_id'];
            isOneToOne: false;
            referencedRelation: 'medication';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'medication_dosage_next_highest_dosage_fkey';
            columns: ['next_highest_dosage'];
            isOneToOne: false;
            referencedRelation: 'medication_dosage';
            referencedColumns: ['id'];
          }
        ];
      };
      medication_price: {
        Row: {
          created_at: string | null;
          medication_quantity_id: number;
          price: number;
        };
        Insert: {
          created_at?: string | null;
          medication_quantity_id?: number;
          price: number;
        };
        Update: {
          created_at?: string | null;
          medication_quantity_id?: number;
          price?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'medication_price_medication_quantity_id_fkey';
            columns: ['medication_quantity_id'];
            isOneToOne: true;
            referencedRelation: 'medication_quantity';
            referencedColumns: ['id'];
          }
        ];
      };
      medication_quantity: {
        Row: {
          active: boolean;
          created_at: string | null;
          id: number;
          medication_dosage_id: number;
          price: number;
          quantity_id: number;
        };
        Insert: {
          active: boolean;
          created_at?: string | null;
          id?: number;
          medication_dosage_id: number;
          price: number;
          quantity_id: number;
        };
        Update: {
          active?: boolean;
          created_at?: string | null;
          id?: number;
          medication_dosage_id?: number;
          price?: number;
          quantity_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'medication_quantity_medication_dosage_id_fkey';
            columns: ['medication_dosage_id'];
            isOneToOne: false;
            referencedRelation: 'medication_dosage';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'medication_quantity_quantity_id_fkey';
            columns: ['quantity_id'];
            isOneToOne: false;
            referencedRelation: 'quantity';
            referencedColumns: ['id'];
          }
        ];
      };
      messages_group: {
        Row: {
          created_at: string | null;
          disabled_at: string | null;
          id: number;
          name: string | null;
          profile_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          disabled_at?: string | null;
          id?: number;
          name?: string | null;
          profile_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          disabled_at?: string | null;
          id?: number;
          name?: string | null;
          profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_group_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      messages_group_member: {
        Row: {
          clinician_id: number | null;
          created_at: string | null;
          id: number;
          messages_group_id: number | null;
        };
        Insert: {
          clinician_id?: number | null;
          created_at?: string | null;
          id?: number;
          messages_group_id?: number | null;
        };
        Update: {
          clinician_id?: number | null;
          created_at?: string | null;
          id?: number;
          messages_group_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_group_member_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_group_member_messages_group_id_fkey';
            columns: ['messages_group_id'];
            isOneToOne: false;
            referencedRelation: 'messages_group';
            referencedColumns: ['id'];
          }
        ];
      };
      'messages-v2': {
        Row: {
          assigned_coordinator_id: number | null;
          assigned_provider_id: number | null;
          canvas_message_id: string | null;
          completed_at: string | null;
          coordinator_assigned_at: string | null;
          created_at: string | null;
          display_at: string | null;
          has_seen: boolean;
          id: number;
          image_url: string | null;
          is_phi: boolean | null;
          macro_id: number | null;
          marked_as_read: boolean | null;
          message_encrypted: string | null;
          messages_group_id: number | null;
          notify: boolean | null;
          provider_assigned_at: string | null;
          queue_id: number | null;
          recipient: string | null;
          requesting_info: boolean | null;
          requires_response: boolean | null;
          requires_response_completed: boolean | null;
          sender: string | null;
          stop_requested: boolean | null;
          visible: boolean;
          was_helpful: boolean | null;
        };
        Insert: {
          assigned_coordinator_id?: number | null;
          assigned_provider_id?: number | null;
          canvas_message_id?: string | null;
          completed_at?: string | null;
          coordinator_assigned_at?: string | null;
          created_at?: string | null;
          display_at?: string | null;
          has_seen?: boolean;
          id?: number;
          image_url?: string | null;
          is_phi?: boolean | null;
          macro_id?: number | null;
          marked_as_read?: boolean | null;
          message_encrypted?: string | null;
          messages_group_id?: number | null;
          notify?: boolean | null;
          provider_assigned_at?: string | null;
          queue_id?: number | null;
          recipient?: string | null;
          requesting_info?: boolean | null;
          requires_response?: boolean | null;
          requires_response_completed?: boolean | null;
          sender?: string | null;
          stop_requested?: boolean | null;
          visible?: boolean;
          was_helpful?: boolean | null;
        };
        Update: {
          assigned_coordinator_id?: number | null;
          assigned_provider_id?: number | null;
          canvas_message_id?: string | null;
          completed_at?: string | null;
          coordinator_assigned_at?: string | null;
          created_at?: string | null;
          display_at?: string | null;
          has_seen?: boolean;
          id?: number;
          image_url?: string | null;
          is_phi?: boolean | null;
          macro_id?: number | null;
          marked_as_read?: boolean | null;
          message_encrypted?: string | null;
          messages_group_id?: number | null;
          notify?: boolean | null;
          provider_assigned_at?: string | null;
          queue_id?: number | null;
          recipient?: string | null;
          requesting_info?: boolean | null;
          requires_response?: boolean | null;
          requires_response_completed?: boolean | null;
          sender?: string | null;
          stop_requested?: boolean | null;
          visible?: boolean;
          was_helpful?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messages-v2_assigned_coordinator_id_fkey';
            columns: ['assigned_coordinator_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages-v2_assigned_provider_id_fkey';
            columns: ['assigned_provider_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages-v2_messages_group_id_fkey';
            columns: ['messages_group_id'];
            isOneToOne: false;
            referencedRelation: 'messages_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages-v2_queue_id_fkey';
            columns: ['queue_id'];
            isOneToOne: false;
            referencedRelation: 'task_queue';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages-v2_recipient_fkey';
            columns: ['recipient'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages-v2_sender_fkey';
            columns: ['sender'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_messages-v2_macro_id_fkey';
            columns: ['macro_id'];
            isOneToOne: false;
            referencedRelation: 'clinician_macro';
            referencedColumns: ['id'];
          }
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          display_at: string | null;
          id: number;
          is_read: boolean;
          message: string | null;
          path: string | null;
          recipient_id: string;
          sender_id: string;
          skip_count: number | null;
          type: Database['public']['Enums']['notifications_type'];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          display_at?: string | null;
          id?: number;
          is_read?: boolean;
          message?: string | null;
          path?: string | null;
          recipient_id: string;
          sender_id: string;
          skip_count?: number | null;
          type: Database['public']['Enums']['notifications_type'];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          display_at?: string | null;
          id?: number;
          is_read?: boolean;
          message?: string | null;
          path?: string | null;
          recipient_id?: string;
          sender_id?: string;
          skip_count?: number | null;
          type?: Database['public']['Enums']['notifications_type'];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'public_notifications_recipient_id_fkey';
            columns: ['recipient_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_notifications_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      one_time_key: {
        Row: {
          created_at: string;
          id: number;
          key: string | null;
          profile_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          key?: string | null;
          profile_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          key?: string | null;
          profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'one_time_key_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      online_visit: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          id: number;
          incomplete_message_sent: boolean | null;
          intakes: Json[];
          paid_at: string | null;
          patient_id: number;
          potential_insurance: string | null;
          requested_prescription: boolean;
          specific_care: string | null;
          status: Database['public']['Enums']['visit_status'];
          synchronous: boolean;
          updated_at: string | null;
          variant: string | null;
          welcome_message_sent: boolean | null;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          id?: number;
          incomplete_message_sent?: boolean | null;
          intakes?: Json[];
          paid_at?: string | null;
          patient_id: number;
          potential_insurance?: string | null;
          requested_prescription?: boolean;
          specific_care?: string | null;
          status?: Database['public']['Enums']['visit_status'];
          synchronous: boolean;
          updated_at?: string | null;
          variant?: string | null;
          welcome_message_sent?: boolean | null;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          id?: number;
          incomplete_message_sent?: boolean | null;
          intakes?: Json[];
          paid_at?: string | null;
          patient_id?: number;
          potential_insurance?: string | null;
          requested_prescription?: boolean;
          specific_care?: string | null;
          status?: Database['public']['Enums']['visit_status'];
          synchronous?: boolean;
          updated_at?: string | null;
          variant?: string | null;
          welcome_message_sent?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'online_visit_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'online_visit_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      oral_dosage_matrix: {
        Row: {
          capsule_count: number[] | null;
          created_at: string;
          current_month: number | null;
          dosage_instructions: string | null;
          dose: number[] | null;
          duration_in_days: number | null;
          id: number;
          medication_id: number[] | null;
          pharmacy_price: number | null;
          price: number | null;
        };
        Insert: {
          capsule_count?: number[] | null;
          created_at?: string;
          current_month?: number | null;
          dosage_instructions?: string | null;
          dose?: number[] | null;
          duration_in_days?: number | null;
          id?: number;
          medication_id?: number[] | null;
          pharmacy_price?: number | null;
          price?: number | null;
        };
        Update: {
          capsule_count?: number[] | null;
          created_at?: string;
          current_month?: number | null;
          dosage_instructions?: string | null;
          dose?: number[] | null;
          duration_in_days?: number | null;
          id?: number;
          medication_id?: number[] | null;
          pharmacy_price?: number | null;
          price?: number | null;
        };
        Relationships: [];
      };
      order: {
        Row: {
          amount_paid: number | null;
          attempted_count: number;
          base_price: number | null;
          belmar_order_id: string | null;
          boothwyn_case_id: string | null;
          cancel_reason: string | null;
          clinician_id: number | null;
          created_at: string | null;
          date_shipped: string | null;
          delivered_at_date: string | null;
          delivery_provider: string | null;
          empower_life_file_id: string | null;
          empower_order_id: string | null;
          error_details: string | null;
          errored: boolean;
          feedback: Json | null;
          gogo_order_id: string | null;
          group_id: string | null;
          hallandale_order_id: string | null;
          id: number;
          invoice_id: string | null;
          national_drug_code: string | null;
          order_cancellation_screenshot: string | null;
          order_contact_number: string | null;
          order_escalated: boolean;
          order_pdf: string | null;
          order_pushed_at: string | null;
          order_pushed_by: number | null;
          order_series_id: string | null;
          order_status: string | null;
          order_without_charge: boolean | null;
          out_of_refill: boolean | null;
          patient_id: number | null;
          prescription_id: number | null;
          prescription_request_id: number | null;
          provider_note: string | null;
          queue_id: number | null;
          receipt_sent: boolean | null;
          red_rock_order_id: number | null;
          refill_count: number | null;
          revive_entry_id: string | null;
          revive_order_id: string | null;
          send_attempted: boolean | null;
          sent_to_pharmacy_at: string | null;
          shipment_details: string | null;
          shipment_method: string | null;
          shipment_method_id: number | null;
          shipping_price: number | null;
          status_if_paid: string | null;
          tax: number | null;
          tmc_order_id: string | null;
          total_dose: string | null;
          total_price: number | null;
          tracking_number: string | null;
          tracking_URL: string | null;
          updated_at: string | null;
        };
        Insert: {
          amount_paid?: number | null;
          attempted_count?: number;
          base_price?: number | null;
          belmar_order_id?: string | null;
          boothwyn_case_id?: string | null;
          cancel_reason?: string | null;
          clinician_id?: number | null;
          created_at?: string | null;
          date_shipped?: string | null;
          delivered_at_date?: string | null;
          delivery_provider?: string | null;
          empower_life_file_id?: string | null;
          empower_order_id?: string | null;
          error_details?: string | null;
          errored?: boolean;
          feedback?: Json | null;
          gogo_order_id?: string | null;
          group_id?: string | null;
          hallandale_order_id?: string | null;
          id?: number;
          invoice_id?: string | null;
          national_drug_code?: string | null;
          order_cancellation_screenshot?: string | null;
          order_contact_number?: string | null;
          order_escalated?: boolean;
          order_pdf?: string | null;
          order_pushed_at?: string | null;
          order_pushed_by?: number | null;
          order_series_id?: string | null;
          order_status?: string | null;
          order_without_charge?: boolean | null;
          out_of_refill?: boolean | null;
          patient_id?: number | null;
          prescription_id?: number | null;
          prescription_request_id?: number | null;
          provider_note?: string | null;
          queue_id?: number | null;
          receipt_sent?: boolean | null;
          red_rock_order_id?: number | null;
          refill_count?: number | null;
          revive_entry_id?: string | null;
          revive_order_id?: string | null;
          send_attempted?: boolean | null;
          sent_to_pharmacy_at?: string | null;
          shipment_details?: string | null;
          shipment_method?: string | null;
          shipment_method_id?: number | null;
          shipping_price?: number | null;
          status_if_paid?: string | null;
          tax?: number | null;
          tmc_order_id?: string | null;
          total_dose?: string | null;
          total_price?: number | null;
          tracking_number?: string | null;
          tracking_URL?: string | null;
          updated_at?: string | null;
        };
        Update: {
          amount_paid?: number | null;
          attempted_count?: number;
          base_price?: number | null;
          belmar_order_id?: string | null;
          boothwyn_case_id?: string | null;
          cancel_reason?: string | null;
          clinician_id?: number | null;
          created_at?: string | null;
          date_shipped?: string | null;
          delivered_at_date?: string | null;
          delivery_provider?: string | null;
          empower_life_file_id?: string | null;
          empower_order_id?: string | null;
          error_details?: string | null;
          errored?: boolean;
          feedback?: Json | null;
          gogo_order_id?: string | null;
          group_id?: string | null;
          hallandale_order_id?: string | null;
          id?: number;
          invoice_id?: string | null;
          national_drug_code?: string | null;
          order_cancellation_screenshot?: string | null;
          order_contact_number?: string | null;
          order_escalated?: boolean;
          order_pdf?: string | null;
          order_pushed_at?: string | null;
          order_pushed_by?: number | null;
          order_series_id?: string | null;
          order_status?: string | null;
          order_without_charge?: boolean | null;
          out_of_refill?: boolean | null;
          patient_id?: number | null;
          prescription_id?: number | null;
          prescription_request_id?: number | null;
          provider_note?: string | null;
          queue_id?: number | null;
          receipt_sent?: boolean | null;
          red_rock_order_id?: number | null;
          refill_count?: number | null;
          revive_entry_id?: string | null;
          revive_order_id?: string | null;
          send_attempted?: boolean | null;
          sent_to_pharmacy_at?: string | null;
          shipment_details?: string | null;
          shipment_method?: string | null;
          shipment_method_id?: number | null;
          shipping_price?: number | null;
          status_if_paid?: string | null;
          tax?: number | null;
          tmc_order_id?: string | null;
          total_dose?: string | null;
          total_price?: number | null;
          tracking_number?: string | null;
          tracking_URL?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'order_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_order_pushed_by_fkey';
            columns: ['order_pushed_by'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'order_prescription_id_fkey';
            columns: ['prescription_id'];
            isOneToOne: false;
            referencedRelation: 'prescription';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_prescription_request_id_fkey';
            columns: ['prescription_request_id'];
            isOneToOne: false;
            referencedRelation: 'prescription_request';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_queue_id_fkey';
            columns: ['queue_id'];
            isOneToOne: false;
            referencedRelation: 'task_queue';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_order_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoice';
            referencedColumns: ['reference_id'];
          },
          {
            foreignKeyName: 'public_order_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoice_with_emails';
            referencedColumns: ['reference_id'];
          }
        ];
      };
      password_failed_verification_attempts: {
        Row: {
          last_failed_at: string;
          user_id: string;
        };
        Insert: {
          last_failed_at?: string;
          user_id: string;
        };
        Update: {
          last_failed_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      patient: {
        Row: {
          app_last_logged_in: string | null;
          app_review_last_prompted: string | null;
          birth_control_eligible: boolean | null;
          canvas_patient_id: string | null;
          compound_disclaimer: boolean | null;
          compound_skip: boolean | null;
          created_at: string;
          deleted_at: string | null;
          denied_reactivation_at: string | null;
          dosespot_patient_id: number | null;
          ed_eligible: boolean | null;
          enclomiphene_eligible: boolean | null;
          flash_sale_expires_at: string | null;
          glp1_ineligible: boolean;
          has_completed_onboarding: boolean;
          has_seen_referral: boolean | null;
          has_verified_identity: boolean;
          height: number | null;
          id: number;
          insurance_info_requested: boolean;
          insurance_item: boolean | null;
          insurance_skip: boolean | null;
          last_refill_request: string | null;
          last_weight_loss_message: string | null;
          medication_history_consent: boolean;
          missed_call: boolean;
          multi_purchase_rating_prompted: boolean | null;
          non_integrated_pharmacy: boolean;
          persona_inquiry_id: string | null;
          profile_id: string;
          reactivation_coupon_sent_at: string | null;
          red_rock_charge_account_id: number | null;
          red_rock_facility_id: number | null;
          red_rock_patient_id: number | null;
          red_rock_store_id: number | null;
          region: string | null;
          revive_id: number | null;
          sleep_eligible: boolean | null;
          spanish_speaker: boolean;
          status: string;
          text_me_update: boolean;
          timezone: string | null;
          updated_at: string;
          vouched_verified: boolean | null;
          weight: number | null;
          weight_loss_free_month_redeemed: string | null;
          weight_loss_medication_eligible: boolean;
          will_prompt_mobile_rating: boolean | null;
        };
        Insert: {
          app_last_logged_in?: string | null;
          app_review_last_prompted?: string | null;
          birth_control_eligible?: boolean | null;
          canvas_patient_id?: string | null;
          compound_disclaimer?: boolean | null;
          compound_skip?: boolean | null;
          created_at?: string;
          deleted_at?: string | null;
          denied_reactivation_at?: string | null;
          dosespot_patient_id?: number | null;
          ed_eligible?: boolean | null;
          enclomiphene_eligible?: boolean | null;
          flash_sale_expires_at?: string | null;
          glp1_ineligible?: boolean;
          has_completed_onboarding?: boolean;
          has_seen_referral?: boolean | null;
          has_verified_identity?: boolean;
          height?: number | null;
          id?: number;
          insurance_info_requested?: boolean;
          insurance_item?: boolean | null;
          insurance_skip?: boolean | null;
          last_refill_request?: string | null;
          last_weight_loss_message?: string | null;
          medication_history_consent?: boolean;
          missed_call?: boolean;
          multi_purchase_rating_prompted?: boolean | null;
          non_integrated_pharmacy?: boolean;
          persona_inquiry_id?: string | null;
          profile_id: string;
          reactivation_coupon_sent_at?: string | null;
          red_rock_charge_account_id?: number | null;
          red_rock_facility_id?: number | null;
          red_rock_patient_id?: number | null;
          red_rock_store_id?: number | null;
          region?: string | null;
          revive_id?: number | null;
          sleep_eligible?: boolean | null;
          spanish_speaker?: boolean;
          status?: string;
          text_me_update?: boolean;
          timezone?: string | null;
          updated_at?: string;
          vouched_verified?: boolean | null;
          weight?: number | null;
          weight_loss_free_month_redeemed?: string | null;
          weight_loss_medication_eligible?: boolean;
          will_prompt_mobile_rating?: boolean | null;
        };
        Update: {
          app_last_logged_in?: string | null;
          app_review_last_prompted?: string | null;
          birth_control_eligible?: boolean | null;
          canvas_patient_id?: string | null;
          compound_disclaimer?: boolean | null;
          compound_skip?: boolean | null;
          created_at?: string;
          deleted_at?: string | null;
          denied_reactivation_at?: string | null;
          dosespot_patient_id?: number | null;
          ed_eligible?: boolean | null;
          enclomiphene_eligible?: boolean | null;
          flash_sale_expires_at?: string | null;
          glp1_ineligible?: boolean;
          has_completed_onboarding?: boolean;
          has_seen_referral?: boolean | null;
          has_verified_identity?: boolean;
          height?: number | null;
          id?: number;
          insurance_info_requested?: boolean;
          insurance_item?: boolean | null;
          insurance_skip?: boolean | null;
          last_refill_request?: string | null;
          last_weight_loss_message?: string | null;
          medication_history_consent?: boolean;
          missed_call?: boolean;
          multi_purchase_rating_prompted?: boolean | null;
          non_integrated_pharmacy?: boolean;
          persona_inquiry_id?: string | null;
          profile_id?: string;
          reactivation_coupon_sent_at?: string | null;
          red_rock_charge_account_id?: number | null;
          red_rock_facility_id?: number | null;
          red_rock_patient_id?: number | null;
          red_rock_store_id?: number | null;
          region?: string | null;
          revive_id?: number | null;
          sleep_eligible?: boolean | null;
          spanish_speaker?: boolean;
          status?: string;
          text_me_update?: boolean;
          timezone?: string | null;
          updated_at?: string;
          vouched_verified?: boolean | null;
          weight?: number | null;
          weight_loss_free_month_redeemed?: string | null;
          weight_loss_medication_eligible?: boolean;
          will_prompt_mobile_rating?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      patient_action_item: {
        Row: {
          body: string;
          canceled: boolean;
          canceled_at: string | null;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          id: number;
          is_required: boolean | null;
          order_id: number | null;
          path: string | null;
          patient_called_at: string | null;
          patient_id: number;
          title: string;
          type: Database['public']['Enums']['patient_action_type'];
          updated_at: string | null;
        };
        Insert: {
          body: string;
          canceled?: boolean;
          canceled_at?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          id?: number;
          is_required?: boolean | null;
          order_id?: number | null;
          path?: string | null;
          patient_called_at?: string | null;
          patient_id: number;
          title: string;
          type: Database['public']['Enums']['patient_action_type'];
          updated_at?: string | null;
        };
        Update: {
          body?: string;
          canceled?: boolean;
          canceled_at?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          id?: number;
          is_required?: boolean | null;
          order_id?: number | null;
          path?: string | null;
          patient_called_at?: string | null;
          patient_id?: number;
          title?: string;
          type?: Database['public']['Enums']['patient_action_type'];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_action_item_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'order';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_action_item_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'payment_success_gogomeds_orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_action_item_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_action_item_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      patient_calls: {
        Row: {
          call_duration: number | null;
          call_note: string | null;
          call_sid: string | null;
          called_by: number;
          created_at: string;
          id: number;
          patient_id: number;
          recording: string | null;
        };
        Insert: {
          call_duration?: number | null;
          call_note?: string | null;
          call_sid?: string | null;
          called_by: number;
          created_at?: string;
          id?: number;
          patient_id: number;
          recording?: string | null;
        };
        Update: {
          call_duration?: number | null;
          call_note?: string | null;
          call_sid?: string | null;
          called_by?: number;
          created_at?: string;
          id?: number;
          patient_id?: number;
          recording?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_calls_called_by_fkey';
            columns: ['called_by'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_calls_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_calls_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      patient_care_team: {
        Row: {
          active: boolean;
          clinician_id: number | null;
          created_at: string | null;
          id: number;
          patient_id: number | null;
          role: string | null;
        };
        Insert: {
          active?: boolean;
          clinician_id?: number | null;
          created_at?: string | null;
          id?: number;
          patient_id?: number | null;
          role?: string | null;
        };
        Update: {
          active?: boolean;
          clinician_id?: number | null;
          created_at?: string | null;
          id?: number;
          patient_id?: number | null;
          role?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_care_team_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_care_team_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_care_team_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      patient_clinician: {
        Row: {
          clinician_id: number | null;
          created_at: string | null;
          id: number;
          patient_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          clinician_id?: number | null;
          created_at?: string | null;
          id?: number;
          patient_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          clinician_id?: number | null;
          created_at?: string | null;
          id?: number;
          patient_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_clinician_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_clinician_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_clinician_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      patient_consent: {
        Row: {
          created_at: string;
          patient_id: number;
          type: string;
        };
        Insert: {
          created_at?: string;
          patient_id: number;
          type: string;
        };
        Update: {
          created_at?: string;
          patient_id?: number;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_consent_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_consent_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      patient_diagnosis: {
        Row: {
          condition_external_id: string | null;
          created_at: string | null;
          ICD_10: string | null;
          id: number;
          name: string | null;
          patient_id: number | null;
          status: string | null;
        };
        Insert: {
          condition_external_id?: string | null;
          created_at?: string | null;
          ICD_10?: string | null;
          id?: number;
          name?: string | null;
          patient_id?: number | null;
          status?: string | null;
        };
        Update: {
          condition_external_id?: string | null;
          created_at?: string | null;
          ICD_10?: string | null;
          id?: number;
          name?: string | null;
          patient_id?: number | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_diagnosis_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_diagnosis_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      patient_marketing_info: {
        Row: {
          created_at: string;
          id: number;
          last_fbclid: string | null;
          last_fbclid_timestamp: string | null;
          last_gclid: string | null;
          last_gclid_timestamp: string | null;
          profile_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          last_fbclid?: string | null;
          last_fbclid_timestamp?: string | null;
          last_gclid?: string | null;
          last_gclid_timestamp?: string | null;
          profile_id?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          last_fbclid?: string | null;
          last_fbclid_timestamp?: string | null;
          last_gclid?: string | null;
          last_gclid_timestamp?: string | null;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_marketing_info_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      patient_pharmacy: {
        Row: {
          created_at: string | null;
          dosespot_pharmacy_id: number | null;
          name: string | null;
          patient_id: number;
          pharmacy: string | null;
        };
        Insert: {
          created_at?: string | null;
          dosespot_pharmacy_id?: number | null;
          name?: string | null;
          patient_id: number;
          pharmacy?: string | null;
        };
        Update: {
          created_at?: string | null;
          dosespot_pharmacy_id?: number | null;
          name?: string | null;
          patient_id?: number;
          pharmacy?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_pharmacy_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: true;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_pharmacy_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: true;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      patient_prescription: {
        Row: {
          cancel_at: string | null;
          cancel_choice_reason: string[] | null;
          cancel_reason: string | null;
          canceled_at: string | null;
          care: string | null;
          coupon_code: string | null;
          created_at: string | null;
          current_period_end: string;
          current_period_start: string;
          id: number;
          interval: string | null;
          interval_count: number | null;
          order_id: number | null;
          patient_id: number;
          price: number | null;
          product: string | null;
          queue_id: number | null;
          reference_id: string;
          scheduled_for_cancelation_at: string | null;
          status: string;
          subscription_id: number;
          survey: boolean | null;
          updated_at: string | null;
          visible: boolean;
        };
        Insert: {
          cancel_at?: string | null;
          cancel_choice_reason?: string[] | null;
          cancel_reason?: string | null;
          canceled_at?: string | null;
          care?: string | null;
          coupon_code?: string | null;
          created_at?: string | null;
          current_period_end: string;
          current_period_start: string;
          id?: number;
          interval?: string | null;
          interval_count?: number | null;
          order_id?: number | null;
          patient_id: number;
          price?: number | null;
          product?: string | null;
          queue_id?: number | null;
          reference_id: string;
          scheduled_for_cancelation_at?: string | null;
          status: string;
          subscription_id: number;
          survey?: boolean | null;
          updated_at?: string | null;
          visible?: boolean;
        };
        Update: {
          cancel_at?: string | null;
          cancel_choice_reason?: string[] | null;
          cancel_reason?: string | null;
          canceled_at?: string | null;
          care?: string | null;
          coupon_code?: string | null;
          created_at?: string | null;
          current_period_end?: string;
          current_period_start?: string;
          id?: number;
          interval?: string | null;
          interval_count?: number | null;
          order_id?: number | null;
          patient_id?: number;
          price?: number | null;
          product?: string | null;
          queue_id?: number | null;
          reference_id?: string;
          scheduled_for_cancelation_at?: string | null;
          status?: string;
          subscription_id?: number;
          survey?: boolean | null;
          updated_at?: string | null;
          visible?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_prescription_coupon_code_fkey';
            columns: ['coupon_code'];
            isOneToOne: false;
            referencedRelation: 'coupon_code';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'patient_prescription_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'order';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_prescription_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'payment_success_gogomeds_orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_prescription_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_prescription_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'patient_prescription_queue_id_fkey';
            columns: ['queue_id'];
            isOneToOne: false;
            referencedRelation: 'task_queue';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_prescription_subscription_id_fkey';
            columns: ['subscription_id'];
            isOneToOne: false;
            referencedRelation: 'subscription';
            referencedColumns: ['id'];
          }
        ];
      };
      patient_referral: {
        Row: {
          code: string;
          created_at: string | null;
          patient_id: number | null;
          specific_care: string | null;
        };
        Insert: {
          code: string;
          created_at?: string | null;
          patient_id?: number | null;
          specific_care?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string | null;
          patient_id?: number | null;
          specific_care?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_referral_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_referral_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      patient_referral_redeem: {
        Row: {
          created_at: string | null;
          id: number;
          patient_referral_code: string | null;
          profile_id: string | null;
          redeemed: boolean | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          patient_referral_code?: string | null;
          profile_id?: string | null;
          redeemed?: boolean | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          patient_referral_code?: string | null;
          profile_id?: string | null;
          redeemed?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_referral_redeem_patient_referral_code_fkey';
            columns: ['patient_referral_code'];
            isOneToOne: false;
            referencedRelation: 'patient_referral';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'patient_referral_redeem_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      patient_subscription: {
        Row: {
          assigned_coordinator_id: number | null;
          cancel_at: string | null;
          cancel_choice_reason: string[] | null;
          cancel_reason: string | null;
          canceled_at: string | null;
          completed_at: string | null;
          coordinator_assigned_at: string | null;
          coupon_code: string | null;
          created_at: string | null;
          current_period_end: string;
          current_period_start: string;
          interval: string | null;
          interval_count: number | null;
          order_id: number | null;
          patient_id: number;
          price: number | null;
          product: string | null;
          queue_id: number | null;
          reference_id: string;
          scheduled_for_cancelation_at: string | null;
          status: string;
          subscription_id: number;
          survey: boolean | null;
          updated_at: string | null;
          visible: boolean;
        };
        Insert: {
          assigned_coordinator_id?: number | null;
          cancel_at?: string | null;
          cancel_choice_reason?: string[] | null;
          cancel_reason?: string | null;
          canceled_at?: string | null;
          completed_at?: string | null;
          coordinator_assigned_at?: string | null;
          coupon_code?: string | null;
          created_at?: string | null;
          current_period_end: string;
          current_period_start: string;
          interval?: string | null;
          interval_count?: number | null;
          order_id?: number | null;
          patient_id: number;
          price?: number | null;
          product?: string | null;
          queue_id?: number | null;
          reference_id: string;
          scheduled_for_cancelation_at?: string | null;
          status: string;
          subscription_id: number;
          survey?: boolean | null;
          updated_at?: string | null;
          visible?: boolean;
        };
        Update: {
          assigned_coordinator_id?: number | null;
          cancel_at?: string | null;
          cancel_choice_reason?: string[] | null;
          cancel_reason?: string | null;
          canceled_at?: string | null;
          completed_at?: string | null;
          coordinator_assigned_at?: string | null;
          coupon_code?: string | null;
          created_at?: string | null;
          current_period_end?: string;
          current_period_start?: string;
          interval?: string | null;
          interval_count?: number | null;
          order_id?: number | null;
          patient_id?: number;
          price?: number | null;
          product?: string | null;
          queue_id?: number | null;
          reference_id?: string;
          scheduled_for_cancelation_at?: string | null;
          status?: string;
          subscription_id?: number;
          survey?: boolean | null;
          updated_at?: string | null;
          visible?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_subscription_assigned_coordinator_id_fkey';
            columns: ['assigned_coordinator_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_subscription_coupon_code_fkey';
            columns: ['coupon_code'];
            isOneToOne: false;
            referencedRelation: 'coupon_code';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'patient_subscription_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'order';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_subscription_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'payment_success_gogomeds_orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_subscription_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_subscription_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'patient_subscription_queue_id_fkey';
            columns: ['queue_id'];
            isOneToOne: false;
            referencedRelation: 'task_queue';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_subscription_subscription_id_fkey';
            columns: ['subscription_id'];
            isOneToOne: false;
            referencedRelation: 'subscription';
            referencedColumns: ['id'];
          }
        ];
      };
      patient_weight: {
        Row: {
          created_at: string | null;
          date_logged: string | null;
          id: number;
          patient_id: number | null;
          weight: number | null;
        };
        Insert: {
          created_at?: string | null;
          date_logged?: string | null;
          id?: number;
          patient_id?: number | null;
          weight?: number | null;
        };
        Update: {
          created_at?: string | null;
          date_logged?: string | null;
          id?: number;
          patient_id?: number | null;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_weight_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_weight_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      payer: {
        Row: {
          created_at: string | null;
          external_payer_id: string;
          id: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          external_payer_id: string;
          id?: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          external_payer_id?: string;
          id?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      payment_profile: {
        Row: {
          created_at: string | null;
          customer_id: string;
          id: number;
          last4: string | null;
          patient_id: number;
          processor: string;
          status: string | null;
          type: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          customer_id: string;
          id?: number;
          last4?: string | null;
          patient_id: number;
          processor: string;
          status?: string | null;
          type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          customer_id?: string;
          id?: number;
          last4?: string | null;
          patient_id?: number;
          processor?: string;
          status?: string | null;
          type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_profile_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_profile_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      pending_order: {
        Row: {
          created_at: string;
          id: number;
          params: Json;
          patient_id: number;
          pr_id: number;
          trigger: Database['public']['Enums']['order_trigger'];
          url: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          params: Json;
          patient_id: number;
          pr_id: number;
          trigger: Database['public']['Enums']['order_trigger'];
          url: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          params?: Json;
          patient_id?: number;
          pr_id?: number;
          trigger?: Database['public']['Enums']['order_trigger'];
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pending_order_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pending_order_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'pending_order_pr_id_fkey';
            columns: ['pr_id'];
            isOneToOne: false;
            referencedRelation: 'prescription_request';
            referencedColumns: ['id'];
          }
        ];
      };
      pharmacy_escalation: {
        Row: {
          clinician_id: number | null;
          created_at: string;
          id: number;
          issue: string | null;
          note: string | null;
          order_id: number | null;
          patient_id: number | null;
          pharmacy: string | null;
          queue_id: number | null;
          resolved_at: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          clinician_id?: number | null;
          created_at?: string;
          id?: number;
          issue?: string | null;
          note?: string | null;
          order_id?: number | null;
          patient_id?: number | null;
          pharmacy?: string | null;
          queue_id?: number | null;
          resolved_at?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          clinician_id?: number | null;
          created_at?: string;
          id?: number;
          issue?: string | null;
          note?: string | null;
          order_id?: number | null;
          patient_id?: number | null;
          pharmacy?: string | null;
          queue_id?: number | null;
          resolved_at?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'pharmacy_escalation_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pharmacy_escalation_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'order';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pharmacy_escalation_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'payment_success_gogomeds_orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pharmacy_escalation_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pharmacy_escalation_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'pharmacy_escalation_queue_id_fkey';
            columns: ['queue_id'];
            isOneToOne: false;
            referencedRelation: 'task_queue';
            referencedColumns: ['id'];
          }
        ];
      };
      prescription: {
        Row: {
          clinician_id: number | null;
          compound_medication_reason:
            | Database['public']['Enums']['compound_medication_reason']
            | null;
          count_of_refills_allowed: number | null;
          created_at: string | null;
          dispense_quantity: number | null;
          dosage_instructions: string | null;
          dosespot_prescription_id: number | null;
          dosespot_prescription_status: string | null;
          duration_in_days: number | null;
          expires_on: string | null;
          external_canvas_id: string | null;
          generic_substitutions_allowed: boolean | null;
          id: number;
          is_injectable: boolean | null;
          matrix_id: number | null;
          medication: string | null;
          medication_dosage_id: number | null;
          medication_id: string | null;
          medication_quantity_id: number | null;
          national_drug_code: string | null;
          note: string | null;
          order_name: string | null;
          patient_id: number | null;
          pharmacy: string | null;
          prescription_renewed: number | null;
          requester_canvas_id: string | null;
          status: string | null;
          subscription_id: string | null;
          unit: string | null;
          updated_at: string | null;
        };
        Insert: {
          clinician_id?: number | null;
          compound_medication_reason?:
            | Database['public']['Enums']['compound_medication_reason']
            | null;
          count_of_refills_allowed?: number | null;
          created_at?: string | null;
          dispense_quantity?: number | null;
          dosage_instructions?: string | null;
          dosespot_prescription_id?: number | null;
          dosespot_prescription_status?: string | null;
          duration_in_days?: number | null;
          expires_on?: string | null;
          external_canvas_id?: string | null;
          generic_substitutions_allowed?: boolean | null;
          id?: number;
          is_injectable?: boolean | null;
          matrix_id?: number | null;
          medication?: string | null;
          medication_dosage_id?: number | null;
          medication_id?: string | null;
          medication_quantity_id?: number | null;
          national_drug_code?: string | null;
          note?: string | null;
          order_name?: string | null;
          patient_id?: number | null;
          pharmacy?: string | null;
          prescription_renewed?: number | null;
          requester_canvas_id?: string | null;
          status?: string | null;
          subscription_id?: string | null;
          unit?: string | null;
          updated_at?: string | null;
        };
        Update: {
          clinician_id?: number | null;
          compound_medication_reason?:
            | Database['public']['Enums']['compound_medication_reason']
            | null;
          count_of_refills_allowed?: number | null;
          created_at?: string | null;
          dispense_quantity?: number | null;
          dosage_instructions?: string | null;
          dosespot_prescription_id?: number | null;
          dosespot_prescription_status?: string | null;
          duration_in_days?: number | null;
          expires_on?: string | null;
          external_canvas_id?: string | null;
          generic_substitutions_allowed?: boolean | null;
          id?: number;
          is_injectable?: boolean | null;
          matrix_id?: number | null;
          medication?: string | null;
          medication_dosage_id?: number | null;
          medication_id?: string | null;
          medication_quantity_id?: number | null;
          national_drug_code?: string | null;
          note?: string | null;
          order_name?: string | null;
          patient_id?: number | null;
          pharmacy?: string | null;
          prescription_renewed?: number | null;
          requester_canvas_id?: string | null;
          status?: string | null;
          subscription_id?: string | null;
          unit?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'prescription_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prescription_matrix_id_fkey';
            columns: ['matrix_id'];
            isOneToOne: false;
            referencedRelation: 'compound_matrix';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prescription_medication_quantity_id_fkey';
            columns: ['medication_quantity_id'];
            isOneToOne: false;
            referencedRelation: 'medication_quantity';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prescription_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prescription_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'prescription_prescription_renewed_fkey';
            columns: ['prescription_renewed'];
            isOneToOne: false;
            referencedRelation: 'prescription';
            referencedColumns: ['id'];
          }
        ];
      };
      prescription_request: {
        Row: {
          care_team: number[] | null;
          charge: boolean;
          clinician_id: number | null;
          coupon_code: string | null;
          created_at: string | null;
          discounted_price: number | null;
          dosespot_prescription_id: number | null;
          id: number;
          is_adjustment: boolean;
          is_bundled: boolean | null;
          is_visible: boolean | null;
          klarna_order_id: string | null;
          klarna_session_id: string | null;
          matrix_id: number | null;
          medication_quantity_id: number | null;
          note: string | null;
          number_of_month_requested: number | null;
          oral_matrix_id: number | null;
          patient_id: number | null;
          quantity: number | null;
          queue_id: number | null;
          region: string | null;
          renewing_prescription: number | null;
          reviewed_at: string | null;
          shipping_method: number | null;
          specific_medication: string | null;
          status: string | null;
          total_price: number | null;
          type: Database['public']['Enums']['medication_type'] | null;
          uncaptured_payment_intent_id: string | null;
          updated_at: string;
        };
        Insert: {
          care_team?: number[] | null;
          charge?: boolean;
          clinician_id?: number | null;
          coupon_code?: string | null;
          created_at?: string | null;
          discounted_price?: number | null;
          dosespot_prescription_id?: number | null;
          id?: number;
          is_adjustment?: boolean;
          is_bundled?: boolean | null;
          is_visible?: boolean | null;
          klarna_order_id?: string | null;
          klarna_session_id?: string | null;
          matrix_id?: number | null;
          medication_quantity_id?: number | null;
          note?: string | null;
          number_of_month_requested?: number | null;
          oral_matrix_id?: number | null;
          patient_id?: number | null;
          quantity?: number | null;
          queue_id?: number | null;
          region?: string | null;
          renewing_prescription?: number | null;
          reviewed_at?: string | null;
          shipping_method?: number | null;
          specific_medication?: string | null;
          status?: string | null;
          total_price?: number | null;
          type?: Database['public']['Enums']['medication_type'] | null;
          uncaptured_payment_intent_id?: string | null;
          updated_at?: string;
        };
        Update: {
          care_team?: number[] | null;
          charge?: boolean;
          clinician_id?: number | null;
          coupon_code?: string | null;
          created_at?: string | null;
          discounted_price?: number | null;
          dosespot_prescription_id?: number | null;
          id?: number;
          is_adjustment?: boolean;
          is_bundled?: boolean | null;
          is_visible?: boolean | null;
          klarna_order_id?: string | null;
          klarna_session_id?: string | null;
          matrix_id?: number | null;
          medication_quantity_id?: number | null;
          note?: string | null;
          number_of_month_requested?: number | null;
          oral_matrix_id?: number | null;
          patient_id?: number | null;
          quantity?: number | null;
          queue_id?: number | null;
          region?: string | null;
          renewing_prescription?: number | null;
          reviewed_at?: string | null;
          shipping_method?: number | null;
          specific_medication?: string | null;
          status?: string | null;
          total_price?: number | null;
          type?: Database['public']['Enums']['medication_type'] | null;
          uncaptured_payment_intent_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'prescription_request_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prescription_request_matrix_id_fkey';
            columns: ['matrix_id'];
            isOneToOne: false;
            referencedRelation: 'compound_matrix';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prescription_request_medication_quantity_id_fkey';
            columns: ['medication_quantity_id'];
            isOneToOne: false;
            referencedRelation: 'medication_quantity';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prescription_request_oral_matrix_id_fkey';
            columns: ['oral_matrix_id'];
            isOneToOne: false;
            referencedRelation: 'oral_dosage_matrix';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prescription_request_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prescription_request_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'prescription_request_queue_id_fkey';
            columns: ['queue_id'];
            isOneToOne: false;
            referencedRelation: 'task_queue';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prescription_request_renewing_prescription_fkey';
            columns: ['renewing_prescription'];
            isOneToOne: false;
            referencedRelation: 'prescription';
            referencedColumns: ['id'];
          }
        ];
      };
      prior_auth: {
        Row: {
          attempt_count: number | null;
          call_link: string | null;
          covermymedslink: string | null;
          created_at: string;
          date_approved: string | null;
          date_prescribed: string | null;
          date_submitted: string | null;
          dosespot_prescription_id: number | null;
          dosespot_prior_authorization_case_id: number | null;
          id: number;
          patient_id: number | null;
          prescription_request_id: number | null;
          priority: number;
          queue_id: number | null;
          rx_submitted: string | null;
          status: string | null;
          sub_status:
            | Database['public']['Enums']['prior_auth_sub_status']
            | null;
          updated_at: string | null;
          updated_by: number | null;
        };
        Insert: {
          attempt_count?: number | null;
          call_link?: string | null;
          covermymedslink?: string | null;
          created_at?: string;
          date_approved?: string | null;
          date_prescribed?: string | null;
          date_submitted?: string | null;
          dosespot_prescription_id?: number | null;
          dosespot_prior_authorization_case_id?: number | null;
          id?: number;
          patient_id?: number | null;
          prescription_request_id?: number | null;
          priority?: number;
          queue_id?: number | null;
          rx_submitted?: string | null;
          status?: string | null;
          sub_status?:
            | Database['public']['Enums']['prior_auth_sub_status']
            | null;
          updated_at?: string | null;
          updated_by?: number | null;
        };
        Update: {
          attempt_count?: number | null;
          call_link?: string | null;
          covermymedslink?: string | null;
          created_at?: string;
          date_approved?: string | null;
          date_prescribed?: string | null;
          date_submitted?: string | null;
          dosespot_prescription_id?: number | null;
          dosespot_prior_authorization_case_id?: number | null;
          id?: number;
          patient_id?: number | null;
          prescription_request_id?: number | null;
          priority?: number;
          queue_id?: number | null;
          rx_submitted?: string | null;
          status?: string | null;
          sub_status?:
            | Database['public']['Enums']['prior_auth_sub_status']
            | null;
          updated_at?: string | null;
          updated_by?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'prior_auth_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prior_auth_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'prior_auth_prescription_request_id_fkey';
            columns: ['prescription_request_id'];
            isOneToOne: false;
            referencedRelation: 'prescription_request';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prior_auth_queue_id_fkey';
            columns: ['queue_id'];
            isOneToOne: false;
            referencedRelation: 'task_queue';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prior_auth_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          birth_date: string | null;
          created_at: string;
          email: string | null;
          first_name: string | null;
          gender: string | null;
          id: string;
          is_clinician: boolean | null;
          last_name: string | null;
          last_password_update: string | null;
          onsched_resource_id: string | null;
          phone_number: string | null;
          prefix: string | null;
          profile_app: Database['public']['Enums']['profile_app'] | null;
          recaptcha_score: number | null;
          referral_source: string[] | null;
          region: string | null;
          signup_variant: string | null;
          updated_at: string | null;
          utm_parameters: Json[] | null;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          birth_date?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          gender?: string | null;
          id: string;
          is_clinician?: boolean | null;
          last_name?: string | null;
          last_password_update?: string | null;
          onsched_resource_id?: string | null;
          phone_number?: string | null;
          prefix?: string | null;
          profile_app?: Database['public']['Enums']['profile_app'] | null;
          recaptcha_score?: number | null;
          referral_source?: string[] | null;
          region?: string | null;
          signup_variant?: string | null;
          updated_at?: string | null;
          utm_parameters?: Json[] | null;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          birth_date?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          gender?: string | null;
          id?: string;
          is_clinician?: boolean | null;
          last_name?: string | null;
          last_password_update?: string | null;
          onsched_resource_id?: string | null;
          phone_number?: string | null;
          prefix?: string | null;
          profile_app?: Database['public']['Enums']['profile_app'] | null;
          recaptcha_score?: number | null;
          referral_source?: string[] | null;
          region?: string | null;
          signup_variant?: string | null;
          updated_at?: string | null;
          utm_parameters?: Json[] | null;
          website?: string | null;
        };
        Relationships: [];
      };
      promo_banner_text: {
        Row: {
          countdown: string | null;
          created_at: string;
          id: number;
          key: string;
          key_type: Database['public']['Enums']['promo_text_key_type'] | null;
          text: string;
          text_esp: string;
        };
        Insert: {
          countdown?: string | null;
          created_at?: string;
          id?: number;
          key?: string;
          key_type?: Database['public']['Enums']['promo_text_key_type'] | null;
          text?: string;
          text_esp?: string;
        };
        Update: {
          countdown?: string | null;
          created_at?: string;
          id?: number;
          key?: string;
          key_type?: Database['public']['Enums']['promo_text_key_type'] | null;
          text?: string;
          text_esp?: string;
        };
        Relationships: [];
      };
      quantity: {
        Row: {
          created_at: string | null;
          id: number;
          quantity: number;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          quantity: number;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          quantity?: number;
        };
        Relationships: [];
      };
      question: {
        Row: {
          button_cta: string | null;
          created_at: string;
          data: Json | null;
          description: string | null;
          details: Json | null;
          footer: string | null;
          header: string | null;
          id: number;
          name: string | null;
          next: string | null;
          options_json: Json | null;
          title: string | null;
          type: string | null;
        };
        Insert: {
          button_cta?: string | null;
          created_at?: string;
          data?: Json | null;
          description?: string | null;
          details?: Json | null;
          footer?: string | null;
          header?: string | null;
          id?: number;
          name?: string | null;
          next?: string | null;
          options_json?: Json | null;
          title?: string | null;
          type?: string | null;
        };
        Update: {
          button_cta?: string | null;
          created_at?: string;
          data?: Json | null;
          description?: string | null;
          details?: Json | null;
          footer?: string | null;
          header?: string | null;
          id?: number;
          name?: string | null;
          next?: string | null;
          options_json?: Json | null;
          title?: string | null;
          type?: string | null;
        };
        Relationships: [];
      };
      questionnaire: {
        Row: {
          created_at: string | null;
          first_question_name: string | null;
          id: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          first_question_name?: string | null;
          id?: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          first_question_name?: string | null;
          id?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      questionnaire_response: {
        Row: {
          created_at: string | null;
          patient_id: number | null;
          questionnaire_name: string;
          response: Json;
          retry_submission_at: string | null;
          submitted: boolean;
          submitted_by: string | null;
          visit_id: number;
        };
        Insert: {
          created_at?: string | null;
          patient_id?: number | null;
          questionnaire_name: string;
          response: Json;
          retry_submission_at?: string | null;
          submitted?: boolean;
          submitted_by?: string | null;
          visit_id: number;
        };
        Update: {
          created_at?: string | null;
          patient_id?: number | null;
          questionnaire_name?: string;
          response?: Json;
          retry_submission_at?: string | null;
          submitted?: boolean;
          submitted_by?: string | null;
          visit_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'public_questionnaire_response_submitted_by_fkey';
            columns: ['submitted_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'questionnaire_response_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'questionnaire_response_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'questionnaire_response_visit_id_fkey';
            columns: ['visit_id'];
            isOneToOne: false;
            referencedRelation: 'online_visit';
            referencedColumns: ['id'];
          }
        ];
      };
      reason_for_visit: {
        Row: {
          created_at: string | null;
          female: boolean;
          group: string;
          id: number;
          male: boolean;
          order: number | null;
          reason: string;
          synchronous: boolean;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          female?: boolean;
          group?: string;
          id?: number;
          male?: boolean;
          order?: number | null;
          reason: string;
          synchronous?: boolean;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          female?: boolean;
          group?: string;
          id?: number;
          male?: boolean;
          order?: number | null;
          reason?: string;
          synchronous?: boolean;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          created_at: string | null;
          id: number;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          name: string;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      single_use_appointment: {
        Row: {
          clinician: number;
          created_at: string;
          duration: number | null;
          id: string;
          patient: number | null;
          used: boolean;
          used_on: string | null;
        };
        Insert: {
          clinician: number;
          created_at?: string;
          duration?: number | null;
          id?: string;
          patient?: number | null;
          used?: boolean;
          used_on?: string | null;
        };
        Update: {
          clinician?: number;
          created_at?: string;
          duration?: number | null;
          id?: string;
          patient?: number | null;
          used?: boolean;
          used_on?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'single_use_appointment_clinician_fkey';
            columns: ['clinician'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'single_use_appointment_patient_fkey';
            columns: ['patient'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'single_use_appointment_patient_fkey';
            columns: ['patient'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      st_zealthy_campaign: {
        Row: {
          campaign_key: string;
          created_at: string | null;
          id: string;
          is_live: boolean | null;
          name: string;
          soft_delete: boolean;
        };
        Insert: {
          campaign_key: string;
          created_at?: string | null;
          id?: string;
          is_live?: boolean | null;
          name: string;
          soft_delete?: boolean;
        };
        Update: {
          campaign_key?: string;
          created_at?: string | null;
          id?: string;
          is_live?: boolean | null;
          name?: string;
          soft_delete?: boolean;
        };
        Relationships: [];
      };
      st_zealthy_config: {
        Row: {
          campaign_key: string;
          control_url: string;
          created_at: string | null;
          id: string;
          is_live: boolean | null;
          variations: Json;
        };
        Insert: {
          campaign_key: string;
          control_url: string;
          created_at?: string | null;
          id?: string;
          is_live?: boolean | null;
          variations: Json;
        };
        Update: {
          campaign_key?: string;
          control_url?: string;
          created_at?: string | null;
          id?: string;
          is_live?: boolean | null;
          variations?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'st_zealthy_config_campaign_key_fkey';
            columns: ['campaign_key'];
            isOneToOne: false;
            referencedRelation: 'st_zealthy_campaign';
            referencedColumns: ['campaign_key'];
          }
        ];
      };
      st_zealthy_metric: {
        Row: {
          campaign_key: string;
          created_at: string | null;
          id: string;
          metric_name: string;
        };
        Insert: {
          campaign_key: string;
          created_at?: string | null;
          id?: string;
          metric_name: string;
        };
        Update: {
          campaign_key?: string;
          created_at?: string | null;
          id?: string;
          metric_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'st_zealthy_metric_campaign_key_fkey';
            columns: ['campaign_key'];
            isOneToOne: false;
            referencedRelation: 'st_zealthy_campaign';
            referencedColumns: ['campaign_key'];
          }
        ];
      };
      st_zealthy_user_metric: {
        Row: {
          campaign_key: string;
          created_at: string | null;
          id: string;
          metric_name: string;
          profile_id: string;
          stz_user_id: string;
        };
        Insert: {
          campaign_key: string;
          created_at?: string | null;
          id?: string;
          metric_name: string;
          profile_id: string;
          stz_user_id: string;
        };
        Update: {
          campaign_key?: string;
          created_at?: string | null;
          id?: string;
          metric_name?: string;
          profile_id?: string;
          stz_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'st_zealthy_user_metric_campaign_key_fkey';
            columns: ['campaign_key'];
            isOneToOne: false;
            referencedRelation: 'st_zealthy_campaign';
            referencedColumns: ['campaign_key'];
          }
        ];
      };
      st_zealthy_user_variation: {
        Row: {
          campaign_key: string;
          created_at: string | null;
          id: string;
          profile_id: string | null;
          stz_user_id: string;
          variation_name: string;
        };
        Insert: {
          campaign_key: string;
          created_at?: string | null;
          id?: string;
          profile_id?: string | null;
          stz_user_id: string;
          variation_name: string;
        };
        Update: {
          campaign_key?: string;
          created_at?: string | null;
          id?: string;
          profile_id?: string | null;
          stz_user_id?: string;
          variation_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'st_zealthy_user_variation_campaign_key_fkey';
            columns: ['campaign_key'];
            isOneToOne: false;
            referencedRelation: 'st_zealthy_campaign';
            referencedColumns: ['campaign_key'];
          }
        ];
      };
      st_zealthy_variation: {
        Row: {
          campaign_key: string;
          created_at: string | null;
          id: string;
          variation_name: string;
          variation_url: string;
        };
        Insert: {
          campaign_key: string;
          created_at?: string | null;
          id?: string;
          variation_name: string;
          variation_url: string;
        };
        Update: {
          campaign_key?: string;
          created_at?: string | null;
          id?: string;
          variation_name?: string;
          variation_url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'st_zealthy_variation_campaign_key_fkey';
            columns: ['campaign_key'];
            isOneToOne: false;
            referencedRelation: 'st_zealthy_campaign';
            referencedColumns: ['campaign_key'];
          }
        ];
      };
      state: {
        Row: {
          abbreviation: string;
          active: boolean;
          id: number;
          name: string;
        };
        Insert: {
          abbreviation: string;
          active?: boolean;
          id?: number;
          name: string;
        };
        Update: {
          abbreviation?: string;
          active?: boolean;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      state_cash_payer: {
        Row: {
          accept_treat_me_now: boolean;
          state: string;
        };
        Insert: {
          accept_treat_me_now?: boolean;
          state: string;
        };
        Update: {
          accept_treat_me_now?: boolean;
          state?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'state_cash_payer_state_fkey';
            columns: ['state'];
            isOneToOne: true;
            referencedRelation: 'state';
            referencedColumns: ['abbreviation'];
          }
        ];
      };
      state_clinician: {
        Row: {
          active: boolean;
          clinician_id: number;
          created_at: string | null;
          expiration_date: string | null;
          license_number: string | null;
          notify: boolean;
          state: string;
          supervisor: string | null;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean;
          clinician_id: number;
          created_at?: string | null;
          expiration_date?: string | null;
          license_number?: string | null;
          notify?: boolean;
          state: string;
          supervisor?: string | null;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean;
          clinician_id?: number;
          created_at?: string | null;
          expiration_date?: string | null;
          license_number?: string | null;
          notify?: boolean;
          state?: string;
          supervisor?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'state_clinician_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'state_clinician_state_fkey';
            columns: ['state'];
            isOneToOne: false;
            referencedRelation: 'state';
            referencedColumns: ['abbreviation'];
          },
          {
            foreignKeyName: 'state_clinician_supervisor_fkey';
            columns: ['supervisor'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      state_payer: {
        Row: {
          accept_treat_me_now: boolean;
          active: boolean;
          created_at: string | null;
          id: number;
          payer_id: number;
          state: string;
          updated_at: string | null;
        };
        Insert: {
          accept_treat_me_now?: boolean;
          active?: boolean;
          created_at?: string | null;
          id?: number;
          payer_id: number;
          state: string;
          updated_at?: string | null;
        };
        Update: {
          accept_treat_me_now?: boolean;
          active?: boolean;
          created_at?: string | null;
          id?: number;
          payer_id?: number;
          state?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'state_payer_payer_id_fkey';
            columns: ['payer_id'];
            isOneToOne: false;
            referencedRelation: 'payer';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'state_payer_state_fkey';
            columns: ['state'];
            isOneToOne: false;
            referencedRelation: 'state';
            referencedColumns: ['abbreviation'];
          }
        ];
      };
      state_payer_clinician: {
        Row: {
          active: boolean;
          clinician_id: number;
          created_at: string | null;
          state_payer_id: number;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean;
          clinician_id?: number;
          created_at?: string | null;
          state_payer_id: number;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean;
          clinician_id?: number;
          created_at?: string | null;
          state_payer_id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'state_payer_clinician_clinician_id_fkey';
            columns: ['clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'state_payer_clinician_state_payer_id_fkey';
            columns: ['state_payer_id'];
            isOneToOne: false;
            referencedRelation: 'state_payer';
            referencedColumns: ['id'];
          }
        ];
      };
      subscriber_feedback: {
        Row: {
          comment: string | null;
          created_at: string;
          id: number;
          month_interval: number;
          patient_id: number;
          queue_id: number | null;
          score: number | null;
          skip_count: number | null;
          skipped: boolean;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: number;
          month_interval: number;
          patient_id: number;
          queue_id?: number | null;
          score?: number | null;
          skip_count?: number | null;
          skipped?: boolean;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: number;
          month_interval?: number;
          patient_id?: number;
          queue_id?: number | null;
          score?: number | null;
          skip_count?: number | null;
          skipped?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriber_feedback_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subscriber_feedback_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'subscriber_feedback_queue_id_fkey';
            columns: ['queue_id'];
            isOneToOne: false;
            referencedRelation: 'task_queue';
            referencedColumns: ['id'];
          }
        ];
      };
      subscription: {
        Row: {
          active: boolean;
          created_at: string | null;
          currency: string;
          id: number;
          name: string;
          price: number;
          processor: string;
          reference_id: string;
          updated_at: string | null;
        };
        Insert: {
          active: boolean;
          created_at?: string | null;
          currency: string;
          id?: number;
          name: string;
          price: number;
          processor: string;
          reference_id: string;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean;
          created_at?: string | null;
          currency?: string;
          id?: number;
          name?: string;
          price?: number;
          processor?: string;
          reference_id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      subscription_cleaning_history: {
        Row: {
          created_at: string;
          date: string;
          id: number;
          next_page: string | null;
          total_cleaned: number;
        };
        Insert: {
          created_at?: string;
          date: string;
          id?: number;
          next_page?: string | null;
          total_cleaned?: number;
        };
        Update: {
          created_at?: string;
          date?: string;
          id?: number;
          next_page?: string | null;
          total_cleaned?: number;
        };
        Relationships: [];
      };
      systematic_backlog: {
        Row: {
          created_at: string;
          id: number;
          last_updated: string;
          number_of_exceptions: string | null;
          oldest_exception_date: string | null;
          oldest_sema: string | null;
          oldest_systematic_order: string | null;
          oldest_tirz: string | null;
          pharmacy: string | null;
          steps_taken: string | null;
          updated_by: string | null;
          week_end: string | null;
          week_start: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          last_updated?: string;
          number_of_exceptions?: string | null;
          oldest_exception_date?: string | null;
          oldest_sema?: string | null;
          oldest_systematic_order?: string | null;
          oldest_tirz?: string | null;
          pharmacy?: string | null;
          steps_taken?: string | null;
          updated_by?: string | null;
          week_end?: string | null;
          week_start?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          last_updated?: string;
          number_of_exceptions?: string | null;
          oldest_exception_date?: string | null;
          oldest_sema?: string | null;
          oldest_systematic_order?: string | null;
          oldest_tirz?: string | null;
          pharmacy?: string | null;
          steps_taken?: string | null;
          updated_by?: string | null;
          week_end?: string | null;
          week_start?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'systematic_backlog_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      task_queue: {
        Row: {
          action_taken: string | null;
          assigned_clinician_id: number | null;
          clinician_assigned_at: string | null;
          clinician_forwarded_at: string | null;
          completed_at: string | null;
          completed_by: string | null;
          created_at: string;
          forward_reason: string | null;
          forwarded_clinician_id: number | null;
          forwarded_task_id: number | null;
          id: number;
          is_audit_item: boolean;
          note: string | null;
          patient_id: number | null;
          priority_level: number;
          provider_type: Database['public']['Enums']['provider_type'] | null;
          queue_type: string | null;
          skip_to_front_at: string | null;
          task_type: string | null;
          time_forwarded: number | null;
          time_spent: number | null;
          updated_at: string | null;
          visible: boolean | null;
        };
        Insert: {
          action_taken?: string | null;
          assigned_clinician_id?: number | null;
          clinician_assigned_at?: string | null;
          clinician_forwarded_at?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          forward_reason?: string | null;
          forwarded_clinician_id?: number | null;
          forwarded_task_id?: number | null;
          id?: number;
          is_audit_item?: boolean;
          note?: string | null;
          patient_id?: number | null;
          priority_level?: number;
          provider_type?: Database['public']['Enums']['provider_type'] | null;
          queue_type?: string | null;
          skip_to_front_at?: string | null;
          task_type?: string | null;
          time_forwarded?: number | null;
          time_spent?: number | null;
          updated_at?: string | null;
          visible?: boolean | null;
        };
        Update: {
          action_taken?: string | null;
          assigned_clinician_id?: number | null;
          clinician_assigned_at?: string | null;
          clinician_forwarded_at?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          forward_reason?: string | null;
          forwarded_clinician_id?: number | null;
          forwarded_task_id?: number | null;
          id?: number;
          is_audit_item?: boolean;
          note?: string | null;
          patient_id?: number | null;
          priority_level?: number;
          provider_type?: Database['public']['Enums']['provider_type'] | null;
          queue_type?: string | null;
          skip_to_front_at?: string | null;
          task_type?: string | null;
          time_forwarded?: number | null;
          time_spent?: number | null;
          updated_at?: string | null;
          visible?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'task_queue_assigned_clinician_id_fkey';
            columns: ['assigned_clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'task_queue_completed_by_fkey';
            columns: ['completed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'task_queue_forwarded_clinician_id_fkey';
            columns: ['forwarded_clinician_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'task_queue_forwarded_task_id_fkey';
            columns: ['forwarded_task_id'];
            isOneToOne: false;
            referencedRelation: 'task_queue';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'task_queue_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'task_queue_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      time_off_request: {
        Row: {
          completed_at: string | null;
          covering_by: number | null;
          created_at: string;
          end_date: string;
          id: number;
          reason: string;
          requested_by: number;
          reviewed_at: string | null;
          reviewed_by: string | null;
          start_date: string;
          status: string;
        };
        Insert: {
          completed_at?: string | null;
          covering_by?: number | null;
          created_at?: string;
          end_date: string;
          id?: number;
          reason: string;
          requested_by: number;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          start_date: string;
          status: string;
        };
        Update: {
          completed_at?: string | null;
          covering_by?: number | null;
          created_at?: string;
          end_date?: string;
          id?: number;
          reason?: string;
          requested_by?: number;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          start_date?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'time_off_request_covering_by_fkey';
            columns: ['covering_by'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'time_off_request_requested_by_fkey';
            columns: ['requested_by'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'time_off_request_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          id: number;
          profile_id: string;
          role: string;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          profile_id: string;
          role: string;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          profile_id?: string;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_roles_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_roles_role_fkey';
            columns: ['role'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['name'];
          }
        ];
      };
      user_roles_v2: {
        Row: {
          created_at: string;
          profile_id: string;
          roles: Database['public']['Enums']['role_types'][];
        };
        Insert: {
          created_at?: string;
          profile_id: string;
          roles: Database['public']['Enums']['role_types'][];
        };
        Update: {
          created_at?: string;
          profile_id?: string;
          roles?: Database['public']['Enums']['role_types'][];
        };
        Relationships: [
          {
            foreignKeyName: 'public_user_roles_v2_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      visit: {
        Row: {
          created_at: string | null;
          id: number;
          patient_id: number | null;
          reasons: Json | null;
          session_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          patient_id?: number | null;
          reasons?: Json | null;
          session_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          patient_id?: number | null;
          reasons?: Json | null;
          session_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'visit_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'visit_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      visit_reason: {
        Row: {
          created_at: string | null;
          note: string | null;
          reason_id: number;
          visit_id: number;
        };
        Insert: {
          created_at?: string | null;
          note?: string | null;
          reason_id: number;
          visit_id?: number;
        };
        Update: {
          created_at?: string | null;
          note?: string | null;
          reason_id?: number;
          visit_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'visit_reason_reason_id_fkey';
            columns: ['reason_id'];
            isOneToOne: false;
            referencedRelation: 'reason_for_visit';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'visit_reason_visit_id_fkey';
            columns: ['visit_id'];
            isOneToOne: false;
            referencedRelation: 'online_visit';
            referencedColumns: ['id'];
          }
        ];
      };
      wl_cancelation_discount_tokens: {
        Row: {
          created_at: string;
          id: number;
          profile_id: string;
          token: string;
          used: boolean;
        };
        Insert: {
          created_at?: string;
          id?: number;
          profile_id: string;
          token: string;
          used?: boolean;
        };
        Update: {
          created_at?: string;
          id?: number;
          profile_id?: string;
          token?: string;
          used?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'wl_cancelation_discount_tokens_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      'decrypted_messages-v2': {
        Row: {
          assigned_coordinator_id: number | null;
          assigned_provider_id: number | null;
          canvas_message_id: string | null;
          completed_at: string | null;
          coordinator_assigned_at: string | null;
          created_at: string | null;
          decrypted_message_encrypted: string | null;
          display_at: string | null;
          has_seen: boolean | null;
          id: number | null;
          image_url: string | null;
          is_phi: boolean | null;
          macro_id: number | null;
          marked_as_read: boolean | null;
          message_encrypted: string | null;
          messages_group_id: number | null;
          notify: boolean | null;
          provider_assigned_at: string | null;
          queue_id: number | null;
          recipient: string | null;
          requesting_info: boolean | null;
          requires_response: boolean | null;
          requires_response_completed: boolean | null;
          sender: string | null;
          stop_requested: boolean | null;
          visible: boolean | null;
          was_helpful: boolean | null;
        };
        Insert: {
          assigned_coordinator_id?: number | null;
          assigned_provider_id?: number | null;
          canvas_message_id?: string | null;
          completed_at?: string | null;
          coordinator_assigned_at?: string | null;
          created_at?: string | null;
          decrypted_message_encrypted?: never;
          display_at?: string | null;
          has_seen?: boolean | null;
          id?: number | null;
          image_url?: string | null;
          is_phi?: boolean | null;
          macro_id?: number | null;
          marked_as_read?: boolean | null;
          message_encrypted?: string | null;
          messages_group_id?: number | null;
          notify?: boolean | null;
          provider_assigned_at?: string | null;
          queue_id?: number | null;
          recipient?: string | null;
          requesting_info?: boolean | null;
          requires_response?: boolean | null;
          requires_response_completed?: boolean | null;
          sender?: string | null;
          stop_requested?: boolean | null;
          visible?: boolean | null;
          was_helpful?: boolean | null;
        };
        Update: {
          assigned_coordinator_id?: number | null;
          assigned_provider_id?: number | null;
          canvas_message_id?: string | null;
          completed_at?: string | null;
          coordinator_assigned_at?: string | null;
          created_at?: string | null;
          decrypted_message_encrypted?: never;
          display_at?: string | null;
          has_seen?: boolean | null;
          id?: number | null;
          image_url?: string | null;
          is_phi?: boolean | null;
          macro_id?: number | null;
          marked_as_read?: boolean | null;
          message_encrypted?: string | null;
          messages_group_id?: number | null;
          notify?: boolean | null;
          provider_assigned_at?: string | null;
          queue_id?: number | null;
          recipient?: string | null;
          requesting_info?: boolean | null;
          requires_response?: boolean | null;
          requires_response_completed?: boolean | null;
          sender?: string | null;
          stop_requested?: boolean | null;
          visible?: boolean | null;
          was_helpful?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messages-v2_assigned_coordinator_id_fkey';
            columns: ['assigned_coordinator_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages-v2_assigned_provider_id_fkey';
            columns: ['assigned_provider_id'];
            isOneToOne: false;
            referencedRelation: 'clinician';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages-v2_messages_group_id_fkey';
            columns: ['messages_group_id'];
            isOneToOne: false;
            referencedRelation: 'messages_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages-v2_queue_id_fkey';
            columns: ['queue_id'];
            isOneToOne: false;
            referencedRelation: 'task_queue';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages-v2_recipient_fkey';
            columns: ['recipient'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages-v2_sender_fkey';
            columns: ['sender'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_messages-v2_macro_id_fkey';
            columns: ['macro_id'];
            isOneToOne: false;
            referencedRelation: 'clinician_macro';
            referencedColumns: ['id'];
          }
        ];
      };
      invoice_with_emails: {
        Row: {
          amount_due: number | null;
          amount_paid: number | null;
          amount_refunded: number | null;
          attempted_count: number | null;
          auto_advance: boolean | null;
          billing_reason: string | null;
          care: string | null;
          charge: string | null;
          collection_method: string | null;
          created_at: string | null;
          description: string | null;
          is_refunded: boolean | null;
          last_zealthy_attempt: string | null;
          next_payment_attempt: string | null;
          patient_id: number | null;
          patient_region: string | null;
          product: string | null;
          profile_email: string | null;
          reason_for_refund: string | null;
          reason_for_refund_img: string | null;
          reference_id: string | null;
          refunded_at: string | null;
          refunded_by: string | null;
          status: string | null;
          subscription: string | null;
          updated_at: string | null;
          zealthy_attempts: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'invoice_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoice_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          },
          {
            foreignKeyName: 'public_invoice_refunded_by_fkey';
            columns: ['refunded_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      patient_bmi: {
        Row: {
          bmi: number | null;
          patient_id: number | null;
          region: string | null;
        };
        Insert: {
          bmi?: never;
          patient_id?: number | null;
          region?: string | null;
        };
        Update: {
          bmi?: never;
          patient_id?: number | null;
          region?: string | null;
        };
        Relationships: [];
      };
      patient_cares: {
        Row: {
          cares: string[] | null;
          patient_id: number | null;
          region: string | null;
          statuses: Database['public']['Enums']['visit_status'][] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'online_visit_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'online_visit_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patient_bmi';
            referencedColumns: ['patient_id'];
          }
        ];
      };
      payment_success_gogomeds_orders: {
        Row: {
          clinician: Json | null;
          created_at: string | null;
          id: number | null;
          national_drug_code: string | null;
          patient: Json | null;
          prescription: Json | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      change_user_password: {
        Args: { current_plain_password: string; new_plain_password: string };
        Returns: Json;
      };
      custom_access_token_hook: {
        Args: { event: Json };
        Returns: Json;
      };
      decrypt_message: {
        Args: { message_encrypted: string };
        Returns: string;
      };
      fetch_incomplete_tasks: {
        Args: { task_types: string[]; queue_types: string[] };
        Returns: Record<string, unknown>;
      };
      get_abz_campaign_details: {
        Args: {
          campaign_key_param: string;
          include_test_accounts: boolean;
          row_limit: number;
          row_offset: number;
          variation_name_param?: string;
        };
        Returns: {
          created_at: string;
          patient_id: number;
          total_paid: number;
          total_refunded: number;
          attempted_count: number;
          campaign_key: string;
          variation_name: string;
        }[];
      };
      get_abz_campaign_metrics: {
        Args: { p_campaign_key: string; include_test_accounts: boolean };
        Returns: Json;
      };
      get_abz_campaign_summary: {
        Args: { input_campaign_key: string; include_test_accounts: boolean };
        Returns: {
          variation_name: string;
          total_paid: number;
          total_refunded: number;
          user_count: number;
          revenue_per_user: number;
          all_users: number;
        }[];
      };
      get_campaign_details_v3: {
        Args: {
          campaign_key_param: string;
          include_test_accounts: boolean;
          row_limit: number;
          row_offset: number;
          variation_name_param?: string;
        };
        Returns: {
          created_at: string;
          patient_id: number;
          total_paid: number;
          total_refunded: number;
          attempted_count: number;
          campaign_key: string;
          variation_name: string;
        }[];
      };
      get_campaign_metrics: {
        Args: { p_campaign_key: string };
        Returns: Json;
      };
      get_campaign_summary_v3: {
        Args: { input_campaign_key: string; include_test_accounts: boolean };
        Returns: {
          variation_name: string;
          total_paid: number;
          total_refunded: number;
          user_count: number;
          revenue_per_user: number;
          all_users: number;
        }[];
      };
      get_st_campaign_metricsv2: {
        Args: { p_campaign_key: string; include_test_accounts: boolean };
        Returns: Json;
      };
      get_st_campaign_metricsv3: {
        Args: { p_campaign_key: string; include_test_accounts: boolean };
        Returns: Json;
      };
      get_st_zealthy_campaign_summary: {
        Args: { input_campaign_key: string; include_test_accounts: boolean };
        Returns: {
          variation_name: string;
          total_paid: number;
          total_refunded: number;
          user_count: number;
          revenue_per_user: number;
          all_users: number;
        }[];
      };
      get_stz_campaign_details: {
        Args: {
          campaign_key_param: string;
          include_test_accounts: boolean;
          row_limit: number;
          row_offset: number;
          variation_name_param?: string;
        };
        Returns: {
          created_at: string;
          patient_id: number;
          total_paid: number;
          total_refunded: number;
          attempted_count: number;
          campaign_key: string;
          variation_name: string;
        }[];
      };
      hook_password_verification_attempt: {
        Args: { event: Json };
        Returns: Json;
      };
      set_statement_timeout: {
        Args: { timeout_ms: number };
        Returns: undefined;
      };
    };
    Enums: {
      appointment_status:
        | 'Requested'
        | 'Confirmed'
        | 'Rejected'
        | 'Noshowed'
        | 'Exited'
        | 'Roomed'
        | 'Arrived'
        | 'confirmed'
        | 'Attempted'
        | 'Unconfirmed'
        | 'ProviderRequested'
        | 'Cancelled'
        | 'Completed'
        | 'Checked-in'
        | 'Unassigned'
        | 'Provider-Noshowed'
        | 'Patient-Noshowed';
      appointment_type:
        | 'Provider'
        | 'Coach (Mental Health)'
        | 'Coach (Weight Loss)';
      clinician_note_type: 'FREETEXT' | 'TEMPLATE';
      compound_medication_reason:
        | 'CANNOT_LOCATE_ELSEWHERE'
        | 'POSITIVE_THERAPEUTIC_RESPONSE'
        | 'STRENGTH_DOSE_CUSTOMIZATION'
        | 'FLEXIBILITY_OF_DOSING'
        | 'DOSAGE_FORM_ACCEPTANCE'
        | 'EASE_OF_ADMINISTRATION'
        | 'PRICING'
        | 'TREATMENT_CONTINUATION'
        | 'OTHER';
      coupon_source_type: 'INTERNAL' | 'RADIO';
      coupon_unit_type: 'PERCENT' | 'DOLLAR';
      device_type: 'MOBILE' | 'WEB';
      encounter_type: 'Scheduled' | 'Walked-in';
      insurance_policy_type: 'Primary' | 'Secondary';
      medication_type:
        | 'BIRTH_CONTROL'
        | 'ED'
        | 'HAIR_LOSS'
        | 'HAIR_LOSS_ADD_ON'
        | 'EMERGENCY_BIRTH_CONTROL'
        | 'Acne'
        | 'Anti-Aging'
        | 'Melasma'
        | 'Rosacea'
        | 'Skincare'
        | 'WEIGHT_LOSS'
        | 'Mental health'
        | 'Enclomiphene'
        | 'Preworkout'
        | 'Female hair loss'
        | 'WEIGHT_LOSS_GLP1 (ORAL)'
        | 'WEIGHT_LOSS_GLP1 (INJECTABLE)'
        | 'Personalized Psychiatry'
        | 'HIV'
        | 'Sleep'
        | 'Sex + Hair'
        | 'Menopause';
      notifications_type:
        | 'CHART_REVIEW'
        | 'WEIGHT_LOSS_PROMO'
        | 'MOBILE_DOWNLOAD'
        | 'RATE_GOOGLE'
        | 'RATE_BBB'
        | 'RATE_TP';
      order_trigger: 'REACTIVATION';
      patient_action_type:
        | 'MISSING_HEIGHT_WEIGHT'
        | 'CANCELLED_PRESCRIPTION'
        | 'COMPOUND_MEDICATION_REQUEST'
        | 'PRESCRIPTION_RENEWAL_REQUEST'
        | 'COMPOUND_MEDICATION_DOSAGE_UPDATE_REQUEST'
        | 'RATE_COACH'
        | 'ENCLOMIPHENE_CHECK_IN'
        | 'ENCLOMIPHENE_LAB_RESULT'
        | 'INSURANCE_INFO_REQUESTED'
        | 'ADDITIONAL_PA_QUESTIONS'
        | 'REFILL_REQUEST_PS'
        | 'CONTINUE_WEIGHT_LOSS'
        | 'FULL_BODY_PHOTO'
        | 'DOWNLOAD_MOBILE_APP'
        | 'PRESCRIPTION_RENEWAL';
      prior_auth_sub_status:
        | 'READY_TO_PRESCRIBE'
        | 'PATIENT_ACTION_NEEDED'
        | 'PRESCRIBED';
      profile_app: 'ZPlan' | 'FitRxApp' | 'Zealthy';
      promo_text_key_type:
        | 'specific_care'
        | 'potential_insurance'
        | 'compound_bundled'
        | 'variant';
      provider_status:
        | 'ON'
        | 'OFF'
        | 'EXISTING_PATIENTS'
        | 'DEACTIVATED'
        | 'OUT_OF_OFFICE';
      provider_type:
        | 'Provider (MD or DO)'
        | 'Provider (NP or PA)'
        | 'Coach (Weight Loss)'
        | 'Coach (Mental Health)'
        | 'Coordinator'
        | 'Provider (PMHNP)'
        | 'Lead Coordinator'
        | 'Coordinator (All)'
        | 'Coordinator (Messages)'
        | 'Coordinator (PAs)'
        | 'Provider'
        | 'Lead Provider'
        | 'Coordinator (Calls)'
        | 'Coordinator (Emails)'
        | 'Supervisor (Lead Coordinator)'
        | 'Supervisor (Lead Provider)'
        | 'Supervisor (Lead Coach)'
        | 'Lead Coach'
        | 'Provider Support'
        | 'Provider (AMH)'
        | 'Order Support'
        | 'Provider (Bundled Trained)'
        | 'Nurse Navigator'
        | 'Prescribe Without Charging'
        | 'Subscription Refund Issuer'
        | 'Medication Refund Issuer'
        | 'Upload Documents'
        | 'Quality Assurance (Coordinator)'
        | 'Quality Assurance (Providers)'
        | 'Quality Assurance (Coaches)'
        | 'Rx Orders'
        | 'Provider (Enclomiphene Trained)'
        | 'Manual Charge'
        | 'Payment Methods Updater'
        | 'Provider (Full Time)'
        | 'Coordinator (Call Requests)'
        | 'Coordinator (Retention)'
        | 'Incident Reporter'
        | 'Provider (QA)'
        | 'Coordinator (Patient Experience)'
        | 'Coordinator (PA-Prep)'
        | 'Coordinator (Enclomiphene Labs)'
        | 'Provider (Pilot Compensation Model)'
        | 'Provider (Non-WL)'
        | 'Coordinator (Dispute and Fraud)';
      role_types:
        | 'ADMIN'
        | 'CLINICIAN'
        | 'COORDINATOR'
        | 'ACCOUNTING'
        | 'DEVELOPER'
        | 'TESTER';
      visit_status: 'Created' | 'Paid' | 'Completed' | 'Canceled';
      visit_type: 'Video' | 'Phone';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
      DefaultSchema['Views'])
  ? (DefaultSchema['Tables'] &
      DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
  ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
  ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      appointment_status: [
        'Requested',
        'Confirmed',
        'Rejected',
        'Noshowed',
        'Exited',
        'Roomed',
        'Arrived',
        'confirmed',
        'Attempted',
        'Unconfirmed',
        'ProviderRequested',
        'Cancelled',
        'Completed',
        'Checked-in',
        'Unassigned',
        'Provider-Noshowed',
        'Patient-Noshowed',
      ],
      appointment_type: [
        'Provider',
        'Coach (Mental Health)',
        'Coach (Weight Loss)',
      ],
      clinician_note_type: ['FREETEXT', 'TEMPLATE'],
      compound_medication_reason: [
        'CANNOT_LOCATE_ELSEWHERE',
        'POSITIVE_THERAPEUTIC_RESPONSE',
        'STRENGTH_DOSE_CUSTOMIZATION',
        'FLEXIBILITY_OF_DOSING',
        'DOSAGE_FORM_ACCEPTANCE',
        'EASE_OF_ADMINISTRATION',
        'PRICING',
        'TREATMENT_CONTINUATION',
        'OTHER',
      ],
      coupon_source_type: ['INTERNAL', 'RADIO'],
      coupon_unit_type: ['PERCENT', 'DOLLAR'],
      device_type: ['MOBILE', 'WEB'],
      encounter_type: ['Scheduled', 'Walked-in'],
      insurance_policy_type: ['Primary', 'Secondary'],
      medication_type: [
        'BIRTH_CONTROL',
        'ED',
        'HAIR_LOSS',
        'HAIR_LOSS_ADD_ON',
        'EMERGENCY_BIRTH_CONTROL',
        'Acne',
        'Anti-Aging',
        'Melasma',
        'Rosacea',
        'Skincare',
        'WEIGHT_LOSS',
        'Mental health',
        'Enclomiphene',
        'Preworkout',
        'Female hair loss',
        'WEIGHT_LOSS_GLP1 (ORAL)',
        'WEIGHT_LOSS_GLP1 (INJECTABLE)',
        'Personalized Psychiatry',
        'HIV',
        'Sleep',
        'Sex + Hair',
        'Menopause',
      ],
      notifications_type: [
        'CHART_REVIEW',
        'WEIGHT_LOSS_PROMO',
        'MOBILE_DOWNLOAD',
        'RATE_GOOGLE',
        'RATE_BBB',
        'RATE_TP',
      ],
      order_trigger: ['REACTIVATION'],
      patient_action_type: [
        'MISSING_HEIGHT_WEIGHT',
        'CANCELLED_PRESCRIPTION',
        'COMPOUND_MEDICATION_REQUEST',
        'PRESCRIPTION_RENEWAL_REQUEST',
        'COMPOUND_MEDICATION_DOSAGE_UPDATE_REQUEST',
        'RATE_COACH',
        'ENCLOMIPHENE_CHECK_IN',
        'ENCLOMIPHENE_LAB_RESULT',
        'INSURANCE_INFO_REQUESTED',
        'ADDITIONAL_PA_QUESTIONS',
        'REFILL_REQUEST_PS',
        'CONTINUE_WEIGHT_LOSS',
        'FULL_BODY_PHOTO',
        'DOWNLOAD_MOBILE_APP',
        'PRESCRIPTION_RENEWAL',
      ],
      prior_auth_sub_status: [
        'READY_TO_PRESCRIBE',
        'PATIENT_ACTION_NEEDED',
        'PRESCRIBED',
      ],
      profile_app: ['ZPlan', 'FitRxApp', 'Zealthy'],
      promo_text_key_type: [
        'specific_care',
        'potential_insurance',
        'compound_bundled',
        'variant',
      ],
      provider_status: [
        'ON',
        'OFF',
        'EXISTING_PATIENTS',
        'DEACTIVATED',
        'OUT_OF_OFFICE',
      ],
      provider_type: [
        'Provider (MD or DO)',
        'Provider (NP or PA)',
        'Coach (Weight Loss)',
        'Coach (Mental Health)',
        'Coordinator',
        'Provider (PMHNP)',
        'Lead Coordinator',
        'Coordinator (All)',
        'Coordinator (Messages)',
        'Coordinator (PAs)',
        'Provider',
        'Lead Provider',
        'Coordinator (Calls)',
        'Coordinator (Emails)',
        'Supervisor (Lead Coordinator)',
        'Supervisor (Lead Provider)',
        'Supervisor (Lead Coach)',
        'Lead Coach',
        'Provider Support',
        'Provider (AMH)',
        'Order Support',
        'Provider (Bundled Trained)',
        'Nurse Navigator',
        'Prescribe Without Charging',
        'Subscription Refund Issuer',
        'Medication Refund Issuer',
        'Upload Documents',
        'Quality Assurance (Coordinator)',
        'Quality Assurance (Providers)',
        'Quality Assurance (Coaches)',
        'Rx Orders',
        'Provider (Enclomiphene Trained)',
        'Manual Charge',
        'Payment Methods Updater',
        'Provider (Full Time)',
        'Coordinator (Call Requests)',
        'Coordinator (Retention)',
        'Incident Reporter',
        'Provider (QA)',
        'Coordinator (Patient Experience)',
        'Coordinator (PA-Prep)',
        'Coordinator (Enclomiphene Labs)',
        'Provider (Pilot Compensation Model)',
        'Provider (Non-WL)',
        'Coordinator (Dispute and Fraud)',
      ],
      role_types: [
        'ADMIN',
        'CLINICIAN',
        'COORDINATOR',
        'ACCOUNTING',
        'DEVELOPER',
        'TESTER',
      ],
      visit_status: ['Created', 'Paid', 'Completed', 'Canceled'],
      visit_type: ['Video', 'Phone'],
    },
  },
} as const;
