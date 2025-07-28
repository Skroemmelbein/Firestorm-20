interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface HttpResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<any>;
  text: () => Promise<string>;
}

export async function httpRequest(url: string, options: RequestOptions = {}): Promise<HttpResponse> {
  if (window.location.href.includes('@')) {
    console.log('Credential-embedded environment detected, using XMLHttpRequest');
    return xmlHttpRequest(url, options);
  }
  
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (error instanceof TypeError && (
      error.message.includes('credentials') || 
      error.message.includes('Request cannot be constructed from a URL that includes credentials')
    )) {
      console.log('Fetch failed due to credentials, falling back to XMLHttpRequest');
      return xmlHttpRequest(url, options);
    }
    throw error;
  }
}

function xmlHttpRequest(url: string, options: RequestOptions): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || 'GET', url, true);
    
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }
    
    xhr.onload = () => {
      const response: HttpResponse = {
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        json: async () => JSON.parse(xhr.responseText),
        text: async () => xhr.responseText
      };
      resolve(response);
    };
    
    xhr.onerror = () => reject(new Error('XMLHttpRequest failed'));
    xhr.send(options.body);
  });
}
