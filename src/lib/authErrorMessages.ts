// utils/authErrorMessages.ts

export function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/invalid-email":
      return "The email address is not valid.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
      return "No account found with this email. Please sign up first.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/email-already-in-use":
      return "This email is already registered. Please login or use another email.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/popup-blocked":
      return "Popup was blocked. Please allow popups and try again.";
    case "auth/popup-closed-by-user":
      return "You closed the popup before completing sign in.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}
