import { notification } from 'antd';

export function dispatchPlaygroundEvent(document, eventType, detail) {
  const myEvent = new CustomEvent('__cubejsPlaygroundEvent', {
    bubbles: true,
    composed: true,
    detail: {
      ...detail,
      eventType,
    },
  });

  document.dispatchEvent(myEvent);
}

export function fetchWithTimeout(url, options, timeout) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeout)
    ),
  ]);
}

export async function copyToClipboard(value, message = 'Copied to clipboard') {
  if (!navigator.clipboard) {
    notification.error({
      message: "Your browser doesn't support copy to clipboard",
    });
  }

  try {
    await navigator.clipboard.writeText(value);
    notification.success({
      message,
    });
  } catch (e) {
    notification.error({
      message: "Can't copy to clipboard",
      description: e,
    });
  }
}
