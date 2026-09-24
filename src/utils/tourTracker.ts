// Utility to manage onboarding tour eligibility per account
// Ensures the onboarding tour ONLY automatically appears for first-time user accounts

export function getEffectiveAccountKey(customEmailOrUid?: string | null): string {
  if (customEmailOrUid && typeof customEmailOrUid === 'string' && customEmailOrUid.trim()) {
    return customEmailOrUid.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  }

  try {
    const savedMock = localStorage.getItem('mystair_mock_user');
    if (savedMock) {
      const parsed = JSON.parse(savedMock);
      const id = parsed.email || parsed.uid;
      if (id) return id.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    }
  } catch (e) {}

  return 'local_user';
}

/**
 * Called when a user successfully logs in.
 * Returns true if this is the account's first time using the app.
 * Returns false if this account has logged in 2, 3 or more times.
 */
export function recordAccountLogin(accountIdentifier?: string | null): boolean {
  const key = getEffectiveAccountKey(accountIdentifier);
  const countKey = `mystair_login_count_${key}`;
  const seenKey = `mystair_guide_seen_${key}`;

  const currentCount = parseInt(localStorage.getItem(countKey) || '0', 10);
  const alreadySeen = localStorage.getItem(seenKey) === 'true';

  // Check if this account already has saved profile/diary data (indicates existing/returning user)
  const hasExistingData = Boolean(
    localStorage.getItem(`mystair_mypage_data_${key}`) ||
    localStorage.getItem(`mystair_user_profile_${key}`)
  );

  if (currentCount === 0 && !alreadySeen && !hasExistingData) {
    // Brand new first-time account login!
    localStorage.setItem(countKey, '1');
    sessionStorage.setItem('mystair_auto_start_tour', 'true');
    return true;
  } else {
    // 2nd, 3rd or more time account login!
    const newCount = currentCount > 0 ? currentCount + 1 : 2;
    localStorage.setItem(countKey, String(newCount));
    // Strictly prevent auto-start for returning accounts
    sessionStorage.removeItem('mystair_auto_start_tour');
    return false;
  }
}

/**
 * Checks if the current account should be automatically presented with the onboarding tour.
 */
export function isTourAllowedForCurrentAccount(customEmailOrUid?: string | null): boolean {
  const key = getEffectiveAccountKey(customEmailOrUid);
  const countKey = `mystair_login_count_${key}`;
  const seenKey = `mystair_guide_seen_${key}`;

  const currentCount = parseInt(localStorage.getItem(countKey) || '0', 10);
  const alreadySeen = localStorage.getItem(seenKey) === 'true';

  // If the account has logged in 2, 3, or more times, or has already seen the guide, return false
  if (currentCount > 1 || alreadySeen) {
    return false;
  }

  // Must have auto_start flag set from first login
  return sessionStorage.getItem('mystair_auto_start_tour') === 'true';
}

/**
 * Marks the tour as seen/completed for the current account so it is never shown again automatically.
 */
export function markTourCompletedForCurrentAccount(customEmailOrUid?: string | null) {
  const key = getEffectiveAccountKey(customEmailOrUid);
  localStorage.setItem(`mystair_guide_seen_${key}`, 'true');
  localStorage.setItem('mystair_seen_guide_onboarding', 'true');
  sessionStorage.removeItem('mystair_auto_start_tour');
}
