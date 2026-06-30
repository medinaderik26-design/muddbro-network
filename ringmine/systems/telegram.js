// ============================================================
// RING MINE — systems/telegram.js
// All Telegram WebApp API calls isolated here
// ============================================================

const tg = window.Telegram?.WebApp || null;

function init() {
  if (!tg) return;
  tg.expand();
  tg.ready?.();
  tg.setHeaderColor?.("#080310");
  tg.setBackgroundColor?.("#080310");
  tg.setBottomBarColor?.("#060310");
  tg.disableVerticalSwipes?.();
  tg.MainButton?.hide();
  tg.SecondaryButton?.hide();
}

function getUser() {
  if (!tg) return { id: "local", first_name: "Miner", username: "local" };
  return tg.initDataUnsafe?.user || { id: "unknown", first_name: "Miner", username: "" };
}

function haptic(type = "light") {
  // type: light | medium | heavy | rigid | soft
  tg?.HapticFeedback?.impactOccurred?.(type);
}

function hapticNotification(type = "success") {
  // type: success | warning | error
  tg?.HapticFeedback?.notificationOccurred?.(type);
}

function closeApp() {
  tg?.close?.();
}

function isAvailable() {
  return !!tg;
}

export { init, getUser, haptic, hapticNotification, closeApp, isAvailable };
