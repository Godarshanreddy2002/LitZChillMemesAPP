export const USER_TABLE_FIELDS = {
    USER_ID: 'user_id',
    FIRST_NAME: 'first_name',
    LAST_NAME: 'last_name',
    USERNAME: 'username',
    GENDER: 'gender',
    DATE_OF_BIRTH: 'dob',
    BIO: 'bio',
    INTERESTS: 'interests',
    EMAIL: 'email',
    MOBILE: 'mobile',
    MFA_ENABLED: 'mfa_enabled',
    ACCOUNT_VERIFIED: 'account_verified',
    PREFERENCES: 'preferences',
    LANGUAGES: 'languages',
    ADDRESS: 'address',
    CITY: 'city',
    STATE: 'state',
    COUNTRY: 'country',
    POSTAL_CODE: 'postal_code',
    PASSWORD_HASH: 'password_hash',
    PROFILE_PICTURE_URL: 'profile_picture_url',
    ACCOUNT_STATUS: 'account_status',
    USER_TYPE: 'user_type',
    RANK: 'rank',
    FOLLOWER_COUNT: 'follower_count',
    FOLLOWING_COUNT: 'following_count',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    LAST_LOGIN: 'last_login',
    FAILED_LOGIN_COUNT: 'failed_login_count',
    LOCKOUT_TIME: 'lockout_time',
  };
  export const OTP_LIMITS_TABLE_FIELDS = {
    USER_ID: 'user_id',
    TOTAL_OTPS_PER_DAY: 'total_otps_per_day',
    TOTAL_OTPS_LAST_5_MIN: 'total_otps_last_5_min',
    LAST_UPDATED: 'last_updated',
    CRITERIA_STATUS:'criteria_status'
  };


  export const OTP_REQUEST_TABLE_FIELDS = {
    PHONE_NUMBER: 'phone_number',
    OTP_REQUESTED_AT: 'requested_at',
  };

  export const OTP_SETTINGS_TABLE_FIELDS = {
    ID: 'id',
    TIME_UNIT: 'time_unit',
    TIME_UNITS_COUNT: 'time_units_count',
    MAX_OTP_ATTEMPTS: 'max_otp_attempts',
    LAST_UPDATED: 'last_updated',
    CEITERIA_STATUS: 'criteria_status',
  };