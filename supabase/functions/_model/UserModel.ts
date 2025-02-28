
export interface UserProfile {
    user_id?: string;
    first_name: string | null;
    last_name: string | null;
    username: string;
    gender: 'M' | 'F';
    dob: string | null;
    bio?: string | null;
    interests?: Record<string, string> | null;
    email: string;
    mobile: string;
    mfa_enabled?: boolean;
    account_verified?: { email: boolean; mobile: boolean } | null;
    preferences?: { privacy: string; notifications: string } | null;
    languages?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postal_code?: string | null;
    password_hash?: string;
    profile_picture_url?: string | null;
    account_status?: 'A' | 'S';
    user_type?: 'V' | 'M' | 'A'|'U';
    rank?: string | null;
    follower_count?: number;
    following_count?: number;
    created_at?: string;
    updated_at?: string;
    last_login?: string | null;
    failed_login_count?: number;
    lockout_time?: string | null;
  }

 