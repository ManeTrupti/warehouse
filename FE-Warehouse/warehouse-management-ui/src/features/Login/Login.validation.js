export const LOGIN_FIELD_NAMES = {
    email: "email",
    password: "password",
  };
  
  export function getLoginInitialValues(overrides = {}) {
    return {
      [LOGIN_FIELD_NAMES.email]: "",
      [LOGIN_FIELD_NAMES.password]: "",
      ...overrides,
    };
  }
  
  export function validateLoginForm(values) {
    const errors = {};
    const email = values[LOGIN_FIELD_NAMES.email]?.trim() ?? "";
    const password = values[LOGIN_FIELD_NAMES.password] ?? "";
  
    if (!email) errors[LOGIN_FIELD_NAMES.email] = "Email or username is required";
    if (!password) errors[LOGIN_FIELD_NAMES.password] = "Password is required";
  
    return errors;
  }