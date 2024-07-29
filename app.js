const clientId = '62e3748b-2ee5-4c05-92d5-5c4316ed2acf'; // Azureポータルで取得したクライアントID
const redirectUri = 'https://hkdito.github.io/pwa-outlook-notifications/'; // GitHub PagesのURL
const scopes = 'openid profile User.Read Calendars.Read';

function getAuthToken() {
  console.log("Redirecting to auth URL");
  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}`;
  window.location.href = authUrl;
}

function getTokenFromUrl() {
  const hash = window.location.hash;
  console.log("Hash:", hash);
  const params = new URLSearchParams(hash.replace('#', '?'));
  const token = params.get('access_token');
  console.log("Access Token:", token);
  return token;
}

const token = getTokenFromUrl();
if (token) {
  console.log("Token found, fetching calendar events...");
  getCalendarEvents(token);
} else {
  console.log("No token found.");
}

function getCalendarEvents(token) {
  console.log("Fetching calendar events with token:", token);
  fetch('https://graph.microsoft.com/v1.0/me/events', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    console.log("Events data:", data);
    if (data && data.value) {
      displayEvents(data.value);
      scheduleNotifications(data.value);
    } else {
      console.log("No events found.");
    }
  })
  .catch(error => {
    console.error("Error fetching events:", error);
  });
}

function displayEvents(events) {
  const eventList = document.getElementById('eventList');
  eventList.innerHTML = ''; // 既存のイベントをクリア
  events.forEach(event => {
    const listItem = document.createElement('li');
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' };
    const formattedStart = start.toLocaleString('ja-JP', options);
    const formattedEnd = end.toLocaleString('ja-JP', options);
    listItem.textContent = `${event.subject} - ${formattedStart} - ${formattedEnd}`;
    eventList.appendChild(listItem);
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

requestNotificationPermission();
