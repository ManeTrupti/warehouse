import React, { useState } from "react";
import { useFormik } from "formik";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
// import { toast } from "react-toastify";
import { LoginStyles, LoginIcons } from "./Login.styled";
import { LOGIN_BG_IMAGE } from "./Login.constants";
import "./Login.effects.css";
import {
  getLoginInitialValues,
  LOGIN_FIELD_NAMES,
  validateLoginForm,
} from "./Login.validation";
import { DUMMY_USERS } from "./Login.authData";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "@shared/components/Toast";
import { useToast } from "@shared/hooks/useToast";

const Styles = LoginStyles;
const DEFAULT_AUTHENTICATED_PATH = "/inventory/dashboard";
// const DEMO_LOGIN_EMAIL = "admin@demo.com";
// const DEMO_LOGIN_PASSWORD = "Admin@123";

function BrandingCalendarIcon({ className = "w-8 h-8" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.008v.008H8V12zm4 0h.008v.008H12V12zm4 0h.008v.008H16V12z"
      />
    </svg>
  );
}

function FormField({
  id,
  name,
  type,
  label,
  placeholder,
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
  touched,
  autoComplete,
  endContent = null,
}) {
  return (
    <div>
      <label className={Styles.fieldLabel} htmlFor={id}>
        {label}
      </label>
      <div className={Styles.inputWrapper}>
        <Icon className={Styles.inputIcon} aria-hidden />
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          className={Styles.input}
        />
        {endContent}
      </div>
      {touched && error ? <p className={Styles.inputError}>{error}</p> : null}
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, showError, showSuccess, removeToast } = useToast();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const formik = useFormik({
    initialValues: getLoginInitialValues(),
    validate: validateLoginForm,
    // onSubmit: (values, helpers) => {
    //   const email = values[LOGIN_FIELD_NAMES.email];
    //   const password = values[LOGIN_FIELD_NAMES.password];

    //   if (email === DEMO_LOGIN_EMAIL && password === DEMO_LOGIN_PASSWORD) {
    //     toast.success("Login successful.");
    //     const from = location.state?.from?.pathname ?? DEFAULT_AUTHENTICATED_PATH;
    //     navigate(from, { replace: true });
    //     return;
    //   }

    // toast.error("Invalid credentials. Please use the demo login.");
    //   helpers.setSubmitting(false);
    // },
onSubmit: (values, helpers) => {
  const email = values[LOGIN_FIELD_NAMES.email];
  const password = values[LOGIN_FIELD_NAMES.password];

  const user = DUMMY_USERS.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    //show success toast
    showSuccess("Login successful ");

    localStorage.setItem("userRole", user.role);
    localStorage.setItem("isAuthenticated", "true");

    const ROLE_ROUTES = {
      admin: "/stock-requests",
      manager: "/stock-requests",
      operator: "/rack-allocation",
    };

    //  delay navigation toast visible
    setTimeout(() => {
      navigate(
        ROLE_ROUTES[user.role] || DEFAULT_AUTHENTICATED_PATH,
        { replace: true }
      );
    }, 800); 

    return;
  }

  //invalid credentials
  helpers.setTouched({
    [LOGIN_FIELD_NAMES.email]: true,
    [LOGIN_FIELD_NAMES.password]: true,
  });

  helpers.setErrors({
    [LOGIN_FIELD_NAMES.password]: "Invalid email or password",
  });

  // showError("Invalid credentials ");

  helpers.setSubmitting(false);
}
  });

  return (
    <div className={Styles.pageContainer}>
      <div
        className={Styles.backgroundImage}
        style={{ backgroundImage: `url(${LOGIN_BG_IMAGE})` }}
        aria-hidden
      />
      <div className={Styles.overlay} aria-hidden />
      <div className={Styles.overlayRightShade} aria-hidden />
      <span className={Styles.decorativeOrbTopLeft} aria-hidden />
      <span className={Styles.decorativeOrbBottomRight} aria-hidden />
      <span className={Styles.decorativeOrbCenter} aria-hidden />

      <div className={Styles.contentWrapper}>
        <div className={Styles.card}>
          <div className={Styles.brandingPanel}>
            <div className={Styles.brandingPanelPattern} aria-hidden />
            <span className={Styles.brandingPanelBlob} aria-hidden />
            <div className={Styles.brandingContent}>
              <div className={Styles.logoWrapper}>
                <BrandingCalendarIcon className={Styles.logoIcon} />
              </div>
              <h1 className={Styles.brandingTitle}>Warehouse Management</h1>
              <p className={Styles.brandingSubtitle}>
                Manage production plans, resources, and schedules in one place
              </p>
            </div>
          </div>

          <div className={Styles.formPanel}>
            <div className={Styles.formPanelAccent} aria-hidden />
            <div className={Styles.formPanelInner}>
              <div className={Styles.formHeader}>
                <h2 className={Styles.formTitle}>Login</h2>
                <p className={Styles.formSubtitle}>
                  Enter your credentials to access
                </p>
              </div>

              <form
                className={Styles.form}
                onSubmit={formik.handleSubmit}
                noValidate
              >
                <div className={Styles.formFieldsGroup}>
                  <FormField
                    id="login-email"
                    name={LOGIN_FIELD_NAMES.email}
                    type="email"
                    label="Email or username"
                    placeholder="you@company.com"
                    value={formik.values[LOGIN_FIELD_NAMES.email]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    icon={LoginIcons.email}
                    autoComplete="username"
                    touched={formik.touched[LOGIN_FIELD_NAMES.email]}
                    error={formik.errors[LOGIN_FIELD_NAMES.email]}
                  />

                  <FormField
                    id="login-password"
                    name={LOGIN_FIELD_NAMES.password}
                    type={isPasswordVisible ? "text" : "password"}
                    label="Password"
                    placeholder="••••••••"
                    value={formik.values[LOGIN_FIELD_NAMES.password]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    icon={LoginIcons.password}
                    autoComplete="current-password"
                    touched={formik.touched[LOGIN_FIELD_NAMES.password]}
                    error={formik.errors[LOGIN_FIELD_NAMES.password]}
                    endContent={
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible((v) => !v)}
                        className={Styles.passwordToggleButton}
                        aria-label={
                          isPasswordVisible ? "Hide password" : "Show password"
                        }
                      >
                        {isPasswordVisible ? (
                          <EyeSlashIcon className={Styles.passwordToggleIcon} />
                        ) : (
                          <EyeIcon className={Styles.passwordToggleIcon} />
                        )}
                      </button>
                    }
                  />
                </div>

                <div className={Styles.formActions}>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <a href="#forgot" className={Styles.forgotPasswordLink}>
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className={Styles.submitButton}
                  >
                    Login
                    <ArrowRightIcon className="w-5 h-5 shrink-0" aria-hidden />
                  </button>
                </div>
              </form>

              <p className={Styles.formFooter}>
                Don&apos;t have an account?{" "}
                <a href="#signup" className={Styles.formFooterLink}>
                  Contact admin
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
