const clientId = '62e3748b-2ee5-4c05-92d5-5c4316ed2acf'; // Azureポータルで取得したクライアントIDを入力
const redirectUri = 'https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME'; // GitHub PagesのURLを設定
const scopes = 'openid profile User.Read Calendars.Read';

function getAuthToken() {
  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}`;
  window.location.href = authUrl;
}

function getTokenFromUrl() {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.replace('#', '?'));
  return params.get('access_token');
}

const token = getTokenFromUrl();
if (token) {
  getCalendarEvents(token);
}

function getCalendarEvents(token) {
  fetch('https://graph.microsoft.com/v1.0/me/events', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    scheduleNotifications(data.value);
  });
}

function scheduleNotifications(events) {
  events.forEach(event => {
    const eventTime = new Date(event.start.dateTime).getTime();
    const now = new Date().getTime();
    const delay = eventTime - now - (10 * 60 * 1000); // 10分前に通知

    if (delay > 0) {
      setTimeout(() => sendNotification(event), delay);
    }
  });
}

function sendNotification(event) {
  const notificationOptions = {
    body: `イベント: ${event.subject}`,
    icon: 'icon.png'
  };
  new Notification('予定表の通知', notificationOptions);
}

function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      }
    });
  }
}
