export async function getData(key: string) {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI.getData(key);
  } else {
    // Fallback to localStorage for web version
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
}

export async function saveData(key: string, data: any) {
  if (typeof window !== 'undefined' && window.electronAPI) {
    await window.electronAPI.saveData(key, data);
  } else {
    // Fallback to localStorage for web version
    localStorage.setItem(key, JSON.stringify(data));
  }
}