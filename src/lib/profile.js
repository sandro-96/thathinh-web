/** Sau đăng nhập/đăng ký — profile chưa đủ thì vào onboarding */
export function getPostAuthPath(profileComplete) {
  return profileComplete ? "/topics" : "/profile?onboarding=1";
}

export function isProfileComplete(user) {
  return Boolean(user?.profileComplete);
}
