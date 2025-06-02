export const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 6;
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    // const hasNumber = /\d/.test(pwd);
    // const hasUpperCase = /[A-Z]/.test(pwd);
    // const hasLowerCase = /[a-z]/.test(pwd);

    return {
      isValid: minLength && hasSymbol,
      errors: {
        minLength: !minLength,
        hasSymbol: !hasSymbol,
        // hasNumber: !hasNumber,
        // hasUpperCase: !hasUpperCase,
        // hasLowerCase: !hasLowerCase
      }
    };
  };